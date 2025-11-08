/* eslint-disable */
import { useEffect, useState, type SetStateAction } from "react";
import api from "../services/api"; // axios configured
import { useCourseRealtime } from "../hooks/useCourseRealtime";
import { socket } from "../lib/socket"; // import socket instance
import type { User } from "../hooks/useAuth";

export default function FaqList({
  courseId,
  currentUser,
}: {
  courseId: string;
  currentUser?: User;
}) {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [qText, setQText] = useState("");

  useEffect(() => {
    api
      .get(`/api/faqs/course/${courseId}`)
      .then((r: { data: SetStateAction<any[]> }) => setFaqs(r.data));
  }, [courseId]);

  useCourseRealtime(courseId, {
    onFaqCreated: (faq) => setFaqs((prev) => [faq, ...prev]),
    onFaqAnswered: (faq) =>
      setFaqs((prev) => prev.map((f) => (f._id === faq._id ? faq : f))),
  });

  const ask = async () => {
    if (!qText.trim()) return;
    // optimistic UI
    const temp = {
      _id: `temp-${Date.now()}`,
      question: qText,
      askedBy: currentUser?.name,
      askedAt: new Date(),
    };
    setFaqs((p) => [temp, ...p]);
    setQText("");
    // emit via socket or POST via REST
    socket.emit("client:newFaq", {
      courseId,
      question: qText,
      askedBy: currentUser?.name,
    });
    console.log(qText, "\n", currentUser?.name);
    await api.post(`/api/faqs/${courseId}`, {
      question: qText,
      askedBy: currentUser?.name,
    });
  };

  return (
    <div>
      <h3 className="text-lg font-semibold">FAQs</h3>
      <div className="mt-3">
        <textarea
          value={qText}
          onChange={(e) => setQText(e.target.value)}
          className="w-full rounded p-2"
          placeholder="Ask a question..."
        />
        <button
          onClick={ask}
          className="mt-2 px-4 py-2 bg-amber-500 text-white rounded"
        >
          Ask
        </button>
      </div>
      <div className="mt-4 space-y-4">
        {faqs.map((f) => (
          <div key={f._id} className="p-3 bg-white rounded shadow">
            <div className="text-sm text-gray-600">Q: {f.question}</div>
            {f.answer ? (
              <div className="text-sm text-gray-800 mt-2">A: {f.answer}</div>
            ) : (
              <div className="text-sm text-gray-400 mt-2">Unanswered</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
