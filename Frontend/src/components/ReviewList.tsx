import { useEffect, useState } from "react";
import api from "../services/api";
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
    <div className="flex flex-col items-center justify-center space-y-8 lg:space-y-16">
      <header className="text-center">
        <h3 className="text-2xl font-extrabold">Course Reviews</h3>
        <h5 className="text-2xl font-extrabold text-zinc-500">
          Students FeedBack
        </h5>
      </header>
      {/* Reviews List */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
        {reviews.length === 0 && (
          <p className="text-sm text-gray-500">No reviews yet.</p>
        )}

        {reviews.map((r, i) => (
          <div key={i} className="p-3 lg:p-6 bg-white rounded-md space-y-6">
            <div className="">
              <div className="font-bold">{r.name}</div>
              <div className="text-sm text-gray-500">
                {new Date(r.date).toLocaleString()}
              </div>
            </div>
            <div className="text-sm">{r.comment}</div>

            <div className="flex items-center gap-1">
              <span className="text-lg">{r.rating}</span>
              {Array.from({ length: r.rating }, (_, idx) => (
                <Star key={idx} className="w-5 h-5" />
              ))}
            </div>
          </div>
        ))}
      </div>
      {currentUser ? (
        <div className="mr-auto p-3 bg-white rounded shadow">
          <div className="flex gap-2 items-center">
            <label htmlFor="rating">Give Your Rating</label>
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
            className="mt-2 px-4 py-2 bg-[#9CCFFF] rounded hover:bg-[#7abbf9] transition"
          >
            Post Review
          </button>
        </div>
      ) : (
        <p className="mt-3 text-sm text-gray-500">
          Please sign in to leave a review.
        </p>
      )}
    </div>
  );
}
