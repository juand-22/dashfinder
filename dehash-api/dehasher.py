
from __future__ import annotations

import argparse
import hashlib
import re
import shutil
import sys
import time
from collections.abc import Callable, Sequence
from dataclasses import dataclass
from pathlib import Path
from typing import Any

WORDLIST_PATH = Path(__file__).resolve().parent / "wordlist.txt"

# Algoritmo según el largo del hash hexadecimal.
HEX_ALGORITHMS: dict[int, tuple[str, ...]] = {
    32: ("md5",),
    40: ("sha1",),
    56: ("sha224",),
    64: ("sha256",),
    96: ("sha384",),
    128: ("sha512",),
}

SUPPORTED_ALGORITHMS = tuple(
    algorithm for algorithms in HEX_ALGORITHMS.values() for algorithm in algorithms
)

# Largo esperado por algoritmo.
ALGORITHM_LENGTHS: dict[str, int] = {
    algorithm: length
    for length, algorithms in HEX_ALGORITHMS.items()
    for algorithm in algorithms
}

# Alias que pueden venir en el hash; `sha` se resuelve por el largo.
ALGORITHM_ALIASES: dict[str, tuple[str, ...]] = {
    **{algorithm: (algorithm,) for algorithm in ALGORITHM_LENGTHS},
    "sha": ("sha256", "sha1"),
}

# Recetas con sal, en orden de probabilidad.
SALT_RECIPES: dict[str, str] = {
    "sal+pw": "hash(sal + pw)",
    "pw+sal": "hash(pw + sal)",
    "hashhex+sal": "hash(hash_hex(pw) + sal)",
    "sal+hashhex": "hash(sal + hash_hex(pw))",
    "hashraw+sal": "hash(hash_raw(pw) + sal)",
}

# Formatos que todavía no se atacan.
UNSUPPORTED_KINDS = {
    "$2a$": "bcrypt",
    "$2b$": "bcrypt",
    "$2x$": "bcrypt",
    "$2y$": "bcrypt",
    "$argon2": "argon2",
    "$scrypt$": "scrypt",
    "$pbkdf2": "pbkdf2",
}

HEX_RE = re.compile(r"\A[0-9a-fA-F]+\Z")


@dataclass
class DehashResult:
    password: str | None
    algorithm: str | None
    kind: str
    candidates: int
    elapsed: float
    recipe: str | None = None
    salt: str | None = None
    tolerant: bool = False
    missing_position: int | None = None
    missing_char: str | None = None


def is_supported_hash(value: str) -> bool:
    """True si es un hash hexadecimal soportado."""
    return bool(HEX_RE.match(value)) and len(value) in HEX_ALGORITHMS


def detect_kind(hash_value: str) -> str:
    """Tipo de hash según su formato."""
    value = hash_value.strip()

    if is_supported_hash(value):
        return HEX_ALGORITHMS[len(value)][0]

    for prefix, kind in UNSUPPORTED_KINDS.items():
        if value.startswith(prefix):
            return kind

    if value.count("$") >= 2:
        return "salado"  # con sal en el mismo string: algo$sal$hash

    return "desconocido"


def normalize_algorithms(token: str) -> tuple[str, ...]:
    """Normaliza el nombre del algoritmo."""
    return ALGORITHM_ALIASES.get(re.sub(r"[^a-z0-9]", "", token.lower()), ())


def split_formats(value: str) -> tuple[str, str | None, str | None]:
    """Separa `hash:sal` y `ALGO$sal$hash` en `(hash, algoritmo, sal)`."""
    parts = value.split("$")

    if len(parts) > 1 and not parts[0]:
        parts = parts[1:]  # `$SHA$sal$hash` (AuthMe)

    if len(parts) == 3:
        candidates = normalize_algorithms(parts[0])

        for candidate in candidates:
            expected = ALGORITHM_LENGTHS[candidate]

            for index in (2, 1):
                if len(parts[index]) == expected and is_supported_hash(parts[index]):
                    return parts[index], candidate, parts[3 - index]

        if candidates:
            # Se devuelve igual para que el error indique el largo esperado.
            return parts[2], candidates[0], parts[1]

    left, separator, right = value.partition(":")

    if separator:
        if is_supported_hash(left):
            return left, None, right

        if is_supported_hash(right):
            return right, None, left

    return value, None, None


def missing_char_index(digest: bytes, target: str) -> int | None:
    """Posición 0-based del carácter que falta en `target`, o None."""
    hexdigest = digest.hex()
    index = 0

    while index < len(target) and hexdigest[index] == target[index]:
        index += 1

    if hexdigest[index + 1 :] == target[index:]:
        return index

    return None


