"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { getAccessToken, setAccessToken, authHeaders } from "./auth-client";

interface UserProfile {
  id: string;
  email: string;
  phone: string | null;
  display_name: string | null;
  avatar_url: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  license_key: string | null;
  license_status: string;
  referral_code: string | null;
  referred_by: string | null;
  wallet_address: string | null;
  payout_crypto: string;
  total_referral_earnings_usd: number;
  notification_email: boolean;
  notification_sms: boolean;
  notification_webhook_url: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  profile: UserProfile | null;
  loading: boolean;
  signedIn: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  profile: null,
  loading: true,
  signedIn: false,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);

  const fetchProfile = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setProfile(null);
      setSignedIn(false);
      return;
    }
    try {
      const res = await fetch("/api/auth/me", { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setSignedIn(true);
      } else if (res.status === 401) {
        setAccessToken(null);
        setProfile(null);
        setSignedIn(false);
      }
    } catch {
      // Network error — keep current state
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    (async () => {
      await fetchProfile();
      setLoading(false);
    })();
  }, [fetchProfile]);

  const signOut = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: authHeaders(),
      });
    } catch {
      // ignore — we still clear locally
    }
    setAccessToken(null);
    setProfile(null);
    setSignedIn(false);
  };

  return (
    <AuthContext.Provider value={{ profile, loading, signedIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
