import { useEffect, useState } from "react";
import api from "../services/api";
import { socket } from "../lib/socket";
import { Star } from "lucide-react";

interface Review {
  name: string;
  avatar?: string;
  rating: number;
  comment: string;
  date: string;
}

export default function ReviewsList({
  courseId,
  currentUser,
}: {
  courseId: string;
  currentUser?: { id: string; name?: string; avatar?: string };
}) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");

  /* -------------------------------------------
     FETCH REVIEWS FOR A COURSE
     GET /api/courses/:courseId/reviews
  ------------------------------------------- */
  useEffect(() => {
    api
      .get(`/courses/${courseId}/reviews`)
      .then((r) => {
        setReviews(r.data.reviews || []); // FIXED
      })
      .catch((err) => console.error("Failed to fetch reviews:", err));
  }, [courseId]);

  /* -------------------------------------------
     REAL-TIME SOCKET UPDATES
  ------------------------------------------- */
  useEffect(() => {
    socket.emit("joinRoom", courseId);

    socket.on("review:created", (review: Review) => {
      setReviews((prev) => [review, ...prev]);
    });

    return () => {
      socket.emit("leaveRoom", courseId);
      socket.off("review:created");
    };
  }, [courseId]);

  /* -------------------------------------------
     POST A NEW REVIEW
     POST /api/courses/:courseId/reviews
  ------------------------------------------- */
  const postReview = async () => {
    if (!currentUser?.name || !rating) return;

    const payload = {
      name: currentUser.name,
      avatar: currentUser.avatar || "",
      rating,
      comment,
    };

    // Optimistic UI update
    const tempReview: Review = {
      name: currentUser.name,
      avatar: currentUser.avatar,
      rating,
      comment,
      date: new Date().toISOString(),
    };

    setReviews((prev) => [tempReview, ...prev]);
    setComment("");

    try {
      await api.post(`/courses/${courseId}/reviews`, payload);
    } catch (err) {
      console.error("Failed to post review:", err);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold">Top Reviews</h3>

      {/* Review Form */}
      {currentUser ? (
        <div className="mt-3 p-3 bg-white rounded shadow">
          <div className="flex gap-2 items-center">
            <label htmlFor="rating">Rating</label>
            <select
              id="rating"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="border rounded px-2 py-1"
            >
              {[5, 4, 3, 2, 1].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full rounded mt-2 p-2 border"
            placeholder="Write your review..."
          />

          <button
            onClick={postReview}
            className="mt-2 px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 transition"
          >
            Post Review
          </button>
        </div>
      ) : (
        <p className="mt-3 text-sm text-gray-500">
          Please sign in to leave a review.
        </p>
      )}

      {/* Reviews List */}
      <div className="mt-4 space-y-3">
        {reviews.length === 0 && (
          <p className="text-sm text-gray-500">No reviews yet.</p>
        )}

        {reviews.map((r, i) => (
          <div key={i} className="p-3 bg-white rounded shadow">
            <div className="flex justify-between">
              <div className="font-medium">{r.name}</div>
              <div className="text-sm text-gray-500">
                {new Date(r.date).toLocaleString()}
              </div>
            </div>
            <div className="mt-1 text-sm">{r.comment}</div>

            <div className="mt-2 flex items-center gap-1 text-yellow-500">
              <span className="text-lg text-red-900">{r.rating}</span>
              {Array.from({ length: r.rating }, (_, idx) => (
                <Star
                  key={idx}
                  className="w-5 h-5 text-yellow-500 fill-yellow-500"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
