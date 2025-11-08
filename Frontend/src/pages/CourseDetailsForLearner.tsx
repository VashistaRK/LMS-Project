/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  Star,
  Clock,
  Users,
  BookOpen,
  Award,
  CheckCircle2,
  PlayCircle,
  FileText,
  Target,
  Settings,
  MessageSquare,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Chapters, CourseData } from "../types/course";
import NotesDisplay from "../components/NotesDisplay";

interface CourseDetailsProps {
  course: CourseData;
  chapter: Chapters | null;
}

const CourseDetails: React.FC<CourseDetailsProps> = ({ course, chapter }) => {
  const [activeSection, setActiveSection] = useState<"chapter" | "course">(
    "chapter"
  );
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="w-full bg-red-50 text-gray-900">
      {/* Modern Tab Navigation */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="px-6 py-4">
          <nav className="flex space-x-8" aria-label="Content sections">
            <button
              className={`relative py-2 px-1 text-sm font-medium transition-colors duration-200 ${
                activeSection === "chapter"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveSection("chapter")}
            >
              <div className="flex items-center gap-2">
                <PlayCircle size={16} />
                Current Chapter
              </div>
            </button>
            <button
              className={`relative py-2 px-1 text-sm font-medium transition-colors duration-200 ${
                activeSection === "course"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveSection("course")}
            >
              <div className="flex items-center gap-2">
                <BookOpen size={16} />
                Course Overview
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-6 py-8">
        {activeSection === "chapter" ? (
          /* Chapter Section */
          <div className="max-w-4xl mx-auto space-y-8">
            {chapter ? (
              <>
                {/* Chapter Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <PlayCircle size={24} className="text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {chapter.title}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock size={16} />
                          <span>{chapter.duration}</span>
                        </div>
                        {chapter.type && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium capitalize">
                            {chapter.type}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chapter Description */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Description
                    </h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {chapter.description ||
                      "No description available for this chapter."}
                  </p>
                </div>

                {/* Chapter Notes */}
                <NotesDisplay 
                  notesId={chapter.notesId}
                  manualNotes={chapter.notes || []}
                  className="mb-6"
                />
              </>
            ) : (
              /* No Chapter Selected State */
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-gray-100 rounded-full">
                    <PlayCircle size={48} className="text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No Chapter Selected
                    </h3>
                    <p className="text-gray-600">
                      Select a chapter from the sidebar to view its details and
                      notes.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Course Overview Section */
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Course Header */}
            <div className="bg-gradient-to-r from-[#ff915a] to-[#F67F45] text-white rounded-xl p-8">
              <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
              <p className="text-purple-100 text-lg leading-relaxed max-w-4xl">
                {course.description}
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={<Clock />}
                label="Total Duration"
                value={course.duration}
                color="blue"
              />
              <StatCard
                icon={<PlayCircle />}
                label="Lectures"
                value={course.chapterCount}
                color="green"
              />
              <StatCard
                icon={<Award />}
                label="Exercises"
                value={course.exerciseCount}
                color="purple"
              />
              <StatCard
                icon={<Users />}
                label="Students"
                value={course.studentCount}
                color="orange"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Learning Outcomes */}
                {course.learningOutcomes?.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Target size={20} className="text-green-600" />
                      <h3 className="text-xl font-semibold text-gray-900">
                        What you'll learn
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {course.learningOutcomes.map((outcome, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckCircle2
                            size={16}
                            className="text-green-500 mt-1 flex-shrink-0"
                          />
                          <span className="text-gray-700">{outcome}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prerequisites */}
                {course.prerequisites && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Settings size={20} className="text-red-600" />
                      <h3 className="text-xl font-semibold text-gray-900">
                        Prerequisites
                      </h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {course.prerequisites}
                    </p>
                  </div>
                )}

                {/* Features */}
                {course.features?.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Award size={20} className="text-purple-600" />
                      <h3 className="text-xl font-semibold text-gray-900">
                        Course Features
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {course.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckCircle2
                            size={16}
                            className="text-purple-500 mt-1 flex-shrink-0"
                          />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technologies */}
                {course.technologies?.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Settings size={20} className="text-blue-600" />
                      <h3 className="text-xl font-semibold text-gray-900">
                        Technologies Covered
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {course.technologies.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Instructor Card */}
                {course.instructor?.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      Instructor
                    </h3>
                    {course.instructor.map((inst, idx) => (
                      <div key={idx} className="space-y-4">
                        <div className="flex items-start gap-4">
                          <img
                            src={inst.image}
                            alt={inst.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {inst.name}
                            </h4>
                            <p className="text-sm text-purple-600 font-medium">
                              {inst.title}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {inst.bio}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Star
                              size={12}
                              className="text-yellow-400"
                              fill="currentColor"
                            />
                            <span className="font-medium">{inst.rating}</span>
                            <span>({inst.reviews})</span>
                          </div>
                          <span>{inst.students} students</span>
                          <span>{inst.courses} courses</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            {course.reviews?.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <MessageSquare size={20} className="text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    Student Reviews
                  </h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                    {course.reviewCount} reviews
                  </span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {course.reviews.map((review, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={review.avatar}
                          alt={review.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium text-gray-900">
                              {review.name}
                            </h5>
                            <span className="text-xs text-gray-500">
                              {review.date}
                            </span>
                          </div>
                          <div className="flex text-yellow-400 mb-2">
                            {Array.from({ length: review.rating }).map(
                              (_, i) => (
                                <Star key={i} size={14} fill="currentColor" />
                              )
                            )}
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {review.comment}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ Section */}
            {course.faq?.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <HelpCircle size={20} className="text-green-600" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    Frequently Asked Questions
                  </h3>
                </div>
                <div className="space-y-4">
                  {course.faq.map((faq, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-lg"
                    >
                      <button
                        className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                        onClick={() => toggleFaq(idx)}
                      >
                        <span className="font-medium text-gray-900">
                          {faq.question}
                        </span>
                        {expandedFaq === idx ? (
                          <ChevronUp size={20} className="text-gray-500" />
                        ) : (
                          <ChevronDown size={20} className="text-gray-500" />
                        )}
                      </button>
                      {expandedFaq === idx && (
                        <div className="px-4 pb-3 text-sm text-gray-600 border-t border-gray-200 bg-gray-50">
                          <p className="pt-3 leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: any;
  color: "blue" | "green" | "purple" | "orange";
}) => {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
  orange: "bg-red-100 text-red-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
      <div
        className={`w-12 h-12 mx-auto rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3`}
      >
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
};

export default CourseDetails;
