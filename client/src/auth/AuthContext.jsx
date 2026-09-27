import { createContext, useContext, useMemo, useState } from "react";

const USER_KEY = "hp-shop-user";
const TOKEN_KEY = "hp-shop-token";
const AuthContext = createContext(null);

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || null;
  } catch (_error) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");

  const value = useMemo(
    () => ({
      user,
      token,
      login({ user: nextUser, token: nextToken }) {
        setUser(nextUser);
        setToken(nextToken);
        localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
        localStorage.setItem(TOKEN_KEY, nextToken);
      },
      logout() {
        setUser(null);
        setToken("");
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
      },
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
