"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { hasCompletedOnboarding } from "@/lib/onboardingService";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [exchangingSession, setExchangingSession] = useState(true);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Explicitly exchange the OAuth code for a session
        // This ensures Supabase processes the callback URL parameters
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error exchanging OAuth code:", error);
          setExchangingSession(false);
          // Wait a bit for auth context to catch up, then redirect
          setTimeout(() => {
            router.push("/");
          }, 1000);
          return;
        }

        setExchangingSession(false);

        // If we have a session, wait for auth context to update
        if (session?.user) {
          // Give the auth context a moment to process the session
          // The onAuthStateChange listener should pick it up
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error("Error in OAuth callback:", error);
        setExchangingSession(false);
        setTimeout(() => {
          router.push("/");
        }, 1000);
      }
    };

    handleOAuthCallback();
  }, [router]);

  useEffect(() => {
    const checkOnboardingAndRedirect = async () => {
      // Wait for both session exchange and auth context to be ready
      if (exchangingSession || authLoading) {
        return;
      }

      if (!user) {
        // User is not authenticated, redirect to home
        router.push("/");
        return;
      }

      // Check onboarding status from database (not user metadata)
      // This ensures we get the most up-to-date status
      try {
        const completed = await hasCompletedOnboarding(user.id);
        setCheckingOnboarding(false);

        if (completed) {
          router.push("/home");
        } else {
          router.push("/onboarding");
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        // On error, default to onboarding page
        setCheckingOnboarding(false);
        router.push("/onboarding");
      }
    };

    checkOnboardingAndRedirect();
  }, [exchangingSession, authLoading, user, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">
          {exchangingSession || authLoading || checkingOnboarding
            ? "Completing authentication..."
            : "Redirecting..."}
        </p>
      </div>
    </div>
  );
}
