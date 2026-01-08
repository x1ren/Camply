"use client";

interface Category {
  id: string;
  name: string;
  icon: string;
}

const categories: Category[] = [
  { id: "essentials", name: "School Essentials", icon: "📚" },
  { id: "clothing", name: "Thrift & Clothing", icon: "👕" },
  { id: "gadgets", name: "Gadgets", icon: "💻" },
  { id: "food", name: "Food & Snacks", icon: "🍕" },
  { id: "dorm", name: "Dorm / Boarding", icon: "🛏️" },
  { id: "services", name: "Services", icon: "🎓" },
];

export default function CategoryRow() {
  return (
    <div className="bg-white py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              className="flex flex-col items-center gap-2 min-w-[80px] sm:min-w-[100px] p-3 rounded-xl hover:bg-gray-50 transition-colors group"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full flex items-center justify-center text-2xl sm:text-3xl group-hover:scale-110 transition-transform shadow-sm">
                {category.icon}
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
