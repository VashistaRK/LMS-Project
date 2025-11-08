import { useEffect, useState } from "react";
import api from "../services/api";
import { socket } from "../lib/socket";
import { Star } from "lucide-react";

interface Review {
  _id: string;
  userId: string;
  userName?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ReviewsList({
  courseId,
  currentUser,
}: {
  courseId: string;
  currentUser?: { id: string; name?: string };
}) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");

  // ✅ Fetch top reviews
  useEffect(() => {
    api
      .get(`/api/reviews/course/${courseId}`)
      .then((r) => setReviews(r.data))
      .catch((err) => console.error("Failed to fetch reviews:", err));
  }, [courseId]);

  // ✅ Real-time updates
  useEffect(() => {
    socket.emit("joinRoom", courseId);
    socket.on("review:created", (review: Review) => {
      setReviews((prev) => [review, ...prev]);
    });
    return () => {
      socket.emit("leaveRoom", courseId);
      socket.off("review:created");
    };
  }, [courseId, currentUser]);

  // ✅ Post a new review
  const postReview = async () => {
    if (!currentUser?.id || !comment.trim()) return;
    const payload = { rating, comment: comment.trim(), currentUser };

    // Optimistic UI update
    const tempReview: Review = {
      _id: `temp-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name || "Anonymous",
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    };
    setReviews((r) => [tempReview, ...r]);
    setComment("");

    try {
      await api.post(`/api/reviews/${courseId}`, payload);
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

      {/* Review List */}
      <div className="mt-4 space-y-3">
        {reviews.length === 0 && (
          <p className="text-sm text-gray-500">No reviews yet.</p>
        )}
        {reviews.map((r) => (
          <div key={r._id} className="p-3 bg-white rounded shadow">
            <div className="flex justify-between">
              <div className="font-medium">{r.userName || r.userId}</div>
              <div className="text-sm text-gray-500">
                {new Date(r.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="mt-1 text-sm">{r.comment}</div>
        <div className="mt-2 text-yellow-600 flex items-center gap-1">
          <span className="ml-1 text-lg text-red-900">{r.rating}</span>
              {Array.from({ length: r.rating }, (_, i) => (
                <Star
                  key={i}
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
