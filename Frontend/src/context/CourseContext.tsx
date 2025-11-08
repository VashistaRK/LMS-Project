/* eslint-disable react-refresh/only-export-components */
// CourseContext.tsx
import {
  createContext,
  useState,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from "react";
import type { CourseData } from "../types/course";

type CourseContextType = {
  courseData: CourseData | null;
  setCourseData: Dispatch<SetStateAction<CourseData | null>>;
};

export const CourseContext = createContext<CourseContextType>({
  courseData: null,
  setCourseData: () => {},
});

export const CourseProvider = ({ children }: { children: ReactNode }) => {
  const [courseData, setCourseData] = useState<CourseData | null>(null);

  return (
    <CourseContext.Provider value={{ courseData, setCourseData }}>
      {children}
    </CourseContext.Provider>
  );
};
