/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

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
    { label: "5–10 hours", value: "5-10" },
    { label: "10–20 hours", value: "10-20" },
    { label: "Over 20 hours", value: "over-20" },
  ];

  const ratings = [
    { label: "4.5 & up", value: "4.5" },
    { label: "4.0 & up", value: "4.0" },
    { label: "3.5 & up", value: "3.5" },
    { label: "3.0 & up", value: "3.0" },
  ];

  return (
    <div
      className={`
        w-full h-full rounded-2xl
        bg-gradient-to-br from-slate-50 via-indigo-50/60 to-cyan-50
        border border-slate-200 shadow-xl
        flex flex-col
        ${isMobile ? "fixed inset-0 z-50" : ""}
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-5 border-b border-slate-200 bg-white/60 backdrop-blur">
        <h3 className="text-lg font-bold text-slate-800">
          Refine Your Learning
        </h3>

        {isMobile && (
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-sm font-medium
                       bg-slate-200 hover:bg-slate-300 transition"
          >
            Close
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <FilterSection
          title="Subject"
          options={subjects.map((s) => ({ label: s, value: s }))}
          selected={filters?.subjects || []}
          onChange={(v, c) => onFilterChange("subjects", v, c)}
        />

        <FilterSection
          title="Difficulty"
          options={difficulties.map((d) => ({ label: d, value: d }))}
          selected={filters?.difficulties || []}
          onChange={(v, c) => onFilterChange("difficulties", v, c)}
        />

        <FilterSection
          title="Price"
          options={priceRanges}
          selected={filters?.priceRanges || []}
          onChange={(v, c) => onFilterChange("priceRanges", v, c)}
        />

        <FilterSection
          title="Duration"
          options={durations}
          selected={filters?.durations || []}
          onChange={(v, c) => onFilterChange("durations", v, c)}
        />

        <FilterSection
          title="Rating"
          options={ratings}
          selected={filters?.ratings || []}
          onChange={(v, c) => onFilterChange("ratings", v, c)}
        />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 bg-white/70 backdrop-blur flex justify-end">
        <button
          onClick={() => onFilterChange("clear-all")}
          className="px-4 py-2 text-sm font-semibold rounded-xl
                     bg-slate-800 text-white
                     hover:bg-slate-700 transition"
        >
          Clear All Filters
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
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-xl border border-slate-200 bg-white/60 backdrop-blur p-3">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex justify-between items-center text-sm font-semibold text-slate-800"
      >
        {title}
        {open ? (
          <ChevronUp className="w-4 h-4 text-slate-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-500" />
        )}
      </button>

      <div
        className={`transition-all duration-300 overflow-hidden ${
          open ? "max-h-96 mt-3" : "max-h-0"
        }`}
      >
        <div className="space-y-2">
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-3 px-2 py-1.5 rounded-lg
                         hover:bg-indigo-50 transition cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={(e) => onChange(opt.value, e.target.checked)}
                className="w-4 h-4 rounded border-slate-300
                           text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-slate-700">
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
