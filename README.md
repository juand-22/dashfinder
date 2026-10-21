# Dashfinder

Panel web para buscar jugadores y servidores de Minecraft, guardar resultados, dehashear contraseñas y administrar los nicks con los que entras a los servidores. Incluye un mod de Fabric que reporta la actividad de tus servidores al panel.

## Contenido del repositorio

| Carpeta | Qué es | Stack |
| --- | --- | --- |
| `frontend/` | Panel web | React 19, TypeScript, Vite, Tailwind |
| `backend/` | API, autenticación y base de datos | Node.js, Express, Prisma, SQLite |
| `dehash-api/` | Servicio que busca contraseñas en una wordlist | Python, FastAPI |
| `dash-mod/` | Mod de cliente para Fabric | Java 17/21, Gradle |

## Requisitos

- Node.js 22 (probado con 22.12; Vite 8 pide 20.19+ o 22.12+)
- Python 3.11 o superior
- JDK 21 (Gradle 8.8 y Minecraft 1.21; el perfil de 1.20.1 compila con release 17)
- Git

## Instalación

### 1. Backend

```powershell
cd backend
npm install
Copy-Item .env.example .env
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

En Linux o macOS cambia `Copy-Item` por `cp`.

Antes de arrancar, descarga la base de registros de Minecraft:

1. Descarga [`mc_dbs.7z`](https://www.mediafire.com/file/i4bzu23rqhjx35t/mc_dbs.7z/file).
2. Extrae `mc_dbs.db` y colócalo en `backend/`, junto a `app.db`.

El archivo está en formato 7z: usa 7-Zip o WinRAR en Windows, `7z x mc_dbs.7z` en Linux o Keka/The Unarchiver en macOS.

Luego inicia el backend:

```powershell
npm run dev
```

Queda escuchando en `http://localhost:3000`. `prisma generate` es obligatorio después de instalar porque el cliente generado no se versiona. `migrate deploy` aplica las migraciones y `db seed` crea los roles `USER` y `ADMIN`.

### 2. Frontend

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Queda en `http://localhost:5173`. En desarrollo, Vite redirige `/api` al backend indicado en `VITE_BACKEND_URL`, así que no hace falta configurar CORS para el panel local.

### 3. dehash-api

```powershell
cd dehash-api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python api.py
```

En Linux o macOS:

```bash
cd dehash-api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python api.py
```

Queda en `http://127.0.0.1:8000` y la documentación interactiva en `http://127.0.0.1:8000/docs`.

La wordlist (`dehash-api/wordlist.txt`, unos 17 MB) ya está en el repositorio. Si usas otra, indica la ruta en `DEHASH_WORDLIST` o con `--wordlist`.

### 4. Mod de Fabric

```powershell
cd dash-mod
Copy-Item .env.example .env
.\gradlew.bat build -x test
```

El jar queda en `dash-mod/build/libs/dash-mod-1.0.0+mc1.21.1.jar`.

Para usarlo:

1. Instala Fabric Loader para Minecraft 1.21.1 y la versión de Fabric API que corresponda a tu perfil (ver tabla abajo).
2. Copia el jar a la carpeta `mods` de Minecraft (`%APPDATA%\.minecraft\mods` en Windows).
3. Entra al juego y ejecuta `/dash key <tu-api-key>`. La API key se copia desde el panel, en **Configuración**; empieza con `df_`.
4. En la pantalla de servidores multijugador aparece el botón **Dash nicknames** para elegir el nick con el que entrar.

El `.env` del mod solo se usa al compilar: define la URL del backend (`DASH_API_URL`). La configuración en tiempo de ejecución vive en `.minecraft/config/dash.json` (la API key y el nick activo los maneja el propio mod).

## Variables de entorno

Los archivos `.env` reales no se versionan. En cada carpeta hay un `.env.example` que sirve de plantilla.

### Backend

| Variable | Por defecto | Descripción |
| --- | --- | --- |
| `PORT` | `3000` | Puerto HTTP |
| `DATABASE_URL` | `file:./app.db` | Base de datos de Prisma |
| `MC_DB` | `./mc_dbs.db` | Base externa de registros de Minecraft |
| `JWT_SECRET` | `default_secret` | Secreto para firmar los tokens de sesión |
| `EXPIRES_IN` | `1h` | Duración de la sesión |
| `FRONTEND_URL` | `http://localhost:5173` | Origen permitido por CORS |
| `DEHASH_API` | `http://127.0.0.1:8000` | URL de `dehash-api` |

### Frontend

