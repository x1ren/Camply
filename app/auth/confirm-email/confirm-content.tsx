"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ConfirmEmailContent() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Confirming your email...");

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Check if user has a valid session (email confirmed)
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          setStatus("error");
          setMessage("Failed to confirm email. Please try signing up again.");
          setTimeout(() => router.push("/"), 3000);
          return;
        }

        if (data.session) {
          setStatus("success");
          setMessage("Email confirmed! Redirecting to login...");
          setTimeout(() => router.push("/onboarding"), 2000);
        } else {
          setStatus("error");
          setMessage("Email confirmation failed. Please try signing up again.");
          setTimeout(() => router.push("/"), 3000);
        }
      } catch (err) {
        console.error("Error confirming email:", err);
        setStatus("error");
        setMessage("An error occurred. Please try again.");
        setTimeout(() => router.push("/"), 3000);
      }
    };

    confirmEmail();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center max-w-md px-6">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-5xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-green-600 mb-2">
              Email Confirmed!
            </h1>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-5xl mb-4">✗</div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">
              Confirmation Failed
            </h1>
            <p className="text-gray-600">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}