def describe(hash_value: str, recipes: Sequence[str] | None = None) -> list[str]:
    """Explica el formato del hash sin escanear (`--info`)."""
    original = hash_value.strip()
    target, algorithm, salt = split_formats(original)

    if algorithm is not None:
        formato = (
            "$algoritmo$sal$hash (AuthMe)"
            if original.startswith("$")
            else "algoritmo$sal$hash"
        )
    elif salt is not None:
        formato = "hash:sal (o sal:hash: el orden se deduce solo)"
    else:
        formato = "hash suelto"

    lines = [f"  formato   : {formato}"]

    if algorithm is not None:
        lines.append(f"  algoritmo : {algorithm} (viene en el propio string)")
    elif is_supported_hash(target.lower()):
        lines.append(
            f"  algoritmo : {HEX_ALGORITHMS[len(target)][0]} (deducido del largo)"
        )
    else:
        lines.append(f"  algoritmo : ninguno, el formato es '{detect_kind(target)}'")

    if salt is None:
        lines.append("  sal       : (ninguna)")
    else:
        lines.append(f"  sal       : {salt} ({len(salt)} caracteres)")

    if not HEX_RE.match(target):
        lines.append(f"  hash      : {target} no es hexadecimal")
    elif algorithm is None:
        lines.append(f"  hash      : {len(target)} caracteres hexadecimales")
    else:
        expected = ALGORITHM_LENGTHS[algorithm]
        diferencia = len(target) - expected

        if diferencia == 0:
            lines.append(
                f"  hash      : {len(target)} caracteres hexadecimales "
                f"(ok para {algorithm})"
            )
        elif diferencia == -1:
            lines.append(
                f"  hash      : {len(target)} caracteres hexadecimales "
                f"(a un {algorithm.upper()} le falta 1: se busca igual)"
            )
        else:
            lines.append(
                f"  hash      : {len(target)} caracteres hexadecimales "
                f"(un {algorithm.upper()} tiene {expected})"
            )

    if salt is not None:
        selected = tuple(recipes) if recipes else tuple(SALT_RECIPES)
        lines.append(f"  recetas   : {', '.join(selected)}")

    return lines


def plain_check(hasher: Any) -> Callable[[bytes], bytes]:
    """Digest de la palabra tal cual (hash sin sal)."""
    return lambda word: hasher(word).digest()


def salt_check(recipe: str, hasher: Any, salt: bytes) -> Callable[[bytes], bytes]:
    """Digest según la receta y la sal."""

    def inner(word: bytes) -> bytes:
        return hasher(word).digest()

    if recipe == "sal+pw":
        return lambda word: hasher(salt + word).digest()

    if recipe == "pw+sal":
        return lambda word: hasher(word + salt).digest()

    if recipe == "hashhex+sal":
        return lambda word: hasher(inner(word).hex().encode() + salt).digest()

    if recipe == "sal+hashhex":
        return lambda word: hasher(salt + inner(word).hex().encode()).digest()

    if recipe == "hashraw+sal":
        return lambda word: hasher(inner(word) + salt).digest()

    raise ValueError(
        f"Receta con sal desconocida: {recipe}. "
        f"Opciones: {', '.join(SALT_RECIPES)}"
    )


