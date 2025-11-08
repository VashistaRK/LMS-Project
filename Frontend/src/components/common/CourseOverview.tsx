import React from "react";
import type { CourseData } from "../../types/course";

interface CourseOverviewProps {
  course: CourseData;
}

const CourseOverview: React.FC<CourseOverviewProps> = ({ course }) => {
  return (
    <div className="space-y-8 py-6">
      {/* Description */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Course Description</h2>
        <p className="text-gray-700 leading-relaxed">{course.description}</p>
      </section>

      {/* Learning Outcomes */}
      <section>
        <h2 className="text-xl font-semibold mb-2">What you'll learn</h2>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          {course.learningOutcomes?.map((outcome, idx) => (
            <li key={idx}>{outcome}</li>
          ))}
        </ul>
      </section>

      {/* Prerequisites */}
      {course.prerequisites && (
        <section>
          <h2 className="text-xl font-semibold mb-2">Prerequisites</h2>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {(Array.isArray(course.prerequisites)
                ? course.prerequisites
                : [course.prerequisites]
              ).map((req, idx) => (
                <li key={idx}>{req}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Technologies */}
      {course.technologies && course.technologies.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-2">Technologies Covered</h2>
          <div className="flex flex-wrap gap-2">
            {course.technologies.map((tech, idx) => (
              <span
                key={idx}
                className="px-3 py-1 text-sm rounded-full bg-purple-100 text-purple-700 font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default CourseOverview;
