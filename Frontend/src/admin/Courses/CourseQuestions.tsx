/* eslint-disable */
import { useState } from "react";
import axios from "axios";

type TestCase = {
  input: string;
  expected: string;
};

const baseURL = import.meta.env.VITE_API_URL;

export default function QuestionForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [functionName, setFunctionName] = useState("");
  const [starterCode, setStarterCode] = useState("");
  const [constraints, setConstraints] = useState("");

  const [examples, setExamples] = useState<string[]>([""]);
  const [testCases, setTestCases] = useState<TestCase[]>([
    { input: "", expected: "" },
  ]);

  const [resultId, setResultId] = useState<string | null>(null);

  // Add Example Block
  const addExample = () => {
    setExamples([...examples, ""]);
  };

  // Update Example
  const updateExample = (index: number, value: string) => {
    const updated = [...examples];
    updated[index] = value;
    setExamples(updated);
  };

  // Test Case Functions
  const addTestCase = () => {
    setTestCases([...testCases, { input: "", expected: "" }]);
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

  const safeJsonParse = (value: string, fallback: any) => {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formattedTestCases = testCases.map((tc) => ({
        input: safeJsonParse(tc.input, []),
        output: safeJsonParse(tc.expected, null),
      }));

      const res = await axios.post(`${baseURL}/api/code/questions`, {
        title,
        description,
        functionName,
        starterCode,
        constraints,
        examples,
        testCases: formattedTestCases,
        difficulty: "Easy", // you can add a selector later
        tags: [],
      });

      setResultId(res.data.question._id);
    } catch (err: any) {
      console.error(err);
      alert("Upload failed: " + err.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-lg mt-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        ➕ Add Coding Question
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block font-medium mb-2">Title</label>
          <input
            className="w-full border rounded-lg px-4 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Reverse a string"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium mb-2">Description</label>
          <textarea
            className="w-full border rounded-lg px-4 py-2"
            rows={4}
            value={description}
            placeholder="Write a function to reverse a string."
            onChange={(e) => setDescription(e.target.value)}
            required
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
            rows={6}
            placeholder={`function ${functionName}() {\n  // Write your logic here\n}`}
            value={starterCode}
            onChange={(e) => setStarterCode(e.target.value)}
            required
          />
        </div>

        {/* Constraints */}
        <div>
          <label className="block font-medium mb-2">Constraints</label>
          <textarea
            className="w-full border rounded-lg px-4 py-2 font-mono text-sm"
            rows={4}
            placeholder="1 ≤ str.length ≤ 10⁵"
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
          />
        </div>

        {/* Examples */}
        <div>
          <label className="block font-medium mb-2">Examples</label>
          {examples.map((ex, i) => (
            <textarea
              key={i}
              className="w-full border rounded-lg px-4 py-2 mb-2"
              rows={2}
              placeholder="Input: hello → Output: olleh"
              value={ex}
              onChange={(e) => updateExample(i, e.target.value)}
            />
          ))}
          <button
            type="button"
            onClick={addExample}
            className="mt-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            ➕ Add Example
          </button>
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
                required
              />
              <input
                placeholder='Expected Output (e.g. "olleh")'
                className="flex-1 border rounded-lg px-3 py-2"
                value={tc.expected}
                onChange={(e) => updateTestCase(i, "expected", e.target.value)}
                required
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

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg shadow hover:bg-blue-700 transition"
        >
          Save Question
        </button>
      </form>

      {/* Success Message */}
      {resultId && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          ✅ Saved successfully!<br />
          <span className="text-sm text-gray-700">
            MongoDB ID: <code>{resultId}</code>
          </span>
        </div>
      )}
    </div>
  );
}
