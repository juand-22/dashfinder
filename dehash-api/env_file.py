"""Carga KEY=VALOR desde .env sin dependencias externas."""

from __future__ import annotations

import os
from pathlib import Path

ENV_PATH = Path(__file__).resolve().parent / ".env"


def load_env() -> None:
    if not ENV_PATH.is_file():
        return

    for raw_line in ENV_PATH.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()

        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()

        if key.startswith("export "):
            key = key[7:].strip()

        value = value.strip()

        if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
            value = value[1:-1]

        if key:
            os.environ.setdefault(key, value)
