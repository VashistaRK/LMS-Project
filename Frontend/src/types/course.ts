/* eslint-disable @typescript-eslint/no-explicit-any */
export interface CourseData {
  chapters: any;
  id?: string; //
  title: string; //
  description: string; //
  shortDescription: string; //
  // thumbnail: File | null; //
  thumbnail?: File | ThumbnailData | null;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert"; //
  price: number; //
  discountPrice: number; //
  duration: string; //
  language: "English" | "Spanish" | "French" | "German"; //
  chapterCount: number; //
  exerciseCount: number; //
  technologies: string[]; //
  certificateEnabled: boolean; //
  features: string[]; //
  prerequisites: string; //
  learningOutcomes: string[]; //
  isPublished: boolean;
  isFeatured: boolean;
  allowComments: boolean;
  sections: Sections[]; //
  instructor: Instructor[]; //
  rating: number; //
  reviewCount: number; //
  studentCount: number; //
  reviews: Reviews[];
  faq: Faq[];
}

export interface Faq {
  question: string;
  answer: string;
}

export interface Reviews {
  name: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
}

export interface ThumbnailData {
  data: { type: string; data: number[] }; // what mongoose sends for Buffer
  contentType: string;
}

export interface Sections {
  title: string;
  lectureCount: number;
  duration: string;
  chapters: Chapters[];
}

export interface Chapters {
  title: string;
  description: string;
  duration: string;
  type: "video" | "quiz" | "assignment";
  isPreviewable: boolean;
  tags: string[];
  video: string;
  testId: string;
  notes: {
    heading?: string;
    content: string;
  }[];
  notesId: string;
}

export interface Instructor {
  // map(arg0: (i: { name: any; }) => JSX.Element): import("react").ReactNode;
  name: string;
  title: string;
  image: string;
  bio: string;
  rating: number;
  reviews: number;
  students: number;
  courses: number;
  expertise: string[];
  education: Education[];
  achivements: string[];
}

export interface TestCase {
  input: string; // JS code input (like "twoSum([2,7,11,15], 9)")
  expected: any; // Expected output
}

export interface Question {
  id: number;
  title: string;
  description: string;
  examples: string[];
  constraints: string;
  starterCode: string;
  functionName: string;
  runCases: TestCase[];
  testCases: TestCase[];
}

export interface Education {
  college: string;
  degree: string;
  year: number;
}

export interface CategoryOption {
  value: string;
  label: string;
}

export interface DifficultyLevel {
  value: "beginner" | "intermediate" | "advanced" | "expert";
  label: string;
}

export interface LanguageOption {
  value: "english" | "spanish" | "french" | "german";
  label: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: string;
}
