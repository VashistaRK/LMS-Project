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
    { value: "rating", label: "Rated" },
    { value: "price", label: "Price" }, // toggle
    { value: "duration", label: "Duration" }, // toggle
  ];

  const handleSortSelect = (sortValue: string) => {
    // Toggle logic for Price
    if (sortValue === "price") {
      if (currentSort === "price-low") {
        onSortChange("price-high");
      } else {
        onSortChange("price-low");
      }
      return;
    }

    // Toggle logic for Duration
    if (sortValue === "duration") {
      if (currentSort === "duration-short") {
        onSortChange("duration-long");
      } else {
        onSortChange("duration-short");
      }
      return;
    }

    // Normal case
    onSortChange(sortValue);
  };

  const handleMobileSelect = (value: string) => {
    // For mobile dropdown, directly set the value since it includes the specific sort direction
    onSortChange(value);
  };

  return (
    <div className={`${className}`}>
      {/* Desktop Buttons */}
      <div className="hidden md:flex flex-wrap border border-red-300 overflow-hidden">
        {sortOptions.map((option, index) => (
          <button
            key={option.value}
            onClick={() => handleSortSelect(option.value)}
            className={`p-2 px-3 text-sm font-bold transition-colors duration-200 ${
              currentSort.startsWith(option.value)
                ? "bg-[#C21817] text-white shadow-md"
                : "text-gray-700 hover:bg-red-200"
            } ${index > 0 ? "border-l border-red-300" : ""}`}
          >
            {option.value === "price"
              ? currentSort === "price-high"
                ? "Price: High → Low ↑↓"
                : "Price: Low → High ↑↓"
              : option.value === "duration"
              ? currentSort === "duration-long"
                ? "Duration: Long → Short ↑↓"
                : "Duration: Short → Long ↑↓"
              : option.label}
          </button>
        ))}
      </div>

      {/* Mobile Dropdown */}
      <div className="flex flex-row items-center md:hidden">
        <p>SortBy:</p>
        <select
          value={currentSort}
          onChange={(e) => handleMobileSelect(e.target.value)}
          className="w-full p-1 border border-gray-300 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#C21817]"
        >
          <option value="popularity">Popular</option>
          <option value="newest">Newest</option>
          <option value="rating">Rated</option>
          <option value="price-low">Price: Low → High</option>
          <option value="price-high">Price: High → Low</option>
          <option value="duration-short">Duration: Short → Long</option>
          <option value="duration-long">Duration: Long → Short</option>
        </select>
      </div>
    </div>
  );
};
