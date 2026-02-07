"use client";

import { useAuth } from "@/hooks/useAuth";
import { useCampus } from "@/context/CampusContext";
import Navbar from "@/components/Navbar";
import CategoryRow from "@/components/CategoryRow";
import ProductCard from "@/components/ProductCard";

export default function HomePage() {
  const { loading } = useAuth();
  const { selectedCampus, isBrowsingOtherCampus } = useCampus();

  // Use selected campus from context
  const campusName = selectedCampus;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar cartItemCount={3} />

      {/* Categories Section */}
      <CategoryRow />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Browsing Notice */}
        {isBrowsingOtherCampus && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm text-indigo-800">
                You're browsing products from <strong>{campusName}</strong>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
