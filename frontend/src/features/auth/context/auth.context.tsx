import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getCurrentUser, type AuthUser } from "../auth.api";

type AuthStatus = "checking" | "authenticated" | "unauthenticated" | "error";

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  retry: () => void;
  setAuthenticatedUser: (user: AuthUser) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [user, setUser] = useState<AuthUser | null>(null);

  const checkAuth = useCallback(async (signal?: AbortSignal) => {
    setStatus("checking");

    try {
      const currentUser = await getCurrentUser(signal);
      setUser(currentUser);
      setStatus(currentUser ? "authenticated" : "unauthenticated");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setUser(null);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void checkAuth(controller.signal);
    return () => controller.abort();
  }, [checkAuth]);

  const retry = useCallback(() => {
    void checkAuth();
  }, [checkAuth]);

  const setAuthenticatedUser = useCallback((authenticatedUser: AuthUser) => {
    setUser(authenticatedUser);
    setStatus("authenticated");
  }, []);

  const value = useMemo(
    () => ({ status, user, retry, setAuthenticatedUser }),
    [status, user, retry, setAuthenticatedUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}
