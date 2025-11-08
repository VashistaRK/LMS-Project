/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react"; // npm i lucide-react

type FilterPanelProps = {
  filters: any;
  onFilterChange: (type: string, value?: string, checked?: boolean) => void;
  isMobile?: boolean;
  onClose?: () => void;
};

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  isMobile = false,
  onClose,
}) => {
  const subjects = [
    "Python",
    "Java",
    "JavaScript",
    "C++",
    "C",
    "Go",
    "R",
    "SQL",
    "Oracle",
    "AI & ML",
    "AI Agents",
    "DevOps",
    "Tableau",
  ];
  const difficulties = ["Beginner", "Intermediate", "Advanced"];
  const priceRanges = [
    { label: "Free", value: "free" },
    { label: "Under $50", value: "under-50" },
    { label: "$50 - $100", value: "50-100" },
    { label: "$100 - $200", value: "100-200" },
    { label: "Over $200", value: "over-200" },
  ];
  const durations = [
    { label: "Under 5 hours", value: "under-5" },
    { label: "5-10 hours", value: "5-10" },
    { label: "10-20 hours", value: "10-20" },
    { label: "Over 20 hours", value: "over-20" },
  ];
  const ratings = [
    { label: "4.5 & up", value: "4.5" },
    { label: "4.0 & up", value: "4.0" },
    { label: "3.5 & up", value: "3.5" },
    { label: "3.0 & up", value: "3.0" },
  ];

  const toggleFilter = (type: string, value: string, checked: boolean) => {
    onFilterChange(type, value, checked);
  };

  return (
    <div
      className={`w-full h-full bg-red-50 rounded-md flex flex-col shadow-md
        ${isMobile ? "fixed inset-0 z-50" : ""}`}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-red-200">
        <h3 className="text-lg font-semibold text-gray-900">Filter Courses</h3>
        {isMobile && (
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg text-sm bg-red-200 hover:bg-red-300 transition"
          >
            Close
          </button>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="p-2 space-y-4 overflow-y-auto flex-1">
        <FilterSection
          title="Subject"
          options={subjects.map((s) => ({ label: s, value: s }))}
          selected={filters?.subjects || []}
          onChange={(val, checked) => toggleFilter("subjects", val, checked)}
        />
        <FilterSection
          title="Difficulty"
          options={difficulties.map((d) => ({ label: d, value: d }))}
          selected={filters?.difficulties || []}
          onChange={(val, checked) =>
            toggleFilter("difficulties", val, checked)
          }
        />
        <FilterSection
          title="Price"
          options={priceRanges}
          selected={filters?.priceRanges || []}
          onChange={(val, checked) => toggleFilter("priceRanges", val, checked)}
        />
        <FilterSection
          title="Duration"
          options={durations}
          selected={filters?.durations || []}
          onChange={(val, checked) => toggleFilter("durations", val, checked)}
        />
        <FilterSection
          title="Rating"
          options={ratings}
          selected={filters?.ratings || []}
          onChange={(val, checked) => toggleFilter("ratings", val, checked)}
        />
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-red-200 flex justify-end">
        <button
          onClick={() => onFilterChange("clear-all")}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-red-200 rounded-lg border border-gray-800 transition hover:cursor-pointer"
        >
          Clear All
        </button>
      </div>
    </div>
  );
};

type FilterSectionProps = {
  title: string;
  options: { label: string; value: string }[];
  selected: string[];
  onChange: (value: string, checked: boolean) => void;
};

const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  options,
  selected,
  onChange,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-red-100 pb-2">
      {/* Header Row */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex justify-between items-center text-sm font-semibold text-gray-800 hover:text-gray-900 transition"
      >
        <span>{title}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {/* Collapsible Options */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-96 mt-2" : "max-h-0"
        }`}
      >
        <div className="space-y-2">
          {options.map((opt) => (
            <label
              key={opt.value}
              className="group flex items-center gap-2 text-xs cursor-pointer py-1 hover:bg-red-100 transition"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={(e) => onChange(opt.value, e.target.checked)}
                className="w-4 h-4 rounded focus:ring-red-500 transition"
              />
              <span className="text-gray-700 group-hover:text-gray-900 font-medium">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
