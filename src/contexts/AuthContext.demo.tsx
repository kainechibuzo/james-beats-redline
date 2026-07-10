import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";

// Demo User - always authenticated
const DEMO_USER: User = {
  id: "demo-user-" + Math.random().toString(36).substring(7),
  email: "demo@jamesbeats.local",
  phone: "",
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {
    username: "Demo User",
    display_name: "Demo User",
  },
  aud: "authenticated",
  created_at: new Date().toISOString(),
} as any;

const DEMO_SESSION: Session = {
  provider_token: null,
  provider_refresh_token: null,
  access_token: "demo-token-" + Date.now(),
  token_type: "bearer",
  expires_in: 3600,
  refresh_token: "demo-refresh-" + Date.now(),
  user: DEMO_USER,
  expires_at: Date.now() + 3600000,
} as any;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(DEMO_USER);
  const [session, setSession] = useState<Session | null>(DEMO_SESSION);
  const [loading, setLoading] = useState(false);

  // Simulate auth initialization
  useEffect(() => {
    setTimeout(() => {
      setUser(DEMO_USER);
      setSession(DEMO_SESSION);
      setLoading(false);
    }, 500);
  }, []);

  const signUp = async (email: string, password: string, username?: string) => {
    // Mock signup - always succeeds
    const newUser = { ...DEMO_USER, email, user_metadata: { ...DEMO_USER.user_metadata, username: username || email.split('@')[0] } };
    setUser(newUser);
    setSession({ ...DEMO_SESSION, user: newUser });
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    // Mock signin - always succeeds
    const newUser = { ...DEMO_USER, email };
    setUser(newUser);
    setSession({ ...DEMO_SESSION, user: newUser });
    return { error: null };
  };

  const signOut = async () => {
    // Mock signout - reset to demo user
    setUser(DEMO_USER);
    setSession(DEMO_SESSION);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