def dehash(
    hash_value: str,
    wordlist: Path | str = WORDLIST_PATH,
    algorithm: str | None = None,
    salt: str | None = None,
    recipes: Sequence[str] | None = None,
    progress: Callable[[float, int, float], None] | None = None,
) -> DehashResult:
    """Busca `hash_value` en `wordlist` y devuelve el resultado.

    `progress` recibe (fracción, intentos, segundos) cada ~0,15 s.
    """
    target, embedded_algorithm, embedded_salt = split_formats(hash_value.strip())

    if algorithm is None:
        algorithm = embedded_algorithm

    if salt is None:
        salt = embedded_salt

    if salt is None and recipes:
        raise ValueError(
            "Se pidieron recetas con sal pero no hay sal: indícala aparte o "
            "dentro del propio hash (hash:sal, ALGO$sal$hash)."
        )

    # La sal es sensible a mayúsculas: solo se normaliza el hash.
    target = target.lower()
    kind = detect_kind(target)

    if algorithm is not None:
        algorithms = (algorithm.strip().lower(),)
    elif HEX_RE.match(target):
        algorithms = HEX_ALGORITHMS.get(len(target), ())
    else:
        algorithms = ()

    if not algorithms:
        return DehashResult(
            password=None, algorithm=None, kind=kind, candidates=0, elapsed=0.0
        )

    if not HEX_RE.match(target):
        raise ValueError("El hash no es hexadecimal.")

    hashers: list[tuple[str, Any]] = []
    tolerant = False

    for name in algorithms:
        try:
            hasher = getattr(hashlib, name)
            digest_size = hasher().digest_size
        except (AttributeError, TypeError):
            raise ValueError(f"Algoritmo no soportado: {name}") from None

        expected = digest_size * 2

        if expected == len(target):
            hashers.append((name, hasher))
            continue

        if expected - 1 == len(target):
            # Hash con un carácter de menos: se busca igual.
            tolerant = True
            kind = name  # el formato ya decía qué algoritmo era
            hashers.append((name, hasher))
            continue

        raise ValueError(
            f"El hash tiene {len(target)} caracteres hexadecimales, "
            f"no {expected} (un {name.upper()})."
        )

    checks: list[tuple[str, str | None, Callable[[bytes], bytes]]] = []

    if salt is None:
        checks = [(name, None, plain_check(hasher)) for name, hasher in hashers]
    else:
        selected = tuple(recipes) if recipes else tuple(SALT_RECIPES)

        for recipe in selected:
            if recipe not in SALT_RECIPES:
                raise ValueError(
                    f"Receta con sal desconocida: {recipe}. "
                    f"Opciones: {', '.join(SALT_RECIPES)}"
                )

        salt_bytes = salt.encode()

        for name, hasher in hashers:
            for recipe in selected:
                checks.append((name, recipe, salt_check(recipe, hasher, salt_bytes)))

    # Con un carácter de menos el largo es impar: se compara como texto.
    if len(target) % 2:
        target_digest = None
    else:
        target_digest = bytes.fromhex(target)

    total_bytes = Path(wordlist).stat().st_size
    candidates = 0
    position = 0
    last_report = 0.0
    started = time.perf_counter()

    with Path(wordlist).open("rb") as file:
        for line in file:
            position += len(line)
            candidate = line.rstrip(b"\r\n")

            if not candidate:
                continue

            candidates += 1

            # Avisar cada ~0,15 s para no frenar el escaneo.
            if progress is not None and candidates % 5000 == 0:
                now = time.perf_counter()

                if now - last_report >= 0.15:
                    last_report = now
                    progress(
                        position / total_bytes if total_bytes else 1.0,
                        candidates,
                        now - started,
                    )

            for name, recipe, check in checks:
                digest = check(candidate)

                if tolerant:
                    missing = missing_char_index(digest, target)
                    found = missing is not None
                else:
                    missing = None
                    found = digest == target_digest

                if not found:
                    continue

                return DehashResult(
                    password=candidate.decode("utf-8", "replace"),
                    algorithm=name,
                    kind=kind,
                    candidates=candidates,
                    elapsed=time.perf_counter() - started,
                    recipe=recipe,
                    salt=salt,
                    tolerant=tolerant,
                    missing_position=missing + 1 if missing is not None else None,
                    missing_char=digest.hex()[missing] if missing is not None else None,
                )

    return DehashResult(
        password=None,
        algorithm=None,
        kind=kind,
        candidates=candidates,
        elapsed=time.perf_counter() - started,
        salt=salt,
        tolerant=tolerant,
    )


def format_number(value: int) -> str:
    """1234567 -> 1.234.567."""
    return f"{value:,}".replace(",", ".")


def format_duration(seconds: float) -> str:
    """12.4 -> 12,4s | 74 -> 1m 14s."""
    if seconds < 60:
        return f"{seconds:.1f}s".replace(".", ",")

    minutes, rest = divmod(int(seconds), 60)
    return f"{minutes}m {rest:02d}s"


