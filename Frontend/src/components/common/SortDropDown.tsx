import React from "react";

interface SortDropdownProps {
  currentSort: string;
  onSortChange: (value: string) => void;
  className?: string;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({
  currentSort,
  onSortChange,
  className = "",
}) => {
  const sortOptions = [
    { value: "popularity", label: "Popular" },
    { value: "newest", label: "Newest" },
    { value: "rating", label: "Top Rated" },
    { value: "price", label: "Price" },
    { value: "duration", label: "Duration" },
  ];

  const handleSortSelect = (sortValue: string) => {
    if (sortValue === "price") {
      onSortChange(currentSort === "price-low" ? "price-high" : "price-low");
      return;
    }

    if (sortValue === "duration") {
      onSortChange(
        currentSort === "duration-short" ? "duration-long" : "duration-short"
      );
      return;
    }

    onSortChange(sortValue);
  };

  const handleMobileSelect = (value: string) => {
    onSortChange(value);
  };

  return (
    <div className={className}>
      {/* Desktop */}
      <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
        {sortOptions.map((option) => {
          const isActive = currentSort.startsWith(option.value);

          return (
            <button
              key={option.value}
              onClick={() => handleSortSelect(option.value)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all
                ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-200"
                }
              `}
            >
              {option.value === "price"
                ? currentSort === "price-high"
                  ? "Price ↓"
                  : "Price ↑"
                : option.value === "duration"
                ? currentSort === "duration-long"
                  ? "Duration ↓"
                  : "Duration ↑"
                : option.label}
            </button>
          );
        })}
      </div>

      {/* Mobile */}
      <div className="flex md:hidden items-center gap-2">
        <span className="text-sm font-medium text-slate-600">Sort by</span>
        <select
          value={currentSort}
          onChange={(e) => handleMobileSelect(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border border-slate-300
                     text-sm font-medium bg-white
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="popularity">Popular</option>
          <option value="newest">Newest</option>
          <option value="rating">Top Rated</option>
          <option value="price-low">Price: Low → High</option>
          <option value="price-high">Price: High → Low</option>
          <option value="duration-short">Duration: Short → Long</option>
          <option value="duration-long">Duration: Long → Short</option>
        </select>
      </div>
    </div>
  );
};
