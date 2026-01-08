"use client";

import { useState, useRef, useEffect } from "react";
import { useCampus, POPULAR_CAMPUSES } from "@/context/CampusContext";
import { useAuth } from "@/hooks/useAuth";

export default function CampusSelector() {
  const { selectedCampus, setSelectedCampus, isBrowsingOtherCampus } =
    useCampus();
  const { user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setSearchQuery("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter campuses based on search
  const filteredCampuses = POPULAR_CAMPUSES.filter((campus) =>
    campus.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCampusSelect = (campus: string) => {
    setSelectedCampus(campus);
    setShowDropdown(false);
    setSearchQuery("");
    // Refresh the page to show new campus products
    window.location.reload();
  };

  const handleResetToMyCampus = () => {
    if (user?.school) {
      setSelectedCampus(user.school);
      setShowDropdown(false);
      setSearchQuery("");
      window.location.reload();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          isBrowsingOtherCampus
            ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span className="hidden sm:inline max-w-[120px] truncate">
          {selectedCampus}
        </span>
        <span className="sm:hidden">Campus</span>
        {isBrowsingOtherCampus && (
          <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-700">
            Browsing
          </span>
        )}
        <svg
          className={`w-4 h-4 transition-transform ${
            showDropdown ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute left-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900">
                Select Campus
              </h3>
              {isBrowsingOtherCampus && user?.school && (
                <button
                  onClick={handleResetToMyCampus}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Back to My Campus
                </button>
              )}
            </div>
            <input
              type="text"
              placeholder="Search campuses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Campus List */}
          <div className="max-h-64 overflow-y-auto">
            {/* My Campus (if browsing other campus) */}
            {isBrowsingOtherCampus && user?.school && (
              <button
                onClick={() => handleCampusSelect(user.school)}
                className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors border-b border-gray-100"
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-indigo-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <div className="font-medium text-gray-900">
                      {user.school}
                    </div>
                    <div className="text-xs text-gray-500">My Campus</div>
                  </div>
                </div>
              </button>
            )}

            {/* Popular Campuses */}
            {filteredCampuses.length > 0 ? (
              filteredCampuses.map((campus) => (
                <button
                  key={campus}
                  onClick={() => handleCampusSelect(campus)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                    selectedCampus === campus ? "bg-indigo-50" : ""
                  }`}
                >
                  <div className="font-medium text-gray-900">{campus}</div>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                No campuses found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
