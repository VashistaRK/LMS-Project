/* eslint-disable */
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const api = import.meta.env.VITE_API_URL;

interface Student {
  _id: string;
  name: string;
  email: string;
  purchasedCourses: any[];
}

// Fetch students with their purchased courses
async function fetchStudents(): Promise<Student[]> {
  const res = await axios.get(`${api}/api/user/students-with-courses`, {
    withCredentials: true,
  });
  return res.data.students || [];
}

// Fetch course titles by IDs
async function fetchCourses(ids: string[]): Promise<Record<string, string>> {
  if (ids.length === 0) return {};
  const res = await axios.post(
    `${api}/courses/bulk-ids`,
    { ids },
    { withCredentials: true }
  );
  const courses = res.data.courses || [];
  const map: Record<string, string> = {};
  courses.forEach((c: any) => {
    map[c.id] = c.title;
  });
  return map;
}

export default function AdminMonitoringPage() {
  const { data: students = [], isLoading: studentsLoading } = useQuery<
    Student[]
  >({
    queryKey: ["students-with-courses"],
    queryFn: fetchStudents,
  });

  // fetch purchase requests
  async function fetchRequests() {
    const res = await axios.get(`${api}/api/admin/purchase-requests`, {
      withCredentials: true,
    });
    return res.data.requests;
  }

  async function approveRequest(id: string) {
    await axios.post(
      `${api}/api/admin/purchase-requests/${id}/approve`,
      {},
      { withCredentials: true }
    );
    refetchRequests();
  }

  async function rejectRequest(id: string) {
    await axios.post(
      `${api}/api/admin/purchase-requests/${id}/reject`,
      {},
      { withCredentials: true }
    );
    refetchRequests();
  }

  const { data: requests = [], refetch: refetchRequests } = useQuery({
    queryKey: ["purchase-requests"],
    queryFn: fetchRequests,
  });

  const courseIds = students.flatMap((s) =>
    (Array.isArray(s.purchasedCourses) ? s.purchasedCourses.flat() : [])
      .map((c: any) => {
        if (typeof c === "string") return c;
        if (c._id) return c._id;
        if (c.CourseId) return c.CourseId;
        return null;
      })
      .filter((id): id is string => !!id)
  );

  const distinctIds = [...new Set(courseIds)];

  const { data: courseMap = {}, isLoading: coursesLoading } = useQuery<
    Record<string, string>
  >({
    queryKey: ["course-titles", distinctIds],
    queryFn: () => fetchCourses(distinctIds),
    enabled: distinctIds.length > 0,
  });

  const loading = studentsLoading || coursesLoading;

  return (
    <div className="p-6 md:p-10">
      <h2 className="text-2xl font-bold mt-10 text-gray-800">
        🧾 Pending Course Requests
      </h2>

      <div className="mt-4 border rounded-xl bg-white shadow">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-red-100 text-gray-800 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-3">Student</th>
              <th className="px-6 py-3">Courses</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r: any) => (
              <tr key={r._id} className="border-b hover:bg-red-50">
                <td className="px-6 py-4">{r.userId?.name}</td>
                <td className="px-6 py-4">
                  <ul className="list-disc ml-3">
                    {r.courseIds?.map((c: any) => (
                      <li key={c._id}>{c.title}</li>
                    ))}
                  </ul>
                </td>
                <td className="px-6 py-4 font-medium">{r.status}</td>
                <td className="px-6 py-4 flex gap-3">
                  {r.status === "pending" && (
                    <>
                      <button
                        onClick={() => approveRequest(r._id)}
                        className="px-3 py-1 bg-green-600 text-white rounded-md"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectRequest(r._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded-md"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        🎓 Student Enrollment Monitoring
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-lg text-gray-600 animate-pulse">Loading data...</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-md bg-white">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-gradient-to-r from-red-200 to-red-300 text-gray-800 uppercase text-xs font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-3">Student Name</th>
                <th className="hidden md:flex px-6 py-3">Email</th>
                <th className="px-6 py-3">Enrolled Courses</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => {
                const flatCourses = Array.isArray(student.purchasedCourses)
                  ? student.purchasedCourses.flat()
                  : [];

                return (
                  <tr
                    key={student._id}
                    className={`transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-red-50`}
                  >
                    <td className="px-6 py-4 font-medium  text-gray-900 whitespace-nowrap">
                      {student.name}
                    </td>
                    <td className="hidden md:block px-6 py-4">
                      {student.email}
                    </td>
                    <td className="px-6 py-4">
                      {flatCourses.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1 text-gray-800">
                          {flatCourses.map((course: any, i: number) => {
                            const id =
                              typeof course === "object"
                                ? course._id ?? course.id ?? course.CourseId
                                : course;

                            return (
                              <li
                                key={id || `${student._id}-${i}`}
                                className="text-sm text-gray-700"
                              >
                                {courseMap[id] ?? (
                                  <span className="italic text-gray-500">
                                    Unknown ({id})
                                  </span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <span className="text-gray-500 italic">
                          No courses enrolled
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
