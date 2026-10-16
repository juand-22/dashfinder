import { useEffect, useState } from "react";
import {
  findMinecraftProfile,
  MinecraftProfileRequestError,
} from "../api/minecraft-profile.api";
import type { MinecraftProfileLookup } from "../types";
import { minecraftUsernamePattern } from "../utils";

export function useMinecraftProfileLookup(username: string) {
  const [lookup, setLookup] = useState<MinecraftProfileLookup>({
    status: "idle",
    username: "",
  });

  useEffect(() => {
    if (!minecraftUsernamePattern.test(username)) return;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      setLookup({ status: "loading", username });
      void findMinecraftProfile(username, controller.signal)
        .then((profile) => {
          if (controller.signal.aborted) return;
          setLookup(
            profile
              ? { status: "found", username, profile }
              : { status: "not-found", username },
          );
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) return;
          setLookup({
            status: "error",
            username,
            message:
              error instanceof MinecraftProfileRequestError
                ? error.message
                : "No se pudo verificar este perfil.",
          });
        });
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [username]);

  const currentLookup: MinecraftProfileLookup = !username
    ? { status: "idle", username: "" }
    : !minecraftUsernamePattern.test(username)
      ? { status: "invalid", username }
      : lookup.username !== username
        ? { status: "loading", username }
        : lookup;

  return {
    lookup: currentLookup,
    profile: currentLookup.status === "found" ? currentLookup.profile : null,
  };
}
