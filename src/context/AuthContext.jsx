import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export const normalizeRole = (value) => {
  const raw = typeof value === "object" && value !== null ? value.name : value;
  if (typeof raw !== "string") return null;
  const normalized = raw.trim().toUpperCase().replace(/^ROLE_/, "");
  return normalized === "ADMIN" || normalized === "PARTICIPANT" ? normalized : null;
};

const getStoredAuth = () => {
  const raw = localStorage.getItem("quiz_auth");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(getStoredAuth());

  const login = (payload) => {
    localStorage.setItem("quiz_auth", JSON.stringify(payload));
    setAuth(payload);
  };

  const logout = () => {
    localStorage.removeItem("quiz_auth");
    setAuth(null);
  };

  const value = useMemo(
    () => ({
      auth,
      token: auth?.token,
      userId: auth?.userId,
      email: auth?.email,
      role: normalizeRole(auth?.role),
      isAuthenticated: Boolean(auth?.token),
      login,
      logout,
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