class ProgressLine:
    """Progreso en una línea de stderr: se reescribe en TTY o se imprime cada 25 %."""

    def __init__(self, label: str, stream: Any = None) -> None:
        self.label = label if len(label) <= 20 else f"{label[:17]}..."
        self.stream = stream if stream is not None else sys.stderr
        self.tty = self.stream.isatty()
        self.width = 0
        self.next_step = 0.25

    def update(self, fraction: float, candidates: int, elapsed: float) -> None:
        text = self._text(fraction, candidates, elapsed)

        if not self.tty:
            if fraction < self.next_step:
                return

            self.next_step = fraction + 0.25
            self.stream.write(f"{text}\n")
            self.stream.flush()
            return

        columns = shutil.get_terminal_size((100, 24)).columns
        text = text[: max(columns - 1, 24)]
        self.width = max(self.width, len(text))
        self.stream.write("\r" + text.ljust(self.width))
        self.stream.flush()

    def finish(self) -> None:
        """Borra la línea de progreso para no pisar el resultado."""
        if self.tty and self.width:
            self.stream.write("\r" + " " * self.width + "\r")
            self.stream.flush()
            self.width = 0

    def _text(self, fraction: float, candidates: int, elapsed: float) -> str:
        rate = candidates / elapsed if elapsed > 0 else 0.0

        if fraction > 0:
            remaining = elapsed * (1 - fraction) / fraction
        else:
            remaining = 0.0

        return (
            f"  {self.label}  {fraction * 100:3.0f}% | "
            f"{format_number(candidates)} intentos | "
            f"{format_number(int(rate))}/s | restan ~{format_duration(remaining)}"
        )


def main(argv: list[str] | None = None) -> int:
    # Forzar UTF-8 en la salida (consola de Windows).
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", errors="replace")

    parser = argparse.ArgumentParser(
        description="Busca la contraseña en texto plano de uno o más hashes.",
        epilog=(
            "recetas de --salt-format (por defecto se prueban todas):\n  "
            + "\n  ".join(
                f"{name:<12} {formula}" for name, formula in SALT_RECIPES.items()
            )
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("hashes", nargs="+", help="hash(es) a dehashear")
    parser.add_argument(
        "-w",
        "--wordlist",
        type=Path,
        default=WORDLIST_PATH,
        help=f"wordlist a usar (por defecto: {WORDLIST_PATH.name})",
    )
    parser.add_argument(
        "-a",
        "--algo",
        help="forzar el algoritmo (md5, sha1, sha256...) en vez de deducirlo",
    )
    parser.add_argument(
        "-s",
        "--salt",
        help="sal del registro: se prueban las recetas típicas con esa sal",
    )
    parser.add_argument(
        "-f",
        "--salt-format",
        help="receta(s) con sal a probar, separadas por coma (por defecto: todas)",
    )
    parser.add_argument(
        "--no-progress",
        action="store_true",
        help="no mostrar el avance del escaneo (útil al redirigir la salida)",
    )
    parser.add_argument(
        "-i",
        "--info",
        action="store_true",
        help="explicar el formato y los largos de cada hash, sin escanear",
    )
    args = parser.parse_args(argv)

    if not args.wordlist.is_file():
        print(f"No se encontró la wordlist: {args.wordlist}", file=sys.stderr)
        return 1

    recipes = None
    if args.salt_format:
        recipes = [part.strip() for part in args.salt_format.split(",") if part.strip()]

    for index, hash_value in enumerate(args.hashes):
        target = hash_value.strip()

        if args.info:
            print(target, flush=True)
            print("\n".join(describe(target, recipes)), flush=True)

            if index < len(args.hashes) - 1:
                print(flush=True)

            continue

        progress = ProgressLine(target)

        if args.no_progress:
            report = None
        else:
            report = progress.update

        try:
            result = dehash(
                target, args.wordlist, args.algo, args.salt, recipes, report
            )
        except ValueError as error:
            progress.finish()
            print(f"{target}  ->  {error}", flush=True)
            continue

        progress.finish()

        if (
            result.password is None
            and result.candidates == 0
            and result.kind not in SUPPORTED_ALGORITHMS
        ):
            hint = (
                " (se soporta ALGO$sal$hash, con o sin '$' adelante)"
                if result.kind == "salado"
                else ""
            )
            print(
                f"{target}  ->  formato {result.kind} no soportado todavía{hint}",
                flush=True,
            )
            continue

        detail = []

        if result.algorithm:
            detail.append(result.algorithm)
        elif result.kind in SUPPORTED_ALGORITHMS:
            detail.append(result.kind)

        if result.missing_position is not None:
            detail.append(
                f"faltaba {result.missing_char!r} en la posición "
                f"{result.missing_position} del hash"
            )
        elif result.tolerant:
            detail.append("el hash venía con 1 carácter de menos")

        if result.recipe:
            detail.append(result.recipe)
        elif result.salt:
            tried = len(recipes) if recipes else len(SALT_RECIPES)
            detail.append(f"{tried} {'receta' if tried == 1 else 'recetas'} con sal")

        detail.append(f"{format_number(result.candidates)} intentos")
        detail.append(f"{result.elapsed:.2f}s")

        print(
            f"{target}  ->  {result.password or 'sin resultado'}  "
            f"[{' | '.join(detail)}]",
            flush=True,
        )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
