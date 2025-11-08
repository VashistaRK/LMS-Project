import React, { useState } from "react";

interface Faq {
  question: string;
  answer: string;
}

interface CourseFaqProps {
  faq: Faq[];
}

const CourseFaq: React.FC<CourseFaqProps> = ({ faq }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="space-y-6 py-6">
      <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
      {faq?.map((item, idx) => (
        <div key={idx} className="border rounded-lg">
          <button
            onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
            className="w-full text-left px-4 py-3 font-medium bg-gray-100 hover:bg-gray-200"
          >
            {item.question}
          </button>
          {openIdx === idx && (
            <div className="px-4 py-3 text-gray-700">{item.answer}</div>
          )}
        </div>
      )) ?? null}
    </div>
  );
};

export default CourseFaq;
