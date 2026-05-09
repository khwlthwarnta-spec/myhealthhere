import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "sehatak_auth_token";
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:8080";

export type AuthUser = { id: number; email: string };

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<{ verified: boolean }>;
  verifyOtp: (email: string, code: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

function parseJwtPayload(token: string): AuthUser | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    if (payload.id && payload.email) return { id: payload.id, email: payload.email };
    return null;
  } catch {
    return null;
  }
}

async function apiFetch(path: string, body: object) {
  const res = await fetch(`${API_URL}/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "حدث خطأ غير متوقع");
  return data;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync(TOKEN_KEY).then((stored) => {
      if (stored) {
        const parsed = parseJwtPayload(stored);
        if (parsed) {
          setToken(stored);
          setUser(parsed);
        }
      }
      setIsLoading(false);
    });
  }, []);

  async function register(email: string, password: string) {
    await apiFetch("/auth/register", { email, password });
  }

  async function login(email: string, password: string): Promise<{ verified: boolean }> {
    const data = await apiFetch("/auth/login", { email, password });
    if (data.verified && data.token) {
      await SecureStore.setItemAsync(TOKEN_KEY, data.token);
      const parsed = parseJwtPayload(data.token);
      setToken(data.token);
      setUser(parsed);
    }
    return { verified: !!data.verified };
  }

  async function verifyOtp(email: string, code: string) {
    const data = await apiFetch("/auth/verify-otp", { email, code });
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    const parsed = parseJwtPayload(data.token);
    setToken(data.token);
    setUser(parsed);
  }

  async function resendOtp(email: string) {
    await apiFetch("/auth/resend-otp", { email });
  }

  async function logout() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, register, login, verifyOtp, resendOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
