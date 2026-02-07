"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabaseClient";
import { AuthContextType, User, Session } from "@/types/auth";
import {
  loginWithEmail,
  signUpWithEmail,
  logout,
  signInWithGoogle,
  requestPasswordReset,
} from "@/lib/authService";
import { getUserProfile } from "@/lib/onboardingService";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  // Initialize auth session on mount
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Add timeout to prevent hanging (getSession should be fast - reads from localStorage)
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Session check timeout")), 3000),
        );

        let currentSession;
        try {
          const result = await Promise.race([sessionPromise, timeoutPromise]);
          currentSession = (result as any)?.data?.session;
        } catch (timeoutError: any) {
          // If timeout occurs, treat as no session (don't log as error)
          if (timeoutError?.message === "Session check timeout") {
            currentSession = null;
          } else {
            throw timeoutError;
          }
        }

        if (!mounted) return;

        if (currentSession && currentSession.user) {
          const userData: User = {
            id: currentSession.user.id,
            email: currentSession.user.email || "",
            fullName: currentSession.user.user_metadata?.full_name || null,
            avatar_url: currentSession.user.user_metadata?.avatar_url || null,
            provider:
              (currentSession.user.app_metadata?.provider as
                | "email"
                | "google") || "email",
            createdAt: currentSession.user.created_at,
            updatedAt:
              currentSession.user.updated_at || new Date().toISOString(),
            display_name: currentSession.user.user_metadata?.display_name || "",
            bio: currentSession.user.user_metadata?.bio || "",
            school: currentSession.user.user_metadata?.school || "",
            program: currentSession.user.user_metadata?.program || "",
            onboarding_completed:
              currentSession.user.user_metadata?.onboarding_completed || false,
          };

          setUser(userData);
          setSession({
            user: userData,
            accessToken: currentSession.access_token,
            refreshToken: currentSession.refresh_token || null,
            expiresAt: currentSession.expires_at || null,
          });

          // Fetch updated DB user data in background (non-blocking)
          getUserProfile(userData.id)
            .then((dbUser) => {
              if (mounted && dbUser) setUser(dbUser);
            })
            .catch((err) => {
              // Silently fail - we already have user data from session
              console.error("DB fetch error:", err);
            });
        } else {
          setUser(null);
          setSession(null);
        }
      } catch (err) {
        console.error("Auth init error:", err);
        // On error, assume no session and continue
        if (mounted) {
          setUser(null);
          setSession(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, authSession) => {
        if (!mounted) return;

        // Update state immediately without blocking
        if (authSession?.user) {
          const userData: User = {
            id: authSession.user.id,
            email: authSession.user.email || "",
            fullName: authSession.user.user_metadata?.full_name || null,
            avatar_url: authSession.user.user_metadata?.avatar_url || null,
            provider:
              (authSession.user.app_metadata?.provider as "email" | "google") ||
              "email",
            createdAt: authSession.user.created_at,
            updatedAt: authSession.user.updated_at || new Date().toISOString(),
            display_name: authSession.user.user_metadata?.display_name || "",
            bio: authSession.user.user_metadata?.bio || "",
            school: authSession.user.user_metadata?.school || "",
            program: authSession.user.user_metadata?.program || "",
            onboarding_completed:
              authSession.user.user_metadata?.onboarding_completed || false,
          };

          setUser(userData);
          setSession({
            user: userData,
            accessToken: authSession.access_token,
            refreshToken: authSession.refresh_token || null,
            expiresAt: authSession.expires_at || null,
          });
          setLoading(false);

          // Fetch updated DB user data in background (non-blocking)
          getUserProfile(userData.id)
            .then((dbUser) => {
              if (mounted && dbUser) setUser(dbUser);
            })
            .catch((err) => {
              // Silently fail - we already have user data from session
              console.error("DB fetch error:", err);
            });
        } else {
          setUser(null);
          setSession(null);
          setLoading(false);
        }
      },
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // --- Auth actions ---

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await loginWithEmail(email, password);
      setUser(result.user);
      setSession({
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresAt: Date.now() + 60 * 60 * 1000,
      });
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      setLoading(true);
      setError(null);
      try {
        await signUpWithEmail(email, password, fullName);
      } catch (err: any) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const signInWithGoogleHandler = useCallback(async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err);
      throw err;
    }
  }, []);

  const logoutHandler = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await logout();
      setUser(null);
      setSession(null);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await requestPasswordReset(email);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  // --- Context value ---
  const value: AuthContextType = {
    user,
    session,
    loading,
    error,
    login,
    signUp,
    logout: logoutHandler,
    signInWithGoogle: signInWithGoogleHandler,
    resetPassword,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
