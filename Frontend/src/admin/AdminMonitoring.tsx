/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const api = import.meta.env.VITE_API_URL || "";

/* ----------------------------- Types ------------------------------ */
interface Student {
  _id: string;
  name: string;
  email?: string;
  purchasedCourses?: any[];
}

interface RequestItem {
  _id: string;
  userId?: { _id?: string; name?: string; email?: string };
  courseIds?: Array<{ id?: string; title?: string } | string>;
  status?: "pending" | "approved" | "rejected" | string;
  createdAt?: string;
}

interface Course {
  id?: string;
  _id?: string;
  courseId?: string;
  title?: string;
  name?: string;
}

/* --------------------------- HTTP Helpers ------------------------- */
async function fetchStudents(): Promise<Student[]> {
  const res = await axios.get(`${api}/api/user/students-with-courses`, {
    withCredentials: true,
  });
  return res.data?.students || [];
}

async function fetchRequests(): Promise<RequestItem[]> {
  const res = await axios.get(`${api}/api/admin/purchase-requests`, {
    withCredentials: true,
  });
  return res.data?.requests || [];
}

async function fetchCourses(ids: string[]): Promise<Record<string, string>> {
  if (ids.length === 0) return {};
  const res = await axios.post(
    `${api}/courses/bulk-ids`,
    { ids },
    { withCredentials: true }
  );
  const courses: Course[] = res.data?.courses || [];
  const map: Record<string, string> = {};
  for (const c of courses) {
    const id = c?.id ?? c?._id ?? c?.courseId;
    if (id) map[id] = c.title ?? c.name ?? "Untitled course";
  }
  return map;
}

async function cleanInvalidPurchasesApi() {
  return axios.post(
    `${api}/api/admin/clean-invalid-purchases`,
    {},
    { withCredentials: true }
  );
}

async function approveRequestApi(id: string) {
  return axios.post(
    `${api}/api/admin/purchase-requests/${id}/approve`,
    {},
    { withCredentials: true }
  );
}

async function rejectRequestApi(id: string) {
  return axios.post(
    `${api}/api/admin/purchase-requests/${id}/reject`,
    {},
    { withCredentials: true }
  );
}

