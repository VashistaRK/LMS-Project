/* eslint-disable @typescript-eslint/no-explicit-any */
interface QuizTableProps {
  quizzes: any[];
  onEdit: (quiz: any) => void;
  onDelete: (id: string) => void;
}

export default function QuizTable({ quizzes, onEdit, onDelete }: QuizTableProps) {
  return (
    <div className="overflow-x-auto shadow-md rounded-xl bg-white">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3">Title</th>
            <th className="p-3">Description</th>
            <th className="p-3 text-center">Questions</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {quizzes.length > 0 ? (
            quizzes.map((quiz) => (
              <tr key={quiz._id} className="border-b hover:bg-gray-50 transition">
                <td className="p-3 font-medium">{quiz.title}</td>
                <td className="p-3 text-gray-600">{quiz.description || "-"}</td>
                <td className="p-3 text-center">{quiz.questions?.length || 0}</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => onEdit(quiz)}
                    className="text-blue-600 hover:underline mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(quiz._id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="p-4 text-center text-gray-500" colSpan={4}>
                No quizzes found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
