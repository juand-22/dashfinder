#!/usr/bin/env bash

set -u

cd "$(dirname "$0")" || exit 1

VERSIONS=("1.20-1.20.4" "1.20.5-1.20.6" "1.21-1.21.x")

mkdir -p output

if [ ! -x ./gradlew ]; then
    chmod +x ./gradlew
fi

for version in "${VERSIONS[@]}"; do
    echo
    echo "[$version] Compilando..."

    sed -i.bak "s|def activeVersion = mcVersions\[\".*\"\]|def activeVersion = mcVersions[\"$version\"]|" build.gradle
    rm -f build.gradle.bak

    if ./gradlew build -x test; then
        jar=$(ls -t build/libs/dash-mod-*.jar 2>/dev/null | head -n 1)

        if [ -z "$jar" ]; then
            echo "[$version] ERROR: no se encontró el jar"
            continue
        fi

        echo "[$version] OK - Copiando jar..."
        cp "$jar" "output/dash-$version.jar"
    else
        echo "[$version] ERROR al compilar"
    fi
done

echo
echo "Jars generados en output/"
ls output/*.jar 2>/dev/null
