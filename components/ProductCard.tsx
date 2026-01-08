"use client";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image?: string;
  isTrending?: boolean;
  isDeal?: boolean;
  discount?: number;
  sellingFast?: boolean;
  verifiedSeller?: boolean;
}

export default function ProductCard({
  id: _id,
  name,
  price,
  image,
  isTrending = false,
  isDeal = false,
  discount,
  sellingFast = false,
  verifiedSeller = true,
}: ProductCardProps) {
  const displayPrice = discount
    ? ((price * (100 - discount)) / 100).toFixed(2)
    : price.toFixed(2);

  return (
    <div className="flex-shrink-0 w-40 sm:w-48 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
      {/* Image Container */}
      <div className="relative w-full h-40 sm:h-48 bg-gray-100">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isTrending && (
            <span className="bg-orange-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              🔥 Trending
            </span>
          )}
          {isDeal && discount && (
            <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
          {sellingFast && (
            <span className="bg-indigo-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              Selling Fast
            </span>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
          {name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-lg font-bold text-indigo-600">
            ₱{displayPrice}
          </span>
          {discount && (
            <span className="text-xs text-gray-400 line-through">
              ₱{price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Seller Badge */}
        {verifiedSeller && (
          <div className="flex items-center gap-1">
            <svg
              className="w-3 h-3 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs text-gray-600">Verified Student</span>
          </div>
        )}
      </div>
    </div>
  );
}
