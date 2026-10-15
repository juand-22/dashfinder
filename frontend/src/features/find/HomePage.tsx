import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/context/auth.context";
import { FindRequestError, searchUsers, type FindRecord } from "./find.api";
import {
  findMinecraftProfile,
  MinecraftProfileRequestError,
  type MinecraftProfile,
} from "./minecraft-profile.api";
import {
  getMinecraftServerStatus,
  MinecraftServerStatusRequestError,
  type MinecraftServerStatus,
} from "./minecraft-server-status.api";
import { findCountryByIp, type IpCountry } from "./ip-country.api";
import "./HomePage.css";

type MinecraftProfileLookup =
  | { status: "idle" | "invalid" | "loading" | "not-found"; username: string }
  | { status: "found"; username: string; profile: MinecraftProfile }
  | { status: "error"; username: string; message: string };

type MinecraftServerStatusLookup =
  | { status: "loading"; address: string }
  | { status: "loaded"; address: string; server: MinecraftServerStatus }
  | { status: "error"; address: string; message: string };

const minecraftUsernamePattern = /^[a-zA-Z0-9_]{3,16}$/;

function formatMinecraftUuid(id: string) {
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
}

function CopyButton({
  label,
  copied,
  onClick,
}: {
  label: string;
  copied: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="copy-field-button"
      type="button"
      aria-label={copied ? `${label} copiado` : `Copiar ${label}`}
      title={copied ? "Copiado" : `Copiar ${label}`}
      onClick={onClick}
    >
      {copied ? (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="m3 8.2 3.1 3.1L13 4.5" />
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="5.5" y="5.5" width="8" height="9" rx="1.5" />
          <path d="M10.5 3.5V3A1.5 1.5 0 0 0 9 1.5H3A1.5 1.5 0 0 0 1.5 3v7A1.5 1.5 0 0 0 3 11.5h.5" />
        </svg>
      )}
    </button>
  );
}

