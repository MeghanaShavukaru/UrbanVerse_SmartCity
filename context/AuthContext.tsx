"use client";

// ============================================================
// context/AuthContext.tsx
// Firebase Auth context provider
// ============================================================

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

interface LocalDemoUser {
  email: string;
  displayName: string | null;
}

type AuthUser = User | LocalDemoUser;

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const DEMO_SESSION_KEY = "urbanverse-demo-session";

function getSavedDemoUser(): LocalDemoUser | null {
  try {
    const saved = window.localStorage.getItem(DEMO_SESSION_KEY);
    return saved ? (JSON.parse(saved) as LocalDemoUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedDemoUser = getSavedDemoUser();
    if (savedDemoUser) {
      const timer = window.setTimeout(() => {
        setUser(savedDemoUser);
        setLoading(false);
      }, 0);
      return () => window.clearTimeout(timer);
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    void password;
    const demoUser: LocalDemoUser = {
      email,
      displayName: email.split("@")[0] || "Planner",
    };
    window.localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoUser));
    setUser(demoUser);
    setLoading(false);
    router.push("/dashboard");
  };

  const signUp = async (email: string, password: string) => {
    await signIn(email, password);
  };

  const logout = async () => {
    window.localStorage.removeItem(DEMO_SESSION_KEY);
    setUser(null);
    await signOut(auth).catch(() => undefined);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