| Variable | Por defecto | Descripción |
| --- | --- | --- |
| `VITE_BACKEND_URL` | `http://localhost:3000` | Destino del proxy de Vite en desarrollo |
| `VITE_API_URL` | vacío | URL base de las llamadas del navegador; vacío usa el mismo origen y el proxy |

Para producción, compila con `VITE_API_URL` apuntando al backend (por ejemplo `https://api.tudominio.com`) y pon ese mismo origen en `FRONTEND_URL` del backend.

### dehash-api

| Variable | Por defecto | Descripción |
| --- | --- | --- |
| `DEHASH_HOST` | `127.0.0.1` | Interfaz donde escucha |
| `DEHASH_PORT` | `8000` | Puerto |
| `DEHASH_WORDLIST` | `wordlist.txt` | Ruta alternativa a la wordlist |

### Mod

| Variable | Por defecto | Descripción |
| --- | --- | --- |
| `DASH_API_URL` | `http://localhost:3000/api` | URL completa del backend que se inyecta al compilar |

## Puertos

| Servicio | URL |
| --- | --- |
| Frontend | `http://localhost:5173` |
| Backend | `http://localhost:3000` |
| dehash-api | `http://127.0.0.1:8000` |
| Docs de dehash-api | `http://127.0.0.1:8000/docs` |

## Base de datos

- `backend/app.db` es la base principal. No se versiona: se crea en `backend/` al ejecutar `npx prisma migrate deploy`.
- Las migraciones están en `backend/prisma/migrations`.
- `backend/mc_dbs.db` es la base externa de registros de Minecraft. Descarga [`mc_dbs.7z`](https://www.mediafire.com/file/i4bzu23rqhjx35t/mc_dbs.7z/file) y extrae `mc_dbs.db` en `backend/` (o apunta `MC_DB` a otra ruta). No se versiona; si no existe, el backend arranca igual pero las búsquedas en esa base no devuelven registros.

Comandos útiles, desde `backend/`:

```powershell
npx prisma studio                  # ver y editar datos
npx prisma migrate dev --name x    # crear una migración nueva
npx prisma migrate deploy          # aplicar migraciones pendientes
npx prisma generate                # regenerar el cliente
```

## Compilar el mod para otras versiones

`dash-mod/build.gradle` define tres perfiles:

| Perfil | Minecraft | Fabric API | Java |
| --- | --- | --- | --- |
| `1.20-1.20.4` | 1.20.1 | 0.92.0+1.20.1 | 17 |
| `1.20.5-1.20.6` | 1.20.6 | 0.100.8+1.20.6 | 21 |
| `1.21-1.21.x` | 1.21.1 | 0.104.0+1.21.1 | 21 |

Para compilar uno solo, cambia `def activeVersion = mcVersions["..."]` y ejecuta:

```powershell
cd dash-mod
.\gradlew.bat build -x test
```

Para compilar los tres de una vez usa el script incluido:

- Windows: `.\build-all.bat`
- Linux o macOS: `./build-all.sh` (si no tiene permiso, ejecuta antes `chmod +x build-all.sh`)

Ambos compilan los tres perfiles y dejan los jars en `dash-mod/output/`.

## Uso general

1. Abre `http://localhost:5173` y crea una cuenta en **Registrar**.
2. En **Inicio** puedes buscar jugadores, servidores y perfiles de Minecraft.
3. En **Dash nicknames** guardas los nicks que quieras usar y ves sus servidores, registros y dehashes.
4. En **Dehashes** pegas hashes y consultas el historial.
5. En **Dashmod** ves la actividad que reporta el mod y en **Configuración** copias tu API key.
6. En **Tus servidores** aparecen los servidores y jugadores que reportó el mod.

## Problemas comunes

- **El panel no conecta con el backend**: revisa que el backend esté en el puerto 3000 y que `VITE_BACKEND_URL` coincida.
- **Error de CORS**: `FRONTEND_URL` tiene que ser exactamente el origen del panel, sin barra final.
- **El mod dice "API key inválida"**: copia la key completa desde Configuración; debe empezar con `df_`.
- **No se pudo leer la wordlist**: coloca `wordlist.txt` en `dehash-api/` o define `DEHASH_WORDLIST`.
- **Un servidor premium rechaza el login con nick**: es esperado. Usa el botón del nick real de tu cuenta.
- **Puerto ocupado**: cambia `PORT` en el backend o `DEHASH_PORT` en dehash-api y actualiza la URL correspondiente.

## Notas

- Todo el proyecto usa SQLite, no hace falta instalar un motor de base de datos.
- `dehash-api/wordlist.txt` se versiona a propósito para que el proyecto funcione al clonarlo.
