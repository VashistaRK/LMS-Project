import React from "react";
import {
  FaPython,
  FaJava,
  FaJs,
  FaCuttlefish,
  FaDatabase,
  FaRobot,
  FaRProject,
} from "react-icons/fa";
import { TbBrandCpp } from "react-icons/tb";
import { BiLogoGoLang } from "react-icons/bi";
import { SiOracle, SiTableau } from "react-icons/si";
import { RiInfinityLine } from "react-icons/ri";

/* ---------------------------------- TYPES --------------------------------- */

type SubjectOption = {
  value: string;
  icon: React.ReactNode;
};

type DifficultyOption = {
  label: string;
  value: string;
};

type FiltersState = {
  subjects: string[];
  difficulties: string[];
};

type FilterChangeType = "subjects" | "difficulties" | "clear-all";

type FilterPanelProps = {
  filters: FiltersState;
  filterOption: "subjects" | "difficulties";
  onFilterChange: (
    type: FilterChangeType,
    value?: string,
    checked?: boolean,
  ) => void;
  isMobile?: boolean;
  onClose?: () => void;
};

/* ============================== COMPONENT ============================== */

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  filterOption,
  onFilterChange,
  isMobile = false,
  onClose,
}) => {
  const subjects: SubjectOption[] = [
    { value: "Python", icon: <FaPython className="w-full h-full" /> },
    { value: "Java", icon: <FaJava className="w-full h-full" /> },
    { value: "JavaScript", icon: <FaJs className="w-full h-full" /> },
    { value: "C", icon: <FaCuttlefish className="w-full h-full" /> },
    { value: "SQL", icon: <FaDatabase className="w-full h-full" /> },
    { value: "AI & ML", icon: <FaRobot className="w-full h-full" /> },
    { value: "C++", icon: <TbBrandCpp className="w-full h-full" /> },
    { value: "Go", icon: <BiLogoGoLang className="w-full h-full" /> },
    { value: "R", icon: <FaRProject className="w-full h-full" /> },
    { value: "Oracle", icon: <SiOracle className="w-full h-full" /> },
    { value: "Tableau", icon: <SiTableau className="w-full h-full" /> },
    { value: "DevOps", icon: <RiInfinityLine className="w-full h-full" /> },
  ];

  const difficulties: DifficultyOption[] = [
    { label: "Beginner", value: "beginner" },
    { label: "Intermediate", value: "intermediate" },
    { label: "Advanced", value: "advanced" },
  ];

  return (
    <div
      className={`w-full h-full flex flex-col ${isMobile ? "fixed inset-0 z-50 bg-white" : ""}`}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-5 border-b">
        <h3 className="text-lg font-bold text-slate-800">
          Refine Your Learning
        </h3>

        {isMobile && (
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-sm font-medium bg-slate-200 hover:bg-slate-300"
          >
            Close
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {filterOption === "subjects" ? (
          <SubjectGrid
            options={subjects}
            selected={filters.subjects}
            onChange={(v, c) => onFilterChange("subjects", v, c)}
          />
        ) : (
          <DifficultyList
            options={difficulties}
            selected={filters.difficulties}
            onChange={(v, c) => onFilterChange("difficulties", v, c)}
          />
        )}
      </div>

      {/* Footer */}
      <div className="p-4 flex justify-end">
        <button
          onClick={() => onFilterChange("clear-all")}
          className="px-4 py-2 text-sm font-semibold rounded-xl bg-slate-800 text-white hover:bg-slate-700"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
};

/* ============================== SUBJECT GRID ============================== */

const SubjectGrid = ({
  options,
  selected,
  onChange,
}: {
  options: SubjectOption[];
  selected: string[];
  onChange: (value: string, checked: boolean) => void;
}) => (
  <div className="grid grid-cols-3 md:grid-cols-6 xl:grid-cols-8 gap-4">
    {options.map((opt) => {
      const isSelected = selected.includes(opt.value);

      return (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value, !isSelected)}
          className={`relative p-2 w-18 h-18 col-span-1 rounded-xl flex flex-col items-center justify-center transition
              ${
                isSelected
                  ? "border border-indigo-600 bg-indigo-50 text-indigo-600"
                  : ""
              }`}
        >
          {opt.icon}
          {opt.value}

          {isSelected && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white rounded-full text-xs flex items-center justify-center">
              ✓
            </span>
          )}
        </button>
      );
    })}
  </div>
);

/* ============================== DIFFICULTY LIST ============================== */

const DifficultyList = ({
  options,
  selected,
  onChange,
}: {
  options: DifficultyOption[];
  selected: string[];
  onChange: (value: string, checked: boolean) => void;
}) => (
  <div className="space-y-2">
    {options.map((opt) => (
      <label
        key={opt.value}
        className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-indigo-50 cursor-pointer"
      >
        <input
          type="checkbox"
          checked={selected.includes(opt.value)}
          onChange={(e) => onChange(opt.value, e.target.checked)}
          className="w-4 h-4"
        />
        <span className="text-sm font-medium">{opt.label}</span>
      </label>
    ))}
  </div>
);

export default FilterPanel;
