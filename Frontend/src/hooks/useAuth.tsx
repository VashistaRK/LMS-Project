import axios from "axios";
import { useEffect, useState } from "react";

export interface User {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
  accessGranted?: boolean;
  phoneNumber?: string;
  role: "student" | "instructor" | "admin" | "Master_ADMIN";
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Use your backend API URL from .env
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    let mounted = true;

    const hydrateUser = async () => {
      try {
        // 1️⃣ Validate session
        const { data: auth } = await axios.get(`${API}/auth/local/me`, {
          withCredentials: true,
        });

        if (!auth.user) {
          if (mounted) setUser(null);
          return;
        }

        // 2️⃣ Fetch full profile (includes picture)
        const { data: profile } = await axios.get(`${API}/api/user/profile`, {
          withCredentials: true,
        });

        if (mounted) setUser(profile.user);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    hydrateUser();

    return () => {
      mounted = false;
    };
  }, [API]);

  const login = () => {
    window.location.href = `${API}/auth/local/login`;
  };

  const logout = async () => {
    await fetch(`${API}/auth/local/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  };

  return { user, loading, login, logout };
}
