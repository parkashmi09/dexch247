import { useEffect, useState, useCallback } from "react";

// Lightweight auth hook backed by localStorage. The shared axiosClient
// already attaches the token to every request and clears it on a 401, so
// this hook only needs to surface the current state to React.

const TOKEN_KEY = "token";

function readToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function useAuth() {
  const [token, setToken] = useState(readToken);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === TOKEN_KEY) setToken(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = useCallback((newToken) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);

  return { token, isAuthenticated: !!token, login, logout };
}
