export interface CoursesProps {
  id: number;
  title: string;
  instructor: string;
  thumbnail: string;
  subject: string;
  difficulty: string;
  duration: string;
  rating: number;
  reviewCount: number;
  price: number;
  originalPrice: number;
  isEnrolled: boolean;
  description: string;
}
export const Courses: CoursesProps[] = [
  {
    id: 1,
    title: "Complete Python Programming Bootcamp",
    instructor: "Dr. Sarah Wilson",
    thumbnail:
      "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=300&fit=crop",
    subject: "Python",
    difficulty: "Beginner",
    duration: "12 hours",
    rating: 4.8,
    reviewCount: 2847,
    price: 89.99,
    originalPrice: 149.99,
    isEnrolled: false,
    description:
      "Master Python programming from basics to advanced concepts with hands-on projects and real-world applications.",
  },
  {
    id: 2,
    title: "Advanced Java Enterprise Development",
    instructor: "Michael Rodriguez",
    thumbnail:
      "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=300&fit=crop",
    subject: "Java",
    difficulty: "Advanced",
    duration: "25 hours",
    rating: 4.7,
    reviewCount: 1923,
    price: 129.99,
    originalPrice: 199.99,
    isEnrolled: true,
    description:
      "Build enterprise-grade Java applications using Spring Boot, Hibernate, and modern development practices.",
  },
  {
    id: 3,
    title: "JavaScript ES6+ Modern Development",
    instructor: "Emily Chen",
    thumbnail:
      "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop",
    subject: "JavaScript",
    difficulty: "Intermediate",
    duration: "18 hours",
    rating: 4.9,
    reviewCount: 3421,
    price: 79.99,
    originalPrice: 119.99,
    isEnrolled: false,
    description:
      "Learn modern JavaScript features, async programming, and build dynamic web applications.",
  },
  {
    id: 4,
    title: "Machine Learning Fundamentals",
    instructor: "Dr. Alex Kumar",
    thumbnail:
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop",
    subject: "AI & ML",
    difficulty: "Intermediate",
    duration: "30 hours",
    rating: 4.6,
    reviewCount: 1567,
    price: 159.99,
    originalPrice: 249.99,
    isEnrolled: false,
    description:
      "Comprehensive introduction to machine learning algorithms, data preprocessing, and model evaluation.",
  },
  {
    id: 5,
    title: "DevOps with Docker and Kubernetes",
    instructor: "James Thompson",
    thumbnail:
      "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=400&h=300&fit=crop",
    subject: "DevOps",
    difficulty: "Advanced",
    duration: "22 hours",
    rating: 4.5,
    reviewCount: 892,
    price: 139.99,
    originalPrice: 199.99,
    isEnrolled: false,
    description:
      "Master containerization and orchestration with Docker, Kubernetes, and CI/CD pipelines.",
  },
  {
    id: 6,
    title: "SQL Database Design and Optimization",
    instructor: "Maria Garcia",
    thumbnail:
      "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&h=300&fit=crop",
    subject: "SQL",
    difficulty: "Intermediate",
    duration: "16 hours",
    rating: 4.7,
    reviewCount: 2156,
    price: 69.99,
    originalPrice: 99.99,
    isEnrolled: false,
    description:
      "Learn advanced SQL queries, database design principles, and performance optimization techniques.",
  },
  {
    id: 7,
    title: "C++ Systems Programming",
    instructor: "Robert Kim",
    thumbnail:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=300&fit=crop",
    subject: "C++",
    difficulty: "Advanced",
    duration: "28 hours",
    rating: 4.4,
    reviewCount: 743,
    price: 119.99,
    originalPrice: 179.99,
    isEnrolled: false,
    description:
      "Deep dive into C++ for system-level programming, memory management, and performance optimization.",
  },
  {
    id: 8,
    title: "Data Science with R Programming",
    instructor: "Dr. Lisa Park",
    thumbnail:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
    subject: "R",
    difficulty: "Beginner",
    duration: "20 hours",
    rating: 4.6,
    reviewCount: 1334,
    price: 94.99,
    originalPrice: 139.99,
    isEnrolled: false,
    description:
      "Statistical analysis and data visualization using R programming language for data science applications.",
  },
  {
    id: 9,
    title: "Go Programming for Backend Development",
    instructor: "David Lee",
    thumbnail:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop",
    subject: "Go",
    difficulty: "Intermediate",
    duration: "15 hours",
    rating: 4.5,
    reviewCount: 567,
    price: 84.99,
    originalPrice: 124.99,
    isEnrolled: false,
    description:
      "Build scalable backend services and APIs using Go programming language and modern frameworks.",
  },
  {
    id: 10,
    title: "Tableau Data Visualization Mastery",
    instructor: "Jennifer Brown",
    thumbnail:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
    subject: "Tableau",
    difficulty: "Beginner",
    duration: "14 hours",
    rating: 4.8,
    reviewCount: 1876,
    price: 74.99,
    originalPrice: 109.99,
    isEnrolled: false,
    description:
      "Create stunning data visualizations and interactive dashboards using Tableau Desktop and Server.",
  },
  {
    id: 11,
    title: "Oracle Database Administration",
    instructor: "Thomas Anderson",
    thumbnail:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop",
    subject: "Oracle",
    difficulty: "Advanced",
    duration: "35 hours",
    rating: 4.3,
    reviewCount: 456,
    price: 179.99,
    originalPrice: 249.99,
    isEnrolled: false,
    description:
      "Comprehensive Oracle database administration including installation, configuration, and performance tuning.",
  },
  {
    id: 12,
    title: "AI Agents and Autonomous Systems",
    instructor: "Dr. Rachel Green",
    thumbnail:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop",
    subject: "AI Agents",
    difficulty: "Advanced",
    duration: "26 hours",
    rating: 4.7,
    reviewCount: 234,
    price: 199.99,
    originalPrice: 299.99,
    isEnrolled: false,
    description:
      "Design and implement intelligent agents using reinforcement learning and multi-agent systems.",
  },
];
