import React, { useState } from "react";
import type { Reviews } from "../../types/course";

interface CourseReviewsProps {
  reviews: Reviews[];
  rating: number;
  students: number;
  allowComments?: boolean;
}

const CourseReviews: React.FC<CourseReviewsProps> = ({
  reviews,
  rating,
  students,
  allowComments,
}) => {
  const [newComment, setNewComment] = useState("");

  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;
    alert(`Comment submitted: ${newComment}`);
    setNewComment("");
  };

  return (
    <div className="space-y-6 py-6">
      {/* Rating Overview */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Student Feedback</h2>
        <div className="flex items-center gap-6">
          <div className="text-4xl font-bold text-purple-600">
            {rating?.toFixed(1)}
          </div>
          <div className="text-gray-700">
            <p>Average Rating</p>
            <p className="text-sm">{students} students</p>
          </div>
        </div>
      </section>

      {/* Reviews List */}
      <section>
        {reviews?.map((review, idx) => (
          <div key={idx} className="border-b py-4 last:border-none space-y-1">
            <p className="font-semibold">{review.name}</p>
            <p className="text-sm text-gray-600">
              ⭐ {review.rating.toFixed(1)} | {review.date}
            </p>
            <p className="text-gray-700">{review.comment}</p>
            <p className="text-sm text-gray-500">
              {review.helpful} people found this helpful
            </p>
          </div>
        )) ?? null}
      </section>

      {/* Comment Box (if enabled) */}
      {allowComments && (
        <section className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Leave a Comment</h3>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full border rounded-lg p-3 text-gray-700"
            placeholder="Write your comment..."
          />
          <button
            onClick={handleCommentSubmit}
            className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Submit
          </button>
        </section>
      )}
    </div>
  );
};

export default CourseReviews;
