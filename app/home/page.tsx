"use client";

import { useAuth } from "@/hooks/useAuth";
import { useCampus } from "@/context/CampusContext";
import Navbar from "@/components/Navbar";
import CategoryRow from "@/components/CategoryRow";
import ProductCard from "@/components/ProductCard";

// Mock data - replace with actual API calls
const trendingProducts = [
  {
    id: "1",
    name: 'MacBook Pro 13" 2020 - Excellent Condition',
    price: 50000.0,
    isTrending: true,
    verifiedSeller: true,
  },
  {
    id: "2",
    name: "Calculus Textbook Bundle (3 books)",
    price: 2500.0,
    isTrending: true,
    verifiedSeller: true,
  },
  {
    id: "3",
    name: "Nike Air Force 1 - Size 9",
    price: 4200.0,
    isTrending: true,
    verifiedSeller: true,
  },
  {
    id: "4",
    name: "Dorm Room Mini Fridge",
    price: 6700.0,
    isTrending: true,
    verifiedSeller: true,
  },
  {
    id: "5",
    name: "Graphing Calculator TI-84 Plus",
    price: 4800.0,
    isTrending: true,
    verifiedSeller: true,
  },
  {
    id: "6",
    name: "Vintage Denim Jacket",
    price: 2000.0,
    isTrending: true,
    verifiedSeller: true,
  },
];

const dealProducts = [
  {
    id: "7",
    name: "Wireless Earbuds - Brand New",
    price: 4500.0,
    discount: 30,
    sellingFast: true,
    verifiedSeller: true,
  },
  {
    id: "8",
    name: "Coffee Maker - Used Once",
    price: 1400.0,
    discount: 50,
    sellingFast: true,
    verifiedSeller: true,
  },
  {
    id: "9",
    name: "Textbook: Organic Chemistry",
    price: 3400.0,
    discount: 40,
    verifiedSeller: true,
  },
  {
    id: "10",
    name: "Gaming Mouse - RGB",
    price: 2000.0,
    discount: 25,
    sellingFast: true,
    verifiedSeller: true,
  },
  {
    id: "11",
    name: "Backpack - North Face",
    price: 3100.0,
    discount: 35,
    verifiedSeller: true,
  },
  {
    id: "12",
    name: "Desk Lamp with USB Ports",
    price: 1100.0,
    discount: 60,
    sellingFast: true,
    verifiedSeller: true,
  },
];

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

        {/* Trending Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Trending in {campusName}
            </h2>
            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              See all →
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} {...product} isTrending={true} />
            ))}
          </div>
        </section>

        {/* Today's Deals Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Today's {campusName} Deals
            </h2>
            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              See all →
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
            {dealProducts.map((product) => (
              <ProductCard key={product.id} {...product} isDeal={true} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
