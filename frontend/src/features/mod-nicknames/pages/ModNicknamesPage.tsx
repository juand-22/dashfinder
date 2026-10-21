import { useRef, useState } from "react";
import { useAuth } from "../../auth/context/auth.context";
import { DashboardLayout } from "../../find/components/layout/DashboardLayout";
import { useModalAccessibility } from "../../find/hooks/useModalAccessibility";
import { useMinecraftProfiles } from "../../find/hooks/useMinecraftProfiles";
import { ModNicknameCard } from "../components/ModNicknameCard";
import { ModNicknamesToolbar } from "../components/ModNicknamesToolbar";
import { NicknameServersModal } from "../components/NicknameServersModal";
import { NicknameForm, type NicknameFormMessage } from "../components/NicknameForm";
import { useNicknames } from "../hooks/useNicknames";
import type { ModNickname } from "../types";
// Los registros de mcdbs y los dehashes reusan sus tarjetas y filtros.
import "../../dashmod/styles/DashmodPage.css";
import "../../dehashes/styles/DehashesPage.css";
import "../styles/ModNicknamesPage.css";

/** El nick que no se pudo borrar, para avisar en su propia tarjeta. */
type RemoveError = { id: number; message: string };

export function ModNicknamesPage() {
  const { user } = useAuth();
  const { state, reload, isRefreshing, add, remove } = useNicknames();
  const [value, setValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [formMessage, setFormMessage] = useState<NicknameFormMessage | null>(
    null,
  );
  const [query, setQuery] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [removeError, setRemoveError] = useState<RemoveError | null>(null);
  const [selectedNickname, setSelectedNickname] = useState<ModNickname | null>(
    null,
  );
  const nicknameModalOpener = useRef<HTMLElement | null>(null);
  const nicknames = state.status === "ready" ? state.nicknames : [];
  const profiles = useMinecraftProfiles(
    nicknames.map((nickname) => nickname.nickname),
  );
  const term = query.trim().toLowerCase();
  const visibleNicknames = term
    ? nicknames.filter((nickname) =>
        nickname.nickname.toLowerCase().includes(term),
      )
    : nicknames;
  const countLabel =
    visibleNicknames.length === nicknames.length
      ? `${nicknames.length} ${nicknames.length === 1 ? "nick" : "nicks"}`
      : `${visibleNicknames.length} de ${nicknames.length}`;

  useModalAccessibility(
    selectedNickname !== null,
    () => setSelectedNickname(null),
    nicknameModalOpener,
  );

  async function save(nickname: string) {
    const clean = nickname.trim();

    if (!clean || isSaving) return;

    setIsSaving(true);
    setFormMessage(null);

    const error = await add(clean);

    setIsSaving(false);

    if (error) {
      setFormMessage({ tone: "error", text: error });
      return;
    }

    setValue("");
    setFormMessage({
      tone: "info",
      text: `Se guardó ${clean}. Ya aparece en el menú del mod.`,
    });
  }

  async function copyNickname(nickname: ModNickname) {
    try {
      await navigator.clipboard.writeText(nickname.nickname);
      setCopyError(null);
      setCopiedId(nickname.id);
    } catch {
      setCopyError(
        "No se pudo copiar al portapapeles. Comprueba los permisos del navegador.",
      );
    }
  }

  function copyForCard(nickname: ModNickname) {
    void copyNickname(nickname);
  }

  async function removeNickname(nickname: ModNickname) {
    setRemovingId(nickname.id);
    setRemoveError(null);

    const error = await remove(nickname.id);

    setRemovingId(null);

    if (error) {
      setRemoveError({ id: nickname.id, message: error });
    }
  }

  function removeForCard(nickname: ModNickname) {
    void removeNickname(nickname);
  }

  function openForCard(nickname: ModNickname, opener: HTMLElement) {
    nicknameModalOpener.current = opener;
    setSelectedNickname(nickname);
  }

  return (
    <DashboardLayout username={user?.username} section="DASH NICKNAMES">
      <div className="modnick">
        <div className="modnick-head">
          <header className="results-heading modnick-heading">
            <div>
              <span className="section-eyebrow">DASH NICKNAMES</span>
              <h2>Nicks guardados</h2>
            </div>
            <div className="modnick-heading-actions">
              {state.status === "ready" && (
                <span className="result-count">{countLabel}</span>
              )}
              {state.status === "ready" && nicknames.length > 0 && (
                <button
                  className={`modnick-refresh${
                    isRefreshing ? " is-refreshing" : ""
                  }`}
                  type="button"
                  onClick={reload}
                  disabled={isRefreshing}
                  aria-busy={isRefreshing}
                  aria-label="Actualizar tus nicks"
                >
                  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M13 8a5 5 0 1 1-1.5-3.5M13 2v3h-3" />
                  </svg>
                  {isRefreshing ? "Actualizando" : "Actualizar"}
                </button>
              )}
            </div>
          </header>

          <p className="modnick-intro">
            Guarda nicks y mira su información registrada. Estos nicks también
            los podrás usar desde Minecraft con Dashmod.
          </p>

          <NicknameForm
            value={value}
            isSaving={isSaving}
            message={formMessage}
            onValueChange={setValue}
            onSubmit={save}
          />
        </div>

        {copyError && (
          <div className="search-message error-message" role="alert">
            <span className="message-icon" aria-hidden="true">!</span>
            <span>{copyError}</span>
          </div>
        )}

        {state.status === "loading" && (
          <section className="modnick-state" aria-live="polite">
            <span className="search-spinner" aria-hidden="true" />
            <h3>Cargando tus nicks</h3>
            <p>Trayendo los nicks guardados.</p>
          </section>
        )}

        {state.status === "error" && (
          <section className="modnick-state" role="alert">
            <h3>No se pudieron cargar los nicks</h3>
            <p>{state.message}</p>
            <button className="modnick-refresh" type="button" onClick={reload}>
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M13 8a5 5 0 1 1-1.5-3.5M13 2v3h-3" />
              </svg>
              Reintentar
            </button>
          </section>
        )}

        {state.status === "ready" && nicknames.length === 0 && (
          <section className="modnick-state">
            <h3>Todavía no guardaste ningún nick</h3>
            <p>
              Escribe un nick arriba y pulsa «Guardar nick»: queda en la lista
              para elegirlo desde el mod.
            </p>
          </section>
        )}

        {state.status === "ready" && nicknames.length > 0 && (
          <>
            <ModNicknamesToolbar query={query} onQueryChange={setQuery} />

            {visibleNicknames.length === 0 ? (
              <div className="empty-results">
                <span className="empty-search-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="10.5" cy="10.5" r="6" />
                    <path d="m15.2 15.2 4.3 4.3" />
                  </svg>
                </span>
                <h3>Sin coincidencias</h3>
                <p>Ajusta la búsqueda para ver otros nicks.</p>
              </div>
            ) : (
              <div className="results-grid modnick-grid">
                {visibleNicknames.map((nickname, index) => (
                  <ModNicknameCard
                    key={nickname.id}
                    nickname={nickname}
                    index={index}
                    profile={
                      profiles[nickname.nickname.trim().toLowerCase()] ?? null
                    }
                    copied={copiedId === nickname.id}
                    isRemoving={removingId === nickname.id}
                    removeError={
                      removeError?.id === nickname.id
                        ? removeError.message
                        : null
                    }
                    onCopy={copyForCard}
                    onRemove={removeForCard}
                    onOpen={openForCard}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {selectedNickname && (
          <NicknameServersModal
            key={selectedNickname.id}
            nickname={selectedNickname}
            profile={
              profiles[selectedNickname.nickname.trim().toLowerCase()] ?? null
            }
            onClose={() => setSelectedNickname(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
