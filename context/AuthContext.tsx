"use client";

/**
 * Auth Context
 * Provides global auth state and methods to the entire app
 */

import { createContext, useCallback, useEffect, useState } from "react";
import {
  AuthContextType,
  AuthError,
  User,
  Session,
  AuthErrorCode,
} from "@/types/auth";
import {
  loginWithEmail,
  signUpWithEmail,
  logout,
  signInWithGoogle,
  requestPasswordReset,
  getCurrentSession,
  getCurrentUser,
} from "@/lib/authService";
import { supabase } from "@/lib/supabaseClient";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  // Initialize auth session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);

        // Get current session
        const currentSession = await getCurrentSession();
        const currentUser = await getCurrentUser();

        if (currentSession && currentUser) {
          setUser(currentUser);
          setSession({
            user: currentUser,
            accessToken: currentSession.access_token,
            refreshToken: currentSession.refresh_token || null,
            expiresAt: currentSession.expires_at || null,
          });
        } else {
          setUser(null);
          setSession(null);
        }
      } catch (err) {
        console.error("Error initializing auth:", err);
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, authSession) => {
      if (authSession?.user) {
        const userData: User = {
          id: authSession.user.id,
          email: authSession.user.email || "",
          fullName: authSession.user.user_metadata?.full_name || null,
          avatar: authSession.user.user_metadata?.avatar_url || null,
          provider:
            (authSession.user.app_metadata?.provider as "email" | "google") ||
            "email",
          createdAt: authSession.user.created_at,
          updatedAt: authSession.user.updated_at || new Date().toISOString(),
        };

        setUser(userData);
        setSession({
          user: userData,
          accessToken: authSession.access_token,
          refreshToken: authSession.refresh_token || null,
          expiresAt: authSession.expires_at || null,
        });
      } else {
        setUser(null);
        setSession(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Login with email and password
  const handleLogin = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);

      const result = await loginWithEmail(email, password);

      setUser(result.user);
      setSession({
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
      });
    } catch (err: any) {
      const authError: AuthError = err.code
        ? err
        : {
            code: AuthErrorCode.UNKNOWN_ERROR,
            message: err.message || "An unknown error occurred",
          };
      setError(authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign up with email and password
  const handleSignUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      try {
        setError(null);
        setLoading(true);

        await signUpWithEmail(email, password, fullName);

        // Set a confirmation message - user needs to verify email
        const confirmationError: AuthError = {
          code: "CONFIRMATION_SENT" as any,
          message: `A confirmation email has been sent to ${email}. Please check your inbox and click the confirmation link to activate your account.`,
        };
        setError(confirmationError);
        throw confirmationError;
      } catch (err: any) {
        const authError: AuthError = err.code
          ? err
          : {
              code: AuthErrorCode.UNKNOWN_ERROR,
              message: err.message || "An unknown error occurred",
            };
        setError(authError);
        throw authError;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Sign in with Google
  const handleSignInWithGoogle = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      await signInWithGoogle();
    } catch (err: any) {
      const authError: AuthError = err.code
        ? err
        : {
            code: AuthErrorCode.UNKNOWN_ERROR,
            message: err.message || "An unknown error occurred",
          };
      setError(authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout
  const handleLogout = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      await logout();

      setUser(null);
      setSession(null);
    } catch (err: any) {
      const authError: AuthError = err.code
        ? err
        : {
            code: AuthErrorCode.UNKNOWN_ERROR,
            message: err.message || "An unknown error occurred",
          };
      setError(authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Request password reset
  const handleResetPassword = useCallback(async (email: string) => {
    try {
      setError(null);
      setLoading(true);

      await requestPasswordReset(email);
    } catch (err: any) {
      const authError: AuthError = err.code
        ? err
        : {
            code: AuthErrorCode.UNKNOWN_ERROR,
            message: err.message || "An unknown error occurred",
          };
      setError(authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const handleClearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    session,
    loading,
    error,
    login: handleLogin,
    signUp: handleSignUp,
    logout: handleLogout,
    signInWithGoogle: handleSignInWithGoogle,
    resetPassword: handleResetPassword,
    clearError: handleClearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