/* --------------------------- Main Component ----------------------- */
export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [active, setActive] = useState<"requests" | "monitoring">("requests");

  const {
    data: students = [],
    isLoading: studentsLoading,
    error: studentsError,
  } = useQuery<Student[]>({
    queryKey: ["students-with-courses"],
    queryFn: fetchStudents,
    staleTime: 1000 * 60 * 2,
  });

  const {
    data: requests = [],
    isLoading: requestsLoading,
    error: requestsError,
  } = useQuery<RequestItem[]>({
    queryKey: ["purchase-requests"],
    queryFn: fetchRequests,
    staleTime: 1000 * 30,
  });

  const allCourseIds = useMemo(() => {
    const ids: string[] = [];

    // From students purchasedCourses
    students.forEach((s) => {
      (s.purchasedCourses || []).flat().forEach((c: any) => {
        if (!c) return;
        const id =
          typeof c === "string" ? c : c.id || c._id || c.CourseId || c.courseId;

        if (id) ids.push(String(id));
      });
    });

    // From purchase requests
    requests.forEach((r) => {
      (r.courseIds || []).forEach((c: any) => {
        const id = typeof c === "string" ? c : c?.id;
        if (id) ids.push(String(id));
      });
    });

    return [...new Set(ids)];
  }, [students, requests]);

  const {
    data: courseMap = {},
    isLoading: coursesLoading,
  } = useQuery({
    queryKey: ["course-titles", allCourseIds],
    queryFn: () => fetchCourses(allCourseIds),
    enabled: allCourseIds.length >= 0, // always run
    staleTime: 1000 * 60 * 5, // 5 min
  });

  const loading = studentsLoading || coursesLoading || requestsLoading;

  /* ------------------------ Mutations ------------------------- */
  const cleanMutation = useMutation({
    mutationFn: cleanInvalidPurchasesApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students-with-courses"] });
      alert("Cleanup finished — invalid purchased courses removed.");
    },
    onError: (err: any) => {
      console.error(err);
      alert("Failed to clean invalid course ids.");
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => approveRequestApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-requests"] });
      queryClient.invalidateQueries({ queryKey: ["students-with-courses"] });
    },
    onError: (e: any) => {
      console.error(e);
      alert("Approve failed");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => rejectRequestApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-requests"] });
    },
    onError: (e: any) => {
      console.error(e);
      alert("Reject failed");
    },
  });

  /* ------------------------ UI Handlers ------------------------ */
  function handleClean() {
    if (
      !confirm(
        "Really remove invalid course references from users? This action updates user records."
      )
    )
      return;
    cleanMutation.mutate();
  }

  function handleApprove(id: string) {
    if (!confirm("Approve this purchase request?")) return;
    approveMutation.mutate(id);
  }

  function handleReject(id: string) {
    if (!confirm("Reject this purchase request?")) return;
    rejectMutation.mutate(id);
  }

  /* ------------------------ Small subcomponents ------------------------ */
  function Sidebar() {
    return (
      <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-6 sticky top-0">
        <h3 className="text-xl font-bold text-gray-800 mb-6">
          Admin Dashboard
        </h3>

        <nav className="space-y-2">
          <button
            onClick={() => setActive("requests")}
            className={`w-full text-left px-4 py-2 rounded-lg font-medium ${
              active === "requests"
                ? "bg-gradient-to-r from-[#C21817] to-[#A51515] text-white shadow"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            🧾 Purchase Requests
          </button>

          <button
            onClick={() => setActive("monitoring")}
            className={`w-full text-left px-4 py-2 rounded-lg font-medium ${
              active === "monitoring"
                ? "bg-gradient-to-r from-[#C21817] to-[#A51515] text-white shadow"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            🎓 Enrollment Monitoring
          </button>
        </nav>

        <div className="mt-6 border-t pt-4">
          <button
            onClick={handleClean}
            disabled={cleanMutation.isPending}
            className="w-full px-4 py-2 rounded-lg bg-red-600 text-white hover:opacity-95 disabled:opacity-50"
          >
            {cleanMutation.isPending
              ? "Cleaning..."
              : "Clean Invalid Course IDs"}
          </button>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>Last refresh:</p>
          <p className="mt-1 text-sm">{new Date().toLocaleString()}</p>
        </div>
      </aside>
    );
  }

  function RequestsPanel() {
    if (requestsError)
      return <div className="p-4 text-red-600">Failed to load requests.</div>;

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Purchase Requests
          </h2>
          <div className="text-sm text-gray-600">
            {requests.length} request(s)
          </div>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden border">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-red-50 text-gray-800 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-3">Student</th>
                <th className="px-6 py-3">Requested Courses</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Requested At</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r._id} className="border-b hover:bg-red-50">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {r.userId?.name ?? "—"}
                    <div className="text-xs text-gray-500">
                      {r.userId?.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <ul className="list-disc ml-4 space-y-1">
                      {Array.isArray(r.courseIds) && r.courseIds.length > 0 ? (
                        r.courseIds.map((c: any, i: number) => {
                          const title =
                            courseMap[typeof c === "string"
                              ? c
                              : c?.title ?? c?.name ?? c?.id];
                          return (
                            <li key={i} className="text-sm text-gray-700">
                              {title}
                            </li>
                          );
                        })
                      ) : (
                        <span className="italic text-gray-500">No courses</span>
                      )}
                    </ul>
                  </td>
                  <td className="px-6 py-4 font-medium">{r.status}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    {r.status === "pending" ? (
                      <>
                        <button
                          onClick={() => handleApprove(r._id)}
                          className="px-3 py-1 bg-green-600 text-white rounded-md text-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(r._id)}
                          className="px-3 py-1 bg-red-600 text-white rounded-md text-sm"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-sm text-gray-600 capitalize">
                        {r.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500">
                    No purchase requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function MonitoringPanel() {
    if (studentsError)
      return <div className="p-4 text-red-600">Failed to load students.</div>;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Student Enrollment Monitoring
          </h2>
          <div className="text-sm text-gray-600">
            {students.length} students
          </div>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden border">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-gradient-to-r from-red-200 to-red-300 text-gray-800 uppercase text-xs font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-3">Student</th>
                <th className="hidden md:table-cell px-6 py-3">Email</th>
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
                    className={`${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-red-50`}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {student.name}
                    </td>
                    <td className="hidden md:table-cell px-6 py-4">
                      {student.email ?? (
                        <span className="text-gray-500 italic">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {flatCourses.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1 text-gray-800">
                          {flatCourses.map((course: any, i: number) => {
                            const id =
                              typeof course === "object"
                                ? course.id ??
                                  course._id ??
                                  course.CourseId ??
                                  course.courseId
                                : course;
                            return (
                              <li
                                key={id ?? `${student._id}-${i}`}
                                className="text-sm text-gray-700"
                              >
                                {courseMap[id] ?? (
                                  <span className="italic text-gray-500">
                                    Unknown ({id ?? "—"})
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
      </div>
    );
  }

  /* --------------------------- Layout --------------------------- */
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {active === "requests"
                    ? "Purchase Requests"
                    : "Enrollment Monitoring"}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Admin controls, approvals and student enrollment overview
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    queryClient.invalidateQueries({
                      queryKey: ["purchase-requests"],
                    });
                    queryClient.invalidateQueries({
                      queryKey: ["students-with-courses"],
                    });
                  }}
                  className="px-4 py-2 border rounded-md bg-white hover:bg-gray-50"
                >
                  Refresh
                </button>
                <div className="text-sm text-gray-600">
                  {loading ? "Loading..." : "Up to date"}
                </div>
              </div>
            </div>
          </div>

          {loading && (
            <div className="mb-6">
              <div className="rounded-lg bg-white p-6 text-center">
                <p className="text-gray-600 animate-pulse">Loading data…</p>
              </div>
            </div>
          )}

          <section>
            {active === "requests" ? <RequestsPanel /> : <MonitoringPanel />}
          </section>
        </div>
      </main>
    </div>
  );
}
