import React from "react";
import type { Instructor } from "../../types/course";

interface CourseInstructorProps {
  instructor: Instructor[];
}

const CourseInstructor: React.FC<CourseInstructorProps> = ({ instructor }) => {
  return (
    <div className=" space-y-10 py-6">
      <h2 className="text-2xl font-bold text-gray-900">Instructor</h2>

      {instructor.map((inst, index) => (
        <div
          key={index}
          className="flex flex-col md:flex-row gap-6 bg-red-200/50 p-6 rounded-xl shadow-sm border border-gray-100"
        >
          {/* Avatar */}
          <div className="flex-shrink-0">
            <img
              src={inst.image || "/default-avatar.png"}
              alt={inst.name}
              className="w-32 h-32 rounded-xl object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900">{inst.name}</h3>
            <p className="text-blue-600 font-medium">{inst.title}</p>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 mt-4 text-sm text-gray-600">
              <span>⭐ {inst.rating.toFixed(1)} Instructor Rating</span>
              <span>📝 {inst.reviews.toLocaleString()} Reviews</span>
              <span>👨‍🎓 {inst.students.toLocaleString()} Students</span>
              <span>📚 {inst.courses} Courses</span>
            </div>

            {/* Bio */}
            <p className="mt-4 text-gray-700 leading-relaxed">{inst.bio}</p>

            {/* Expertise */}
            {inst.expertise?.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Expertise:</h4>
                <div className="flex flex-wrap gap-2">
                  {inst.expertise.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {inst.education?.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Education:</h4>
                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                  {inst.education.map((edu, i) => (
                    <li key={i}>
                      {edu.degree} – {edu.college} ({edu.year})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Achievements */}
            {inst.achivements?.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Achievements:
                </h4>
                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                  {inst.achivements.map((ach, i) => (
                    <li key={i}>{ach}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CourseInstructor;
