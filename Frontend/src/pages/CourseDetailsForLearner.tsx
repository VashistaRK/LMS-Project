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
  Target,
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
    <div className="w-full text-gray-900">
      {/* Modern Tab Navigation */}
      <div className="sticky top-4 md:top-0 bg-white/90 backdrop-blur-sm z-10">
        <div className="px-4 sm:px-6 py-3">
          <nav
            className="flex flex-wrap gap-4 sm:gap-8"
            aria-label="Content sections"
          >
            <button
              className={`relative py-2 px-1 text-sm font-medium transition-colors duration-200 ${
                activeSection === "chapter"
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-500 hover:text-black"
              }`}
              onClick={() => setActiveSection("chapter")}
            >
              <div className="flex items-center gap-2">
                <PlayCircle size={16} />
                Current Chapter Overview
              </div>
            </button>
            <button
              className={`relative py-2 px-1 text-sm font-medium transition-colors duration-200 ${
                activeSection === "course"
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-500 hover:text-black"
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
      <div className="px-4 sm:px-6 py-6 max-w-6xl mx-auto">
        {activeSection === "chapter" ? (
          /* Chapter Section */
          <div className="mx-auto space-y-8">
            {chapter ? (
              <>
                {/* Chapter Description */}
                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Chapter Description
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
              <div className="p-12 text-center">
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
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Course Header */}
            <div className="p-6 sm:p-8 border-l-4 border-purple-600 bg-purple-50 rounded-r-xl">
              <h1 className="text-2xl sm:text-3xl font-bold mb-3">
                {course.title}
              </h1>
              <p className="text-base sm:text-lg leading-relaxed max-w-full">
                {course.description}
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard
                icon={<Clock />}
                label="Total Duration"
                value={course.duration}
              />
              <StatCard
                icon={<PlayCircle />}
                label="Lectures"
                value={course.chapterCount}
              />
              <StatCard
                icon={<Award />}
                label="Exercises"
                value={course.exerciseCount}
              />
              <StatCard
                icon={<Users />}
                label="Students"
                value={course.studentCount}
              />
            </div>

            <div className="flex space-y-8 lg:space-y-12 mb-12 flex-col">
              {/* Main Content */}
              <div className="space-y-8">
                {/* Learning Outcomes */}
                {course.learningOutcomes?.length > 0 && (
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center gap-2">
                      <Target size={20} className="text-green-600" />
                      <h3 className="text-xl font-semibold text-gray-900">
                        What you'll learn
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <div className="px-4 sm:px-6 space-y-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Prerequisites
                    </h3>
                    <p className="text-gray-700">{course.prerequisites}</p>
                  </div>
                )}

                {/* Features */}
                {course.features?.length > 0 && (
                  <div className="px-4 sm:px-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Course Features
                    </h3>
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
                  <div className="px-4 sm:px-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Technologies Covered
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {course.technologies.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-2 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            {course.reviews?.length > 0 && (
              <div className="px-6">
                <div className="flex items-center gap-2 mb-6">
                  <MessageSquare size={20} className="text-purple-600" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    Student Reviews
                  </h3>
                  <span className="px-2 text-purple-700 text-xs font-medium">
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
              <div className="px-6">
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
}: {
  icon: React.ReactNode;
  label: string;
  value: any;
}) => {
  return (
    <div className="p-3 sm:p-4 bg-white rounded-lg shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div className="w-10 h-10 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 truncate">{label}</p>
        <p className="font-semibold truncate">{value}</p>
      </div>
    </div>
  );
};

export default CourseDetails;
