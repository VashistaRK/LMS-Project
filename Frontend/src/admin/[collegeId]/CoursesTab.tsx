/* eslint-disable  */
/* CollegeTabs.tsx
   - Exports: CoursesTab, UsersTab, AnalysisTab
   - Dependencies: react, recharts, tailwindcss for basic classes (optional)
*/

import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/* ---------- Types ---------- */
type Role = "ADMIN" | "INSTRUCTOR" | "STUDENT" | "Master_ADMIN";

export interface User {
  id?: string;
  displayName?: string;
  name?: string;
  email?: string;
  role?: Role | string;
  photo?: string;
  courses?: string[];
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  students?: string[]; // array of user ObjectId strings
  studentCount?: number;
  instructor?: string;
}

/* ---------- Helpers ---------- */
const fetchJson = async (url: string, opts: RequestInit = {}) => {
  const res = await fetch(url, { credentials: "include", ...opts });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    let json;
    try {
      json = JSON.parse(txt);
    } catch (e) {
      console.log(e);
    }
    const msg = json?.message || json?.error || txt || res.statusText;
    const err: any = new Error(msg || "Request failed");
    err.status = res.status;
    throw err;
  }
  // try parse json (some endpoints may respond empty)
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return res.json();
  return res.text();
};

/* ---------- CoursesTab ---------- */
export function CoursesTab({ apiBase }: { apiBase: string; me: User }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [assignCourse, setAssignCourse] = useState<Course | null>(null);

  useEffect(() => {
    load();
  }, [apiBase]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJson(`${apiBase}/courses`);
      setCourses(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(courseId: string) {
    if (!confirm("Delete this course? This action cannot be undone.")) return;
    try {
      await fetchJson(`${apiBase}/courses/${courseId}`, { method: "DELETE" });
      await load();
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Courses</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setCreating(true)}
            className="px-3 py-1 bg-green-600 text-white rounded"
          >
            New Course
          </button>
          <button onClick={() => load()} className="px-3 py-1 border rounded">
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-left">Students</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-6 text-center">
                  Loading…
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-red-600">
                  {error}
                </td>
              </tr>
            ) : courses.length ? (
              courses.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 w-56 truncate">{c.title}</td>
                  <td className="px-4 py-3 max-w-xl truncate">
                    {c.description}
                  </td>
                  <td className="px-4 py-3">
                    {(c.students || []).length || c.studentCount || 0}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => setEditing(c)}
                      className="px-2 py-1 border rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="px-2 py-1 border rounded"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setAssignCourse(c)}
                      className="px-2 py-1 border rounded"
                    >
                      Assign
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-6 text-center">
                  No courses
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {creating && (
        <CreateCourseModal
          apiBase={apiBase}
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            load();
          }}
        />
      )}

      {editing && (
        <EditCourseModal
          apiBase={apiBase}
          course={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}

      {assignCourse && (
        <AssignStudentsModal
          apiBase={apiBase}
          course={assignCourse}
          onClose={() => setAssignCourse(null)}
          onSaved={() => {
            setAssignCourse(null);
            load();
          }}
        />
      )}
    </div>
  );
}

/* ---------- Create/Edit/Assign Modals ---------- */

function CreateCourseModal({
  apiBase,
  onClose,
  onCreated,
}: {
  apiBase: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreate(e?: React.FormEvent) {
    e?.preventDefault();
    if (!title.trim()) return alert("Title required");
    setSaving(true);
    try {
      await fetchJson(`${apiBase}/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      onCreated();
    } catch (err: any) {
      alert("Create failed: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Create Course</h3>
          <button onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Title</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea
              className="w-full border rounded p-2"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-3 py-2 bg-green-600 text-white rounded"
            >
              {saving ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditCourseModal({
  apiBase,
  course,
  onClose,
  onSaved,
}: {
  apiBase: string;
  course: Course;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(course.title || "");
  const [description, setDescription] = useState(course.description || "");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [studentsToAssign, setStudentsToAssign] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave(e?: React.FormEvent) {
    e?.preventDefault();
    setSaving(true);
    try {
      const form = new FormData();
      form.append("title", title);
      form.append("description", description);
      if (thumbnail) form.append("thumbnail", thumbnail);
      // server will parse students if provided as userIds JSON
      if (studentsToAssign.trim()) {
        form.append(
          "userIds",
          JSON.stringify(studentsToAssign.split(/[,\s]+/).filter(Boolean))
        );
      }

      const res = await fetch(`${apiBase}/courses/${course.id}`, {
        method: "PUT",
        credentials: "include",
        body: form,
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Update failed");
      }
      onSaved();
    } catch (err: any) {
      alert("Save failed: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit Course</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm mb-1">Title</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded p-2"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Thumbnail (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">
              Assign / Unassign students (comma-separated user IDs)
            </label>
            <input
              value={studentsToAssign}
              onChange={(e) => setStudentsToAssign(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={async () => {
                  if (!studentsToAssign.trim()) return alert("No ids");
                  const ids = studentsToAssign.split(/[,\s]+/).filter(Boolean);
                  try {
                    await fetchJson(`${apiBase}/courses/${course.id}/assign`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ userIds: ids }),
                    });
                    alert("Assigned");
                  } catch (err: any) {
                    alert("Assign failed: " + err.message);
                  }
                }}
                className="px-3 py-2 bg-green-600 text-white rounded"
              >
                Assign
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (!studentsToAssign.trim()) return alert("No ids");
                  const ids = studentsToAssign.split(/[,\s]+/).filter(Boolean);
                  try {
                    await fetchJson(
                      `${apiBase}/courses/${course.id}/unassign`,
                      {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userIds: ids }),
                      }
                    );
                    alert("Unassigned");
                  } catch (err: any) {
                    alert("Unassign failed: " + err.message);
                  }
                }}
                className="px-3 py-2 border rounded"
              >
                Unassign
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-3 py-2 bg-blue-600 text-white rounded"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AssignStudentsModal({
  apiBase,
  course,
  onClose,
  onSaved,
}: {
  apiBase: string;
  course: Course;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAssign() {
    const ids = text.split(/[,\s]+/).filter(Boolean);
    if (!ids.length) return alert("No user IDs provided");
    setSaving(true);
    try {
      await fetchJson(`${apiBase}/courses/${course.id}/assign`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: ids }),
      });
      onSaved();
    } catch (err: any) {
      alert("Assign failed: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4">
          Assign Students to {course.title}
        </h3>
        <textarea
          className="w-full border rounded p-2"
          rows={4}
          placeholder="comma or space separated user ids"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-3 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={saving}
            className="px-3 py-2 bg-green-600 text-white rounded"
          >
            {saving ? "Assigning…" : "Assign"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- UsersTab ---------- */
export function UsersTab({ apiBase }: { apiBase: string; me: User }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<User | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<
    "ALL" | "ADMIN" | "Master_ADMIN" | "INSTRUCTOR" | "STUDENT"
  >("ALL");

  // Filter users based on selected tab
  const filteredUsers =
    activeTab === "ALL"
      ? users
      : users.filter((u: any) => u.role === activeTab);

  const tabs = ["ALL", "ADMIN", "Master_ADMIN", "INSTRUCTOR", "STUDENT"];

  useEffect(() => {
    fetchUsers();
  }, [apiBase, refreshKey]);

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/auth/users`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Failed to load users (${res.status})`);
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id?: string) {
    if (!id) return;
    if (!confirm("Delete user? This cannot be undone.")) return;
    try {
      await axios.delete(`${apiBase}/auth/users/${id}`, {
        withCredentials: true,
      });
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      alert("Delete failed: " + (err.response?.data?.message || err.message));
    }
  }

  async function saveEdit(patch: any) {
    if (!editing?.id) return;
    try {
      await axios.put(`${apiBase}/auth/users/${editing.id}`, patch, {
        withCredentials: true,
      });
      setEditing(null);
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      alert("Update failed: " + (err.response?.data?.message || err.message));
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Users</h2>
        <div className="text-sm text-gray-600">
          {filteredUsers.length} users
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-3 py-1 rounded ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-6 text-center">
                  Loading…
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-red-600">
                  {error}
                </td>
              </tr>
            ) : filteredUsers.length ? (
              filteredUsers.map((u: any) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{u.displayName}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{u.role}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => setEditing(u)}
                      className="px-2 py-1 border rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="px-2 py-1 border rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-6 text-center">
                  No users in {activeTab}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editing && (
        <EditUserModal
          user={editing}
          onClose={() => setEditing(null)}
          onSave={saveEdit}
        />
      )}
    </div>
  );
}

function EditUserModal({
  user,
  onClose,
  onSave,
}: {
  user: User;
  onClose: () => void;
  onSave: (patch: any) => void;
}) {
  const [role, setRole] = useState(user.role || "STUDENT");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({ role });
    } catch (err) {
      console.log(err);
      // onSave handles errors
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit User</h3>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="mb-4">
          <div className="text-sm">
            {user.displayName} • {user.email}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="STUDENT">STUDENT</option>
            <option value="INSTRUCTOR">INSTRUCTOR</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-2 bg-blue-600 text-white rounded"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- AnalysisTab ---------- */
export function AnalysisTab({ apiBase }: { apiBase: string; me: User }) {
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, [apiBase]);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const data = await fetchJson(`${apiBase}/api/admin/analysis`);
      setStats(data);
    } catch (error: any) {
      if (error.status === 403)
        setErr("Forbidden: you don't have access to analysis.");
      else setErr(error.message || "Failed to fetch analysis");
      setStats(null);
    } finally {
      setLoading(false);
    }
  }

  const COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7f50",
    "#a4de6c",
    "#d0ed57",
  ];

  const rolePieData = useMemo(() => {
    if (!stats?.users?.byRole) return [];
    return Object.entries(stats.users.byRole).map(([role, count]) => ({
      role,
      count,
    }));
  }, [stats]);

  if (loading) return <div className="p-6">Loading analysis…</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!stats) return <div className="p-6">No analysis available</div>;

  return (
    <div className="p-2 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <h3 className="text-sm text-gray-500">Total Users</h3>
          <div className="text-xl font-bold">{stats.users?.total ?? "—"}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h3 className="text-sm text-gray-500">Total Courses</h3>
          <div className="text-xl font-bold">{stats.courses?.total ?? "—"}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h3 className="text-sm text-gray-500">Recent Signups</h3>
          <div className="text-sm">
            {(stats.users?.recentSignups || [])
              .slice(0, 3)
              .map((u: any) => u.displayName || u.email)
              .join(", ") || "—"}
          </div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h3 className="text-sm text-gray-500">Active Courses</h3>
          <div className="text-xl font-bold">
            {(stats.courses?.enrollments || []).length ?? "—"}
          </div>
        </div>
      </div>

      {/* Users by Role (pie) */}
      <div className="bg-white rounded shadow p-4">
        <h3 className="font-semibold mb-3">Users by Role</h3>
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={rolePieData}
                dataKey="count"
                nameKey="role"
                outerRadius={100}
                label
              >
                {rolePieData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Growth */}
      <div className="bg-white rounded shadow p-4">
        <h3 className="font-semibold mb-3">User Growth (daily)</h3>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.users?.growth || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Course Enrollments */}
      <div className="bg-white rounded shadow p-4">
        <h3 className="font-semibold mb-3">Enrollments per Course</h3>
        <div style={{ height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.courses?.enrollments || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="course" interval={0} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Enrollment Trends */}
      <div className="bg-white rounded shadow p-4">
        <h3 className="font-semibold mb-3">Enrollment Trends (daily)</h3>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.courses?.trends || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#ff7f50" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Per-user course counts (bar) */}
      <div className="bg-white rounded shadow p-4">
        <h3 className="font-semibold mb-3">Courses per User (top)</h3>
        <div style={{ height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={(stats.users?.courseActivity || []).slice(0, 20)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="user" interval={0} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="courseCount" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
