/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { toast } from "sonner";
import type { CourseData } from "../../types/course";
import { useNavigate } from "react-router";
import { Lock, Play } from "lucide-react";
import { useAuthContext } from "../../context/AuthProvider";
// import api from "@/services/api";
import axios from "axios";

interface CourseActionButtonProps {
  course: CourseData;
}
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // send cookies by default
});

const CourseActionButton: React.FC<CourseActionButtonProps> = ({ course }) => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const hasAccess = !!user?.accessGranted;

  // 🟢 START LEARNING
  const handleStartLearning = async () => {
    try {
      await api.post(`/courses/${course.id}/start`);
      navigate(`/my-courses/${course.id}`);
    } catch (err) {
      toast.error("Failed to start course", err as any);
      console.log("Start course error:", err);
    }
  };

  // 🟢 USER HAS ACCESS
  if (hasAccess) {
    return (
      <button
        onClick={handleStartLearning}
        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5
                   flex items-center gap-2 rounded text-xs sm:text-sm font-medium transition"
      >
        <Play className="h-4 w-4" />
        Start Learning
      </button>
    );
  }

  // 🔒 LOGGED IN BUT NO ACCESS
  if (user && !hasAccess) {
    return (
      <button
        onMouseEnter={() =>
          toast.warning("Access should be granted by the admin")
        }
        onClick={() => toast.warning("Access should be granted by the admin")}
        className="bg-gray-200 text-gray-600 px-3 py-1.5
                   flex items-center gap-2 rounded text-xs sm:text-sm
                   font-medium cursor-not-allowed"
      >
        <Lock className="h-4 w-4" />
        Locked
      </button>
    );
  }

  // 🔵 NOT LOGGED IN
  return (
    <button
      onClick={() => navigate("/Authenticate")}
      className="border px-3 py-1.5 rounded text-xs sm:text-sm font-medium
                 hover:bg-gray-100 transition"
    >
      Register
    </button>
  );
};

export default CourseActionButton;
