import { useEffect, useState } from "react";
import api from "../services/api";
import type { User } from "../hooks/useAuth";

/* -------------------- Types -------------------- */

interface Faq {
  _id: string;
  question: string;
  answer?: string;
  askedBy?: string;
  askedAt?: string;
  isTemp?: boolean;
}

interface FaqListProps {
  courseId: string;
  currentUser?: User;
}

/* -------------------- Component -------------------- */

export default function FaqList({ courseId, currentUser }: FaqListProps) {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [qText, setQText] = useState("");
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* -------------------- Fetch FAQs -------------------- */

  useEffect(() => {
    if (!courseId) return;

    const fetchFaqs = async () => {
      try {
        setLoading(true);
        const res = await api.get<Faq[]>(`/api/faqs/course/${courseId}`);
        setFaqs(res.data);
      } catch (err) {
        setError("Failed to load FAQs");
        console.error("Fetch FAQs error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, [courseId]);

  /* -------------------- Ask Question -------------------- */

  const askQuestion = async () => {
    if (!qText.trim() || posting) return;

    const tempId = `temp-${Date.now()}`;

    const optimisticFaq: Faq = {
      _id: tempId,
      question: qText.trim(),
      askedBy: currentUser?.name ?? "Anonymous",
      askedAt: new Date().toISOString(),
      isTemp: true,
    };

    // Optimistic update
    setFaqs((prev) => [optimisticFaq, ...prev]);
    setQText("");
    setPosting(true);

    try {
      const res = await api.post<Faq>(`/api/faqs/${courseId}`, {
        question: optimisticFaq.question,
        askedBy: optimisticFaq.askedBy,
      });

      // Replace temp FAQ with real one
      setFaqs((prev) => prev.map((f) => (f._id === tempId ? res.data : f)));
    } catch (err) {
      // Rollback optimistic update
      setFaqs((prev) => prev.filter((f) => f._id !== tempId));
      setError("Failed to post question. Try again.");
      console.error("Ask question error:", err);
    } finally {
      setPosting(false);
    }
  };

  /* -------------------- UI -------------------- */

  return (
    <div className="max-w-3xl mt-12">
      <h3 className="text-lg font-semibold text-gray-900">FAQs</h3>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-4 space-y-4">
        {loading ? (
          <p className="text-sm text-gray-500">Loading FAQs…</p>
        ) : faqs.length === 0 ? (
          <p className="text-sm text-gray-500">No questions yet.</p>
        ) : (
          faqs.map((f) => (
            <div
              key={f._id}
              className={`p-4 rounded-md border ${
                f.isTemp ? "opacity-70" : ""
              }`}
            >
              <p className="text-sm break-words whitespace-normal font-medium text-gray-700 text-wrap">
                Q: {f.question}
              </p>

              {f.answer ? (
                <p className="text-sm text-gray-900 mt-2">A: {f.answer}</p>
              ) : (
                <p className="text-sm text-gray-400 mt-2">Unanswered</p>
              )}

              {f.askedBy && (
                <p className="mt-2 text-xs text-gray-400">
                  Asked by {f.askedBy}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Ask Question */}
      <div className="mt-4">
        <textarea
          value={qText}
          onChange={(e) => setQText(e.target.value)}
          rows={3}
          placeholder="Ask a question…"
          className="w-full rounded-md border border-gray-300 p-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={askQuestion}
          disabled={posting || !qText.trim()}
          className="mt-2 px-4 py-2 rounded-md text-sm font-medium
                     bg-[#7abbf9] text-white
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {posting ? "Posting…" : "Ask"}
        </button>
      </div>
    </div>
  );
}
