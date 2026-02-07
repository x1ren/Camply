"use client";

import { useAuth } from "@/hooks/useAuth";
import { useCampus } from "@/context/CampusContext";
import Navbar from "@/components/Navbar";
import CategoryRow from "@/components/CategoryRow";
import ProductCard from "@/components/ProductCard";
import { useEffect, useState } from "react";

interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  status: string;
  created_at: string;
  categories: { name: string } | null;
  item_images: { image_url: string }[];
}

export default function HomePage() {
  const { loading, user } = useAuth();
  const { selectedCampus, isBrowsingOtherCampus } = useCampus();
  const [items, setItems] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  // Use selected campus from context
  const campusName = selectedCampus;

  // Fetch items when campus changes
  useEffect(() => {
    const fetchItems = async () => {
      if (!campusName) return;

      console.log("=== FRONTEND DEBUG ===");
      console.log("Selected campus:", campusName);
      console.log("User school:", user?.school);
      console.log("Is browsing other campus:", isBrowsingOtherCampus);

      setLoadingItems(true);
      // Clear items immediately when campus changes to prevent flash
      setItems([]);
      
      try {
        const url = `/api/items?school=${encodeURIComponent(campusName)}`;
        console.log("Fetching from URL:", url);
        
        const response = await fetch(url);
        const data = await response.json();

        console.log("API Response:", data);
        console.log("Items count:", data.data?.length || 0);

        if (data.success) {
          setItems(data.data);
        } else {
          console.error("API returned error:", data.error);
        }
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoadingItems(false);
      }
    };

    fetchItems();
  }, [campusName]); // Only depend on campusName to prevent unnecessary refetches

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

        {/* Items Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Items from {campusName}
          </h2>

          {loadingItems ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="mt-4 text-gray-600">
                No items available from this campus yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {items.map((item) => (
                <ProductCard
                  key={item.id}
                  id={item.id}
                  name={item.title}
                  price={item.price}
                  image={item.item_images[0]?.image_url}
                  verifiedSeller={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
