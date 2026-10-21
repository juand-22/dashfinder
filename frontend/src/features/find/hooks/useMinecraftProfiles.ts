import { useEffect, useRef, useState } from "react";
import { findMinecraftProfile } from "../api/minecraft-profile.api";
import type { MinecraftProfile } from "../types";
import { minecraftUsernamePattern } from "../utils";

/** Perfiles ya consultados, por nombre en minúscula. `null` = no tiene perfil. */
export type MinecraftProfiles = Record<string, MinecraftProfile | null>;

/** Cuántas consultas a la vez: la ruta es una por nombre. */
const MAX_CONCURRENT = 4;

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Busca el perfil oficial (uuid + nombre real) de cada nick para poder mostrar
 * su cabeza. Solo consulta los nombres nuevos: los que ya resolvió quedan en el
 * cache del ref y no se vuelven a pedir.
 *
 * La clave del efecto es el texto de los nombres y no el array, porque quien
 * llama arma la lista en cada render: si dependiéramos del array, el efecto se
 * volvería a correr (y abortaría las consultas en vuelo) por cualquier cosa.
 */
export function useMinecraftProfiles(names: string[]): MinecraftProfiles {
  const [profiles, setProfiles] = useState<MinecraftProfiles>({});
  const profilesRef = useRef<MinecraftProfiles>({});
  const namesKey = Array.from(
    new Set(
      names.map(normalizeName).filter((name) => minecraftUsernamePattern.test(name)),
    ),
  ).join("|");

  useEffect(() => {
    const pending = namesKey
      ? namesKey.split("|").filter((name) => !(name in profilesRef.current))
      : [];

    if (!pending.length) return;

    const controller = new AbortController();
    let nextIndex = 0;

    async function lookupNextProfile() {
      while (nextIndex < pending.length && !controller.signal.aborted) {
        const name = pending[nextIndex++];
        let profile: MinecraftProfile | null = null;

        try {
          profile = await findMinecraftProfile(name, controller.signal);
        } catch {
          if (controller.signal.aborted) return;
          profile = null;
        }

        if (controller.signal.aborted) return;
        profilesRef.current[name] = profile;
        setProfiles((current) => ({ ...current, [name]: profile }));
      }
    }

    void Promise.all(
      Array.from({ length: Math.min(MAX_CONCURRENT, pending.length) }, () =>
        lookupNextProfile(),
      ),
    );

    return () => controller.abort();
  }, [namesKey]);

  return profiles;
}
