@echo off
echo ========================================
echo  Compilando Dash Mod - Todas las versiones
echo ========================================

set VERSIONS=1.20-1.20.4 1.20.5-1.20.6 1.21-1.21.x

if not exist "output" mkdir output

for %%V in (%VERSIONS%) do (
    echo.
    echo [%%V] Compilando...
    powershell -Command "(Get-Content build.gradle) -replace 'def activeVersion = mcVersions\[\".*\"\]', 'def activeVersion = mcVersions[\"%%V\"]' | Set-Content build.gradle"
    call gradlew.bat build -x test 2>&1
    if errorlevel 1 (
        echo [%%V] ERROR al compilar
    ) else (
        echo [%%V] OK - Copiando jar...
        powershell -Command "Get-ChildItem build/libs -Filter 'dash-mod-*.jar' | Sort-Object LastWriteTime -Descending | Select-Object -First 1 | Copy-Item -Destination 'output/dash-%%V.jar'"
    )
)

echo.
echo ========================================
echo  Jars generados en output/
dir output\*.jar
echo ========================================
pause