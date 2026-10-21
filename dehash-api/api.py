
from __future__ import annotations

import argparse
import os
from dataclasses import asdict

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from dehasher import SALT_RECIPES, SUPPORTED_ALGORITHMS, DehashResult, dehash
from env_file import load_env

load_env()

app = FastAPI(
    title="dehasher",
    version="0.1",
    description="Manda un hash y te devuelve la contraseña si está en la wordlist.",
)


class DehashRequest(BaseModel):
    hash: str = Field(
        min_length=1,
        description="Hash a romper. Puede traer la sal pegada: `hash:sal` o `ALGO$sal$hash`.",
    )
    salt: str | None = Field(
        default=None, description="Sal del registro (si no viene dentro del hash)."
    )
    algo: str | None = Field(
        default=None, description="Forzar el algoritmo (md5, sha1, sha256...)."
    )
    recipes: list[str] | None = Field(
        default=None,
        description=(
            "Recetas con sal a probar. Por defecto se prueban todas: "
            f"{', '.join(SALT_RECIPES)}."
        ),
    )


class DehashResponse(BaseModel):
    hash: str = Field(description="El hash tal como se mandó.")
    found: bool = Field(description="True si se encontró la contraseña.")
    message: str = Field(description="'encontrada', 'sin resultado' o el motivo.")
    password: str | None = None
    algorithm: str | None = None
    kind: str = Field(description="Tipo detectado del hash (md5, sha256, bcrypt...).")
    recipe: str | None = Field(default=None, description="Receta con sal que dio el match.")
    salt: str | None = None
    candidates: int = Field(description="Palabras probadas.")
    elapsed: float = Field(description="Segundos que tardó.")
    tolerant: bool = Field(
        default=False, description="El hash venía con un carácter de menos."
    )
    missing_position: int | None = Field(
        default=None, description="Posición (1-based) del carácter que le falta al hash."
    )
    missing_char: str | None = Field(default=None, description="El carácter que falta.")


def message(result: DehashResult) -> str:
    """Texto corto según el resultado."""
    if result.password is not None:
        return "encontrada"

    if result.candidates == 0 and result.kind not in SUPPORTED_ALGORITHMS:
        return f"formato {result.kind} no soportado todavía"

    return "sin resultado"


@app.post("/dehash", response_model=DehashResponse, summary="Buscar la contraseña de un hash")
def dehash_hash(request: DehashRequest) -> DehashResponse:
    """Busca el hash en la wordlist."""
    try:
        result = dehash(
            request.hash,
            algorithm=request.algo,
            salt=request.salt,
            recipes=request.recipes,
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except OSError as error:
        raise HTTPException(
            status_code=500, detail=f"No se pudo leer la wordlist: {error}"
        ) from error

    return DehashResponse(
        hash=request.hash,
        found=result.password is not None,
        message=message(result),
        **asdict(result),
    )


def main() -> None:
    default_host = os.getenv("DEHASH_HOST", "127.0.0.1")
    default_port = int(os.getenv("DEHASH_PORT", "8000"))

    parser = argparse.ArgumentParser(description="Levanta la API del dehasher.")
    parser.add_argument(
        "--host",
        default=default_host,
        help=f"interfaz donde escuchar (por defecto: {default_host})",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=default_port,
        help=f"puerto (por defecto: {default_port})",
    )
    args = parser.parse_args()

    import uvicorn

    print(f"API en http://{args.host}:{args.port}/dehash   (docs: /docs)")

    uvicorn.run(app, host=args.host, port=args.port)


if __name__ == "__main__":
    main()
