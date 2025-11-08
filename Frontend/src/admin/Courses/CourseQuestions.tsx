/* eslint-disable */
import { useState } from "react";
import axios from "axios";

type TestCase = {
  input: string;
  expected: string;
};
const baseURL= import.meta.env.VITE_API_URL;

export default function QuestionForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [functionName, setFunctionName] = useState("");
  const [starterCode, setStarterCode] = useState("");
  const [constraints, setConstraints] = useState("");
  const [examples, setExamples] = useState<any[]>([]);
  void setExamples;
  const [testCases, setTestCases] = useState<TestCase[]>([
    { input: "", expected: "" },
  ]);
  const [runCases, setRunCases] = useState<TestCase[]>([
    { input: "", expected: "" },
  ]);
  const [resultId, setResultId] = useState<string | null>(null);

  const addTestCase = () => {
    setTestCases([...testCases, { input: "", expected: "" }]);
  };
  const addRunCases = () => {
    setRunCases([...runCases, { input: "", expected: "" }]);
  };

  const updateTestCase = (
    index: number,
    field: keyof TestCase,
    value: string
  ) => {
    const updated = [...testCases];
    updated[index][field] = value;
    setTestCases(updated);
  };
  const updateRunCase = (
    index: number,
    field: keyof TestCase,
    value: string
  ) => {
    const updated = [...runCases];
    updated[index][field] = value;
    setRunCases(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${baseURL}/api/code/questions`, {
        title,
        description,
        functionName,
        starterCode,
        testCases: testCases.map((tc) => ({
          input: JSON.parse(tc.input || "[]"), // parse JSON array string
          expected: JSON.parse(tc.expected || "null"),
        })),
        examples,
        constraints,
        runCases: runCases.map((rc) => ({
          input: JSON.parse(rc.input || "[]"), // parse JSON array string
          expected: JSON.parse(rc.expected || "null"),
        })),
      });

      setResultId(res.data.question._id);
    } catch (err: any) {
      console.error(err);
      alert("Failed: " + err.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-lg mt-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        ➕ Add Quiz Question
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block font-medium mb-2">Title</label>
          <input
            className="w-full border rounded-lg px-4 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Reverse a String"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium mb-2">Description</label>
          <textarea
            className="w-full border rounded-lg px-4 py-2"
            value={description}
            placeholder="Given a string, return it reversed"
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Function Name */}
        <div>
          <label className="block font-medium mb-2">Function Name</label>
          <input
            className="w-full border rounded-lg px-4 py-2"
            value={functionName}
            placeholder="reverseString"
            onChange={(e) => setFunctionName(e.target.value)}
            required
          />
        </div>

        {/* Starter Code */}
        <div>
          <label className="block font-medium mb-2">Starter Code</label>
          <textarea
            className="w-full border rounded-lg px-4 py-2 font-mono text-sm"
            rows={5}
            placeholder={`function ${functionName}() {\n  // your code\n}`}
            value={starterCode}
            onChange={(e) => setStarterCode(e.target.value)}
          />
        </div>
        {/* Constraints Code */}
        <div>
          <label className="block font-medium mb-2">Constraints</label>
          <textarea
            className="w-full border rounded-lg px-4 py-2 font-mono text-sm"
            rows={5}
            placeholder={`1 <= str.length <= 10^5`}
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
          />
        </div>

        {/* Test Cases */}
        <div>
          <label className="block font-medium mb-2">Test Cases</label>
          {testCases.map((tc, i) => (
            <div key={i} className="flex gap-4 mb-2">
              <input
                placeholder='Input (e.g. ["hello"])'
                className="flex-1 border rounded-lg px-3 py-2"
                value={tc.input}
                onChange={(e) => updateTestCase(i, "input", e.target.value)}
              />
              <input
                placeholder='Expected (e.g. "olleh")'
                className="flex-1 border rounded-lg px-3 py-2"
                value={tc.expected}
                onChange={(e) => updateTestCase(i, "expected", e.target.value)}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addTestCase}
            className="mt-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            ➕ Add Test Case
          </button>
        </div>
        <div>
          <label className="block font-medium mb-2">Run Cases</label>
          {runCases.map((rc, i) => (
            <div key={i} className="flex gap-4 mb-2">
              <input
                placeholder='Input (e.g. ["hello"])'
                className="flex-1 border rounded-lg px-3 py-2"
                value={rc.input}
                onChange={(e) => updateRunCase(i, "input", e.target.value)}
              />
              <input
                placeholder='Expected (e.g. "olleh")'
                className="flex-1 border rounded-lg px-3 py-2"
                value={rc.expected}
                onChange={(e) => updateRunCase(i, "expected", e.target.value)}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addRunCases}
            className="mt-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            ➕ Add Test Case
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg shadow hover:bg-blue-700 transition"
        >
          Save Question
        </button>
      </form>

      {/* Show result */}
      {resultId && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          ✅ Saved successfully!
          <div className="text-sm text-gray-700">
            MongoDB ID: <code>{resultId}</code>
          </div>
        </div>
      )}
    </div>
  );
}
