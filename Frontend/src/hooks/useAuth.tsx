import { useEffect, useState } from "react";

export interface User {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
  role: "student" | "instructor" | "admin" | "Master_ADMIN";
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Use your backend API URL from .env
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${API}/auth/me`, { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("Not authenticated");
        return r.json();
      })
      .then((d) => setUser(d.user as User))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [API]);

  const login = () => {
    window.location.href = `${API}/auth/login`;
  };

  const logout = async () => {
    await fetch(`${API}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  };

  return { user, loading, login, logout };
}