export function HomePage() {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [results, setResults] = useState<FindRecord[]>([]);
  const [revealedPasswords, setRevealedPasswords] = useState<Set<number>>(
    () => new Set(),
  );
  const [hashNotice, setHashNotice] = useState<number | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [copiedTarget, setCopiedTarget] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<{ record: FindRecord; index: number } | null>(null);
  const [modalAvatarFailed, setModalAvatarFailed] = useState(false);
  const [serverStatusLookup, setServerStatusLookup] =
    useState<MinecraftServerStatusLookup | null>(null);
  const [ipCountries, setIpCountries] = useState<Record<string, IpCountry | null>>({});
  const ipCountriesRef = useRef<Record<string, IpCountry | null>>({});
  const [resultCardOpener, setResultCardOpener] = useState<HTMLElement | null>(null);
  const [failedAvatarId, setFailedAvatarId] = useState<string | null>(null);
  const [minecraftLookup, setMinecraftLookup] = useState<MinecraftProfileLookup>({
    status: "idle",
    username: "",
  });
  const trimmedUsername = username.trim();

  useEffect(() => {
    const ips = Array.from(
      new Set(results.flatMap((record) => (record.ip ? [record.ip] : []))),
    ).filter((ip) => !(ip in ipCountriesRef.current));
    if (!ips.length) return;

    const controller = new AbortController();
    let nextIndex = 0;

    async function lookupNextIp() {
      while (nextIndex < ips.length && !controller.signal.aborted) {
        const ip = ips[nextIndex++];
        try {
          const country = await findCountryByIp(ip, controller.signal);
          if (!controller.signal.aborted) {
            ipCountriesRef.current[ip] = country;
            setIpCountries((current) => ({ ...current, [ip]: country }));
          }
        } catch {
          if (controller.signal.aborted) return;
          ipCountriesRef.current[ip] = null;
          setIpCountries((current) => ({ ...current, [ip]: null }));
        }
      }
    }

    void Promise.all(
      Array.from({ length: Math.min(4, ips.length) }, () => lookupNextIp()),
    );
    return () => controller.abort();
  }, [results]);

  useEffect(() => {
    if (!minecraftUsernamePattern.test(trimmedUsername)) return;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      setMinecraftLookup({ status: "loading", username: trimmedUsername });
      void findMinecraftProfile(trimmedUsername, controller.signal)
        .then((profile) => {
          if (controller.signal.aborted) return;
          setMinecraftLookup(
            profile
              ? { status: "found", username: trimmedUsername, profile }
              : { status: "not-found", username: trimmedUsername },
          );
        })
        .catch((lookupError: unknown) => {
          if (controller.signal.aborted) return;
          setMinecraftLookup({
            status: "error",
            username: trimmedUsername,
            message:
              lookupError instanceof MinecraftProfileRequestError
                ? lookupError.message
                : "No se pudo verificar este perfil.",
          });
        });
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [trimmedUsername]);

  const minecraftProfileState: MinecraftProfileLookup = !trimmedUsername
    ? { status: "idle", username: "" }
    : !minecraftUsernamePattern.test(trimmedUsername)
      ? { status: "invalid", username: trimmedUsername }
      : minecraftLookup.username !== trimmedUsername
        ? { status: "loading", username: trimmedUsername }
        : minecraftLookup;
  const minecraftProfile =
    minecraftProfileState.status === "found" ? minecraftProfileState.profile : null;
  const selectedServerAddress = selectedResult?.record.serverip?.trim() ?? "";

  useEffect(() => {
    if (!selectedServerAddress) return;

    const controller = new AbortController();
    void getMinecraftServerStatus(selectedServerAddress, controller.signal)
      .then((server) => {
        if (controller.signal.aborted) return;
        setServerStatusLookup({
          status: "loaded",
          address: selectedServerAddress,
          server,
        });
      })
      .catch((lookupError: unknown) => {
        if (controller.signal.aborted) return;
        setServerStatusLookup({
          status: "error",
          address: selectedServerAddress,
          message:
            lookupError instanceof MinecraftServerStatusRequestError
              ? lookupError.message
              : "No se pudo consultar el estado del servidor.",
        });
      });

    return () => controller.abort();
  }, [selectedServerAddress]);

  const selectedServerStatus =
    serverStatusLookup?.address === selectedServerAddress
      ? serverStatusLookup
      : selectedServerAddress
        ? { status: "loading" as const, address: selectedServerAddress }
        : null;

  useEffect(() => {
    if (!selectedResult) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedResult(null);
        return;
      }

      if (event.key !== "Tab") return;
      const modal = document.querySelector<HTMLElement>(".result-modal");
      const focusableElements = modal?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), [href], input:not(:disabled), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusableElements?.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = previousOverflow;
      resultCardOpener?.focus();
    };
  }, [selectedResult, resultCardOpener]);

  async function copyValue(value: string, target: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyError(null);
      setCopiedTarget(target);
    } catch {
      setCopyError("No se pudo copiar al portapapeles. Comprueba los permisos del navegador.");
    }
  }

  function copyIfPresent(value: string | null, target: string) {
    if (value !== null) void copyValue(value, target);
  }

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const searchTerm = username.trim();
    if (!searchTerm || isSearching) return;

    setError(null);
    setIsSearching(true);
    setHasSearched(false);
    setResults([]);
    setRevealedPasswords(new Set());
    setHashNotice(null);

    try {
      const records = await searchUsers(searchTerm);
      setResults(records);
      setHasSearched(true);
    } catch (searchError) {
      setError(
        searchError instanceof FindRequestError
          ? searchError.message
          : "Ocurrió un error inesperado durante la búsqueda.",
      );
    } finally {
      setIsSearching(false);
    }
  }

  function togglePassword(index: number) {
    setRevealedPasswords((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function openResult(record: FindRecord, index: number, opener: HTMLElement) {
    setModalAvatarFailed(false);
    setResultCardOpener(opener);
    setSelectedResult({ record, index });
  }

  function renderResultCard(record: FindRecord, index: number, isModal = false) {
    const isHashed =
      record.password !== null &&
      (/^\$[A-Z0-9]+\$/i.test(record.password) ||
        /^[a-f0-9]{64}(?:[a-f0-9]{64})?$/i.test(record.password));
    const hasPassword = record.password !== null;
    const isPasswordVisible = revealedPasswords.has(index);
    const serverName = record.server ?? "Servidor desconocido";
    const ipCountry = record.ip ? ipCountries[record.ip] : null;

    return (
      <article
        className={`result-card${isModal ? " result-card--modal" : " result-card--interactive"}`}
        key={`${record.name ?? "sin-usuario"}-${serverName}-${record.ip ?? "sin-ip"}-${index}`}
        tabIndex={isModal ? undefined : 0}
        aria-label={isModal ? undefined : `Ver detalles del resultado de ${record.name ?? serverName}`}
        aria-haspopup={isModal ? undefined : "dialog"}
        role={isModal ? undefined : "group"}
        onClick={
          isModal
            ? undefined
            : (event) => {
                if (event.target instanceof Element && event.target.closest("button")) return;
                openResult(record, index, event.currentTarget);
              }
        }
        onKeyDown={
          isModal
            ? undefined
            : (event) => {
                if (event.target !== event.currentTarget) return;
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openResult(record, index, event.currentTarget);
                }
              }
        }
      >
        <div className="result-card-header">
          <div className="server-avatar" aria-hidden="true">
            {serverName.slice(0, 1).toUpperCase()}
          </div>
          <div className="server-details">
            <div className="server-name-row">
              <h3>{serverName}</h3>
              {record.server !== null && (
                <CopyButton
                  label="servidor"
                  copied={copiedTarget === `${index}-server`}
                  onClick={() => copyIfPresent(record.server, `${index}-server`)}
                />
              )}
            </div>
            <span>Servidor</span>
          </div>
          <span
            className={`result-tag ${
              isHashed ? "is-hashed" : hasPassword ? "is-plain" : "is-unknown"
            }`}
          >
            {isHashed ? "Hasheada" : hasPassword ? "Sin hashear" : "Sin dato"}
          </span>
        </div>

        <dl className="result-fields">
          <div className="result-field">
            <dt>Usuario</dt>
            <dd>
              <span>{record.name ?? "—"}</span>
              {record.name !== null && (
                <CopyButton
                  label="usuario"
                  copied={copiedTarget === `${index}-name`}
                  onClick={() => copyIfPresent(record.name, `${index}-name`)}
                />
              )}
            </dd>
          </div>
          <div className="result-field">
            <dt>IP</dt>
            <dd>
              <span className="ip-address">
                {ipCountry && (
                  <img
                    className="ip-country-flag"
                    aria-label={ipCountry.country}
                    title={ipCountry.country}
                    src={`https://flagcdn.com/w40/${ipCountry.countryCode.toLowerCase()}.png`}
                    alt={`Bandera de ${ipCountry.country}`}
                    loading="lazy"
                  />
                )}
                {record.ip ?? "—"}
              </span>
              {record.ip !== null && (
                <CopyButton
                  label="IP"
                  copied={copiedTarget === `${index}-ip`}
                  onClick={() => copyIfPresent(record.ip, `${index}-ip`)}
                />
              )}
            </dd>
          </div>
          <div className="result-field">
            <dt>IP del servidor</dt>
            <dd>
              <span>{record.serverip ?? "—"}</span>
              {record.serverip !== null && (
                <CopyButton
                  label="IP del servidor"
                  copied={copiedTarget === `${index}-serverip`}
                  onClick={() => copyIfPresent(record.serverip, `${index}-serverip`)}
                />
              )}
            </dd>
          </div>
          <div className="result-field">
            <dt>Salt</dt>
            <dd className="result-monospace">
              <span>{record.salt ?? "—"}</span>
              {record.salt !== null && (
                <CopyButton
                  label="salt"
                  copied={copiedTarget === `${index}-salt`}
                  onClick={() => copyIfPresent(record.salt, `${index}-salt`)}
                />
              )}
            </dd>
          </div>
          <div className="result-field password-field">
            <dt>
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="3" y="7" width="10" height="7" rx="2" />
                <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
              </svg>
              Contraseña
            </dt>
            <dd className="password-cell">
              <div className="password-value">
                <code>
                  {isHashed && !isPasswordVisible
                    ? "••••••••••••"
                    : record.password ?? "—"}
                </code>
                {record.password !== null && (
                  <CopyButton
                    label="contraseña"
                    copied={copiedTarget === `${index}-password`}
                    onClick={() => copyIfPresent(record.password, `${index}-password`)}
                  />
                )}
              </div>
              <div className="password-actions">
                <button
                  className="password-action password-action--hash"
                  type="button"
                  disabled={!isHashed || !hasPassword}
                  onClick={() => {
                    setHashNotice(hashNotice === index ? null : index);
                    if (!isPasswordVisible) togglePassword(index);
                  }}
                >
                  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M8 2v8m0 0 3-3m-3 3L5 7" />
                    <path d="M3 10v3a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3" />
                  </svg>
                  Deshashear
                </button>
                {record.password !== null && (
                  <button
                    className="password-action password-action--copy"
                    type="button"
                    onClick={() => copyIfPresent(record.password, `${index}-password`)}
                  >
                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <rect x="5.5" y="5.5" width="8" height="9" rx="1.5" />
                      <path d="M10.5 3.5V3A1.5 1.5 0 0 0 9 1.5H3A1.5 1.5 0 0 0 1.5 3v7A1.5 1.5 0 0 0 3 11.5h.5" />
                    </svg>
                    Copiar contraseña
                  </button>
                )}
              </div>
            </dd>
          </div>
        </dl>
        {isHashed && hashNotice === index && (
          <p className="hash-notice" role="status">
            Un hash no se puede revertir para recuperar la contraseña original.
            Puedes consultar el hash mostrado, pero no deshashearlo.
          </p>
        )}
      </article>
    );
  }

  return (
    <div className="home-page">
      <aside className="sidebar">
        <Link className="home-brand" to="/" aria-label="Dashfinder, inicio">
          <span className="home-brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <path d="M7 24.5 13.4 8l4.2 10.1 2.3-5.6L25 24.5" />
              <circle cx="23.5" cy="8.5" r="2.5" />
            </svg>
          </span>
          <span>dashfinder</span>
        </Link>

        <span className="sidebar-label">MENÚ PRINCIPAL</span>
        <nav className="main-nav" aria-label="Navegación principal">
          <Link className="main-nav-link active" to="/" aria-current="page" title="Inicio">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="m2.8 8.8 7.2-6 7.2 6v8.4a.8.8 0 0 1-.8.8h-4.1v-5.2H7.7V18H3.6a.8.8 0 0 1-.8-.8V8.8Z" />
            </svg>
            <span className="main-nav-link-label">Inicio</span>
          </Link>
        </nav>

        <div className="sidebar-spacer" />
        <div className="sidebar-workspace">
          <span className="sidebar-label">TU ESPACIO</span>
          <div className="workspace-card">
            <span className="workspace-card-icon" aria-hidden="true">
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M3 5.5h14M5 3v5m10-5v5M4 9h12v7.5H4z" />
                <path d="m7 12 2 2 4-4" />
              </svg>
            </span>
            <span>
              <strong>Buscador</strong>
              <small><span className="status-dot" />Listo para explorar</small>
            </span>
          </div>
        </div>

        <div className="sidebar-divider" />
        <div className="sidebar-user" title={user?.username ?? "Cuenta activa"}>
          <span className="user-avatar" aria-hidden="true">
            {(user?.username.charAt(0) || "U").toUpperCase()}
          </span>
          <span className="sidebar-user-details">
            <strong>{user?.username}</strong>
            <small>Cuenta activa</small>
          </span>
        </div>
      </aside>

      <div className="home-workspace">
        <header className="workspace-topbar">
          <span className="topbar-path">DASHFINDER <span>/</span> INICIO</span>
          <span className="topbar-status"><span className="status-dot" />Sistema disponible</span>
        </header>

        <main className="home-content">
        <div className="dashboard-grid">
          <section className="search-panel" aria-labelledby="search-title">
            <div className="search-panel-heading">
              <div className="search-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="10.8" cy="10.8" r="6.8" />
                  <path d="m16 16 5 5" />
                </svg>
              </div>
              <div>
                <h2 id="search-title">Buscar cuentas</h2>
                <p>Busca un nombre de usuario de Minecraft.</p>
              </div>
            </div>

            <form className="search-form" onSubmit={handleSearch}>
              <label className="visually-hidden" htmlFor="username-search">
                Nombre de usuario
              </label>
              <div className="search-input-wrap">
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <circle cx="8.8" cy="8.8" r="5.8" />
                  <path d="m13.2 13.2 4.3 4.3" />
                </svg>
                <input
                  id="username-search"
                  name="username"
                  type="search"
                  autoComplete="off"
                  placeholder="Nombre de usuario de Minecraft"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                />
              </div>
              <button
                className="search-button"
                type="submit"
                disabled={isSearching || !username.trim()}
              >
                {isSearching ? (
                  <>
                    <span className="search-spinner" aria-hidden="true" />
                    Buscando...
                  </>
                ) : (
                  <>
                    Buscar
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M4 10h12m-5-5 5 5-5 5" />
                    </svg>
                  </>
                )}
              </button>
            </form>
            <p className="search-hint">
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="6.1" />
                <path d="M8 7.2v3.5m0-5.8v.2" />
              </svg>
              La búsqueda distingue coincidencias exactas.
            </p>
          </section>

          <aside
            className={`minecraft-preview minecraft-preview--${minecraftProfileState.status}`}
            aria-label="Vista previa del perfil de Minecraft"
            aria-live="polite"
          >
            <div className="preview-topline">
              <span className="preview-kicker">PERFIL DE MINECRAFT</span>
              <span className={`profile-badge profile-badge--${minecraftProfileState.status}`}>
                {minecraftProfileState.status === "found"
                  ? "PREMIUM"
                  : minecraftProfileState.status === "not-found"
                    ? "NO PREMIUM"
                    : minecraftProfileState.status === "loading"
                      ? "BUSCANDO"
                      : minecraftProfileState.status === "invalid"
                        ? "NOMBRE INVÁLIDO"
                        : minecraftProfileState.status === "error"
                          ? "NO DISPONIBLE"
                          : "LISTO"}
              </span>
            </div>

            <div className="preview-player">
              <div className="minecraft-avatar">
                {(!minecraftProfile || failedAvatarId === minecraftProfile.id) && (
                  <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
                    <path d="M15 11h34v34H15z" fill="#7b5132" />
                    <path d="M15 11h34v8H15zM19 19h8v8h-8zm18 0h8v8h-8z" fill="#b7814d" />
                    <path d="M23 30h7v5h-7zm11 0h7v5h-7z" fill="#33231d" />
                    <path d="M27 39h11v4H27z" fill="#e4c18b" />
                    <path d="M15 45h34v8H15z" fill="#463024" />
                  </svg>
                )}
                {minecraftProfile && failedAvatarId !== minecraftProfile.id && (
                  <img
                    src={`https://mc-heads.net/avatar/${minecraftProfile.id}/96`}
                    alt={`Cabeza de Minecraft de ${minecraftProfile.name}`}
                    onError={() => setFailedAvatarId(minecraftProfile.id)}
                  />
                )}
              </div>
              <div className="preview-player-details">
                <span>JUGADOR JAVA</span>
                <h2>{minecraftProfile?.name ?? (trimmedUsername || "Tu jugador")}</h2>
                <p>
                  {minecraftProfileState.status === "found"
                    ? "Perfil oficial de Minecraft encontrado"
                    : minecraftProfileState.status === "not-found"
                      ? "No se encontró un perfil Java con este nombre"
                      : minecraftProfileState.status === "loading"
                        ? "Consultando perfil oficial..."
                        : minecraftProfileState.status === "invalid"
                          ? "Usa entre 3 y 16 letras, números o _"
                          : minecraftProfileState.status === "error"
                            ? minecraftProfileState.message
                            : "Escribe un nombre para ver su perfil"}
                </p>
              </div>
            </div>

            <div className="preview-details">
              <div className="preview-detail">
                <span>Cuenta</span>
                <strong className={minecraftProfile ? "premium-value" : ""}>
                  {minecraftProfile
                    ? "Premium Java"
                    : minecraftProfileState.status === "not-found"
                      ? "Sin perfil Java"
                      : minecraftProfileState.status === "loading"
                        ? "Verificando..."
                        : "Sin verificar"}
                </strong>
              </div>
              <div className="preview-detail">
                <span>UUID</span>
                <strong className="preview-uuid">
                  {minecraftProfile ? formatMinecraftUuid(minecraftProfile.id) : "—"}
                </strong>
              </div>
            </div>

            {minecraftProfileState.status === "not-found" && (
              <p className="preview-disclaimer">
                Puede ser una cuenta Bedrock o un nombre que no existe.
              </p>
            )}
          </aside>
        </div>

        {error && (
          <div className="search-message error-message" role="alert">
            <span className="message-icon" aria-hidden="true">!</span>
            <span>{error}</span>
          </div>
        )}
        {copyError && (
          <div className="search-message error-message" role="alert">
            <span className="message-icon" aria-hidden="true">!</span>
            <span>{copyError}</span>
          </div>
        )}
        {hasSearched && (
          <section className="results-section" aria-live="polite">
            <div className="results-heading">
              <div>
                <span className="section-eyebrow">RESULTADOS</span>
                <h2>
                  {results.length
                    ? `Coincidencias para “${username.trim()}”`
                    : "Sin coincidencias"}
                </h2>
              </div>
              <span className="result-count">
                {results.length} {results.length === 1 ? "registro" : "registros"}
              </span>
            </div>

            {results.length > 0 ? (
              <div className="results-grid">
                {results.map((record, index) => renderResultCard(record, index))}
              </div>
            ) : (
              <div className="empty-results">
                <span className="empty-search-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="10.8" cy="10.8" r="6.8" />
                    <path d="m16 16 5 5M8.3 10.8h5" />
                  </svg>
                </span>
                <h3>No encontramos ese usuario</h3>
                <p>Comprueba el nombre e inténtalo de nuevo.</p>
              </div>
            )}
          </section>
        )}
        </main>
      </div>
      {selectedResult &&
        createPortal(
          <div
            className="result-modal-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setSelectedResult(null);
            }}
          >
            <section
              className="result-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="result-modal-title"
            >
              <header className="result-modal-header">
                <button
                  className="result-modal-close"
                  type="button"
                  aria-label="Cerrar detalles"
                  onClick={() => setSelectedResult(null)}
                  autoFocus
                >
                  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="m5 5 10 10M15 5 5 15" />
                  </svg>
                </button>
                <div className="result-modal-player">
                  <div className="result-modal-avatar" aria-hidden="true">
                    {selectedResult.record.name && !modalAvatarFailed ? (
                      <img
                        src={`https://mc-heads.net/avatar/${encodeURIComponent(
                          minecraftProfile?.name.toLowerCase() === selectedResult.record.name.toLowerCase()
                            ? minecraftProfile.id
                            : selectedResult.record.name,
                        )}/96`}
                        alt=""
                        onError={() => setModalAvatarFailed(true)}
                      />
                    ) : (
                      <svg viewBox="0 0 64 64" fill="none">
                        <path d="M15 11h34v34H15z" fill="#7b5132" />
                        <path d="M15 11h34v8H15zM19 19h8v8h-8zm18 0h8v8h-8z" fill="#b7814d" />
                        <path d="M23 30h7v5h-7zm11 0h7v5h-7z" fill="#33231d" />
                        <path d="M27 39h11v4H27z" fill="#e4c18b" />
                        <path d="M15 45h34v8H15z" fill="#463024" />
                      </svg>
                    )}
                  </div>
                  <div className="result-modal-player-copy">
                    <span className="result-modal-kicker">
                      <span className="status-dot" />
                      PERFIL DE MINECRAFT
                    </span>
                    <h2 id="result-modal-title">
                      {selectedResult.record.name ?? selectedResult.record.server ?? "Resultado"}
                    </h2>
                    <span className="result-modal-subtitle">Detalles del registro</span>
                  </div>
                </div>
              </header>
              <div
                className={`result-modal-content${
                  selectedServerAddress ? " result-modal-content--with-server" : ""
                }`}
              >
                {renderResultCard(selectedResult.record, selectedResult.index, true)}
                {selectedServerAddress && (
                  <section
                    className="minecraft-server-status"
                    aria-labelledby="minecraft-server-status-title"
                    aria-live="polite"
                  >
                  <div className="server-status-heading">
                    <div>
                      <span className="section-eyebrow">ESTADO ACTUAL</span>
                      <h3 id="minecraft-server-status-title">Servidor de Minecraft</h3>
                    </div>
                    <span
                      className={`server-status-badge server-status-badge--${
                        selectedServerStatus?.status === "loaded"
                          ? selectedServerStatus.server.online
                            ? "online"
                            : "offline"
                          : selectedServerStatus?.status ?? "loading"
                      }`}
                    >
                      {selectedServerStatus?.status === "loaded"
                        ? selectedServerStatus.server.online
                          ? "EN LÍNEA"
                          : "DESCONECTADO"
                        : selectedServerStatus?.status === "error"
                          ? "NO DISPONIBLE"
                          : "CONSULTANDO"}
                    </span>
                  </div>

                  {selectedServerStatus?.status === "loading" && (
                    <div className="server-status-message" role="status">
                      <span className="search-spinner" aria-hidden="true" />
                      Consultando el servidor...
                    </div>
                  )}

                  {selectedServerStatus?.status === "error" && (
                    <p className="server-status-message server-status-message--error" role="alert">
                      {selectedServerStatus.message}
                    </p>
                  )}

                  {selectedServerStatus?.status === "loaded" && (
                    <>
                      <div className="server-status-summary">
                        <div className="server-status-icon">
                          {selectedServerStatus.server.icon ? (
                            <img
                              src={selectedServerStatus.server.icon}
                              alt=""
                            />
                          ) : (
                            <span aria-hidden="true">
                              {(selectedResult.record.server ?? "M").slice(0, 1).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="server-status-identity">
                          <strong>{selectedServerStatus.server.host}</strong>
                          <span>
                            {selectedServerStatus.server.host}:{selectedServerStatus.server.port}
                          </span>
                        </div>
                        {selectedServerStatus.server.online &&
                          selectedServerStatus.server.players && (
                            <div className="server-player-count">
                              <strong>{selectedServerStatus.server.players.online}</strong>
                              <span>
                                / {selectedServerStatus.server.players.max} jugadores
                              </span>
                            </div>
                          )}
                      </div>

                      {selectedServerStatus.server.online && (
                        <>
                          {selectedServerStatus.server.version && (
                            <p className="server-version">
                              Versión: {selectedServerStatus.server.version}
                            </p>
                          )}
                          <div className="server-motd">
                            <span>MOTD</span>
                            <p>
                              {selectedServerStatus.server.motd || "El servidor no publicó un MOTD."}
                            </p>
                          </div>
                        </>
                      )}
                      {!selectedServerStatus.server.online && (
                        <p className="server-offline-note">
                          El servidor no está disponible en este momento.
                        </p>
                      )}
                    </>
                  )}
                  </section>
                )}
              </div>
            </section>
          </div>,
          document.body,
        )}
    </div>
  );
}
