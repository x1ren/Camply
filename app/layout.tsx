import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { CampusProvider } from "@/context/CampusContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Camply",
  description: "Secure Authentication with Next.js and Supabase",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CampusProvider>{children}</CampusProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
