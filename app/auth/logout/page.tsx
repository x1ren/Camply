"use client";

/**
 * Logout Page
 * Handles user logout and redirects to home page
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function LogoutPage() {
  const router = useRouter();
  const { logout, loading } = useAuth();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await logout();
        // Redirect to home page after logout
        router.push("/");
      } catch (error) {
        console.error("Logout error:", error);
        // Still redirect even if there's an error
        router.push("/");
      }
    };

    handleLogout();
  }, [logout, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Logging you out...</p>
      </div>
    </div>
  );
}
