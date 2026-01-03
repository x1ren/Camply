/**
 * Authentication service
 * Handles login, signup, logout, and password reset
 */

import { supabase } from "./supabaseClient";
import { User, AuthError, AuthErrorCode } from "@/types/auth";
import { rateLimiter } from "./rateLimiter";

/**
 * Validates email format
 */
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength
 */
function validatePassword(password: string): {
  valid: boolean;
  message?: string;
} {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters" };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }
  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one lowercase letter",
    };
  }
  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one number",
    };
  }
  return { valid: true };
}

/**
 * Maps Supabase error to AuthError
 */
function mapSupabaseError(error: any): AuthError {
  const message =
    error?.message || error?.toString() || "An unknown error occurred";

  if (message.includes("Invalid login credentials")) {
    return {
      code: AuthErrorCode.INVALID_CREDENTIALS,
      message: "Invalid email or password",
    };
  }

  if (message.includes("Email not confirmed")) {
    return {
      code: AuthErrorCode.INVALID_CREDENTIALS,
      message: "Please verify your email address before logging in",
    };
  }

  if (message.includes("User already registered")) {
    return {
      code: AuthErrorCode.USER_ALREADY_EXISTS,
      message: "This email is already registered",
    };
  }

  if (message.includes("Password")) {
    return {
      code: AuthErrorCode.WEAK_PASSWORD,
      message: "Password does not meet security requirements",
    };
  }

  if (message.includes("Network")) {
    return {
      code: AuthErrorCode.NETWORK_ERROR,
      message: "Network error. Please check your connection.",
    };
  }

  return {
    code: AuthErrorCode.UNKNOWN_ERROR,
    message: message,
  };
}

/**
 * Convert Supabase user to our User type
 */
function mapSupabaseUserToUser(supabaseUser: any): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || "",
    fullName: supabaseUser.user_metadata?.full_name || null,
    avatar: supabaseUser.user_metadata?.avatar_url || null,
    provider: supabaseUser.app_metadata?.provider || "email",
    createdAt: supabaseUser.created_at,
    updatedAt: supabaseUser.updated_at,
  };
}

/**
 * Login with email and password
 */
export async function loginWithEmail(
  email: string,
  password: string
): Promise<{ user: User; accessToken: string; refreshToken: string }> {
  // Validate inputs
  if (!email || !password) {
    throw {
      code: AuthErrorCode.INVALID_CREDENTIALS,
      message: "Email and password are required",
    } as AuthError;
  }

  if (!validateEmail(email)) {
    throw {
      code: AuthErrorCode.INVALID_EMAIL,
      message: "Please enter a valid email address",
    } as AuthError;
  }

  // Check rate limiting
  const rateLimitResult = rateLimiter.recordAttempt(email);
  if (!rateLimitResult.allowed) {
    const remainingSeconds = Math.ceil(rateLimitResult.remaining / 1000);
    throw {
      code: AuthErrorCode.RATE_LIMIT_EXCEEDED,
      message: `Too many login attempts. Try again in ${remainingSeconds} seconds.`,
      details: `Locked for ${remainingSeconds} seconds`,
    } as AuthError;
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    if (!data.user || !data.session) {
      throw new Error("No user or session returned from auth");
    }

    // Clear rate limiter on successful login
    rateLimiter.reset(email);

    return {
      user: mapSupabaseUserToUser(data.user),
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token || "",
    };
  } catch (error) {
    throw mapSupabaseError(error);
  }
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string
): Promise<{ user: User; accessToken: string; refreshToken: string }> {
  // Validate inputs
  if (!email || !password || !fullName) {
    throw {
      code: AuthErrorCode.INVALID_CREDENTIALS,
      message: "All fields are required",
    } as AuthError;
  }

  if (!validateEmail(email)) {
    throw {
      code: AuthErrorCode.INVALID_EMAIL,
      message: "Please enter a valid email address",
    } as AuthError;
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    throw {
      code: AuthErrorCode.WEAK_PASSWORD,
      message: passwordValidation.message || "Password is too weak",
    } as AuthError;
  }

  if (fullName.trim().length < 2) {
    throw {
      code: AuthErrorCode.INVALID_CREDENTIALS,
      message: "Full name must be at least 2 characters",
    } as AuthError;
  }

  try {
    const appUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000";

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${appUrl}/auth/confirm-email`,
      },
    });

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error("No user returned from signup");
    }

    return {
      user: mapSupabaseUserToUser(data.user),
      accessToken: data.session?.access_token || "",
      refreshToken: data.session?.refresh_token || "",
    };
  } catch (error) {
    throw mapSupabaseError(error);
  }
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(): Promise<void> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${
          typeof window !== "undefined" ? window.location.origin : ""
        }/auth/callback`,
      },
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    throw mapSupabaseError(error);
  }
}

/**
 * Sign out / Logout
 */
export async function logout(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    // Clear session from storage
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("sb-auth-session");
      localStorage.removeItem("sb-auth-token");
    }
  } catch (error) {
    throw mapSupabaseError(error);
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<void> {
  // Validate input
  if (!email) {
    throw {
      code: AuthErrorCode.INVALID_EMAIL,
      message: "Email is required",
    } as AuthError;
  }

  if (!validateEmail(email)) {
    throw {
      code: AuthErrorCode.INVALID_EMAIL,
      message: "Please enter a valid email address",
    } as AuthError;
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${
        typeof window !== "undefined" ? window.location.origin : ""
      }/auth/reset-password`,
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    throw mapSupabaseError(error);
  }
}

/**
 * Update password (used after reset)
 */
export async function updatePassword(newPassword: string): Promise<void> {
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.valid) {
    throw {
      code: AuthErrorCode.WEAK_PASSWORD,
      message: passwordValidation.message || "Password is too weak",
    } as AuthError;
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    throw mapSupabaseError(error);
  }
}

/**
 * Get current session
 */
export async function getCurrentSession() {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    return data.session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      throw error;
    }

    return data.user ? mapSupabaseUserToUser(data.user) : null;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}

/**
 * Refresh session
 */
export async function refreshSession(refreshToken: string) {
  try {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      throw error;
    }

    return data.session;
  } catch (error) {
    console.error("Error refreshing session:", error);
    return null;
  }
}
