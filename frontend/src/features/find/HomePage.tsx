import { useRef, useState, type FormEvent } from "react";
import { useAuth } from "../auth/context/auth.context";
import { useDehashSender } from "../dehashes/hooks/useDehashSender";
import { FindRequestError, searchUsers } from "./api/find.api";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { MinecraftProfileCard } from "./components/profile/MinecraftProfileCard";
import { MinecraftProfileModal } from "./components/profile/MinecraftProfileModal";
import { ResultModal } from "./components/results/ResultModal";
import { ResultsSection } from "./components/results/ResultsSection";
import { SearchPanel } from "./components/search/SearchPanel";
import { useIpCountries } from "./hooks/useIpCountries";
import { useMinecraftProfileLookup } from "./hooks/useMinecraftProfileLookup";
import { useModalAccessibility } from "./hooks/useModalAccessibility";
import { useServerStatus } from "./hooks/useServerStatus";
import type { FindRecord, SelectedResult } from "./types";

export function HomePage() {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [results, setResults] = useState<FindRecord[]>([]);
  const [revealedPasswords, setRevealedPasswords] = useState<Set<number>>(
    () => new Set(),
  );
  const { feedback: dehashFeedback, send: dehash, clear: clearDehashFeedback } =
    useDehashSender();
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [copiedTarget, setCopiedTarget] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<SelectedResult | null>(null);
  const [modalAvatarFailed, setModalAvatarFailed] = useState(false);
  const [isMinecraftProfileModalOpen, setIsMinecraftProfileModalOpen] =
    useState(false);
  const [minecraftModalAvatarFailed, setMinecraftModalAvatarFailed] =
    useState(false);
  const [failedAvatarId, setFailedAvatarId] = useState<string | null>(null);
  const resultCardOpener = useRef<HTMLElement | null>(null);
  const minecraftCardOpener = useRef<HTMLElement | null>(null);
  const trimmedUsername = username.trim();

  const { lookup: minecraftProfileLookup, profile: minecraftProfile } =
    useMinecraftProfileLookup(trimmedUsername);
  const ipCountries = useIpCountries(results);
  const selectedServerAddress = selectedResult?.record.serverip?.trim() ?? "";
  const selectedServerStatus = useServerStatus(selectedServerAddress);
  const activeOpener = selectedResult
    ? resultCardOpener
    : minecraftCardOpener;

  useModalAccessibility(
    selectedResult !== null || isMinecraftProfileModalOpen,
    () => {
      if (selectedResult) setSelectedResult(null);
      else setIsMinecraftProfileModalOpen(false);
    },
    activeOpener,
  );

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const searchTerm = trimmedUsername;
    if (!searchTerm || isSearching) return;

    setError(null);
    setIsSearching(true);
    setHasSearched(false);
    setResults([]);
    setRevealedPasswords(new Set());
    clearDehashFeedback();

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

  async function copyValue(value: string, target: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyError(null);
      setCopiedTarget(target);
    } catch {
      setCopyError(
        "No se pudo copiar al portapapeles. Comprueba los permisos del navegador.",
      );
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

  function dehashForCard(record: FindRecord, index: number) {
    dehash(record, String(index));
  }

  function openResult(record: FindRecord, index: number, opener: HTMLElement) {
    setModalAvatarFailed(false);
    resultCardOpener.current = opener;
    setSelectedResult({ record, index });
  }

  function openMinecraftProfile() {
    setMinecraftModalAvatarFailed(false);
    setIsMinecraftProfileModalOpen(true);
  }

  function copyForCard(value: string, target: string) {
    void copyValue(value, target);
  }

  function renderSelectedResultModal() {
    if (!selectedResult) return null;
    const { record, index } = selectedResult;

    return (
      <ResultModal
        record={record}
        index={index}
        minecraftProfile={minecraftProfile}
        avatarFailed={modalAvatarFailed}
        serverAddress={selectedServerAddress}
        serverStatus={selectedServerStatus}
        copiedTarget={copiedTarget}
        ipCountry={record.ip ? ipCountries[record.ip] ?? null : null}
        dehashFeedback={dehashFeedback}
        isPasswordVisible={revealedPasswords.has(index)}
        onAvatarError={() => setModalAvatarFailed(true)}
        onClose={() => setSelectedResult(null)}
        onCopy={copyForCard}
        onTogglePassword={togglePassword}
        onDehash={dehashForCard}
      />
    );
  }

  return (
    <DashboardLayout username={user?.username}>
      <div className="dashboard-grid">
        <SearchPanel
          username={username}
          isSearching={isSearching}
          onUsernameChange={setUsername}
          onSearch={handleSearch}
        />
        <MinecraftProfileCard
          lookup={minecraftProfileLookup}
          username={trimmedUsername}
          failedAvatarId={failedAvatarId}
          openerRef={minecraftCardOpener}
          onAvatarError={setFailedAvatarId}
          onOpen={openMinecraftProfile}
        />
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
        <ResultsSection
          username={username}
          results={results}
          ipCountries={ipCountries}
          copiedTarget={copiedTarget}
          dehashFeedback={dehashFeedback}
          revealedPasswords={revealedPasswords}
          onCopy={copyForCard}
          onTogglePassword={togglePassword}
          onDehash={dehashForCard}
          onOpenResult={openResult}
        />
      )}

      {renderSelectedResultModal()}
      {isMinecraftProfileModalOpen && (
        <MinecraftProfileModal
          lookup={minecraftProfileLookup}
          username={trimmedUsername}
          avatarFailed={minecraftModalAvatarFailed}
          onAvatarError={() => setMinecraftModalAvatarFailed(true)}
          onClose={() => setIsMinecraftProfileModalOpen(false)}
        />
      )}
    </DashboardLayout>
  );
}
