import { useEffect, useState } from "react";
import API from "../services/api";

interface Faq {
  _id: string;
  courseId: string;
  askedBy: string;
  question: string;
  createdAt?: string;
}

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [answerText, setAnswerText] = useState<Record<string, string>>({});

  useEffect(() => {
    API.get("/api/admin/faqs/unanswered")
      .then((r) => setFaqs(r.data))
      .catch((err) => console.error("Error fetching FAQs:", err));
  }, []);

  const submitAnswer = async (faq: Faq): Promise<void> => {
    const ans = answerText[faq._id];
    if (!ans) return alert("Answer required");
    try {
      console.log("Submitting answer", faq._id, ans);
      await API.post(`/api/admin/faqs/${faq._id}/answer`, { answer: ans });
      // Remove the answered FAQ from the list
      setFaqs((prev) => prev.filter((f) => f._id !== faq._id));
    } catch (err) {
      console.error("Error submitting answer:", err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin - Answer FAQs</h1>
      <div className="space-y-4">
        {faqs.length === 0 && <p>No unanswered FAQs.</p>}
        {faqs.map((f) => (
          <div key={f._id} className="p-4 bg-white rounded shadow">
            <div className="text-sm text-gray-600">
              Course: {f.courseId} • Asked by {f.askedBy}
            </div>
            <div className="mt-2 font-medium">Q: {f.question}</div>
            <textarea
              value={answerText[f._id] || ""}
              onChange={(e) =>
                setAnswerText({ ...answerText, [f._id]: e.target.value })
              }
              className="w-full p-2 border rounded mt-2"
              placeholder="Write answer..."
            />
            <button
              onClick={() => submitAnswer(f)}
              className="mt-2 px-4 py-2 bg-amber-500 text-white rounded"
            >
              Submit Answer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
