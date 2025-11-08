import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface College {
  id: string;
  name: string;
  apiBase: string;
  logo: string;
  usersCount: number;
  coursesCount: number;
}

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function fetchColleges(): Promise<College[]> {
  const res = await fetch(`${API}/api/colleges`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch colleges");
  return res.json();
}

async function upsertCollege(payload: Partial<College>, editingId?: string) {
  const url = editingId
    ? `${API}/api/colleges/${editingId}/stats`
    : `${API}/api/colleges`;
  const method = editingId ? "PUT" : "POST";
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to save college");
  return res.json();
}

export default function MasterAdminDashboard() {
  const qc = useQueryClient();
  const { data: colleges = [] } = useQuery({
    queryKey: ["colleges"],
    queryFn: fetchColleges,
  });

  const [showForm, setShowForm] = useState(false);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);

  const [formData, setFormData] = useState<Partial<College>>({
    id: "",
    name: "",
    apiBase: "",
    logo: "",
    usersCount: 0,
    coursesCount: 0,
  });

  const saveMutation = useMutation({
    mutationFn: (payload: Partial<College>) =>
      upsertCollege(payload, editingCollege?.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["colleges"] });
      setShowForm(false);
      setEditingCollege(null);
      setFormData({
        id: "",
        name: "",
        apiBase: "",
        logo: "",
        usersCount: 0,
        coursesCount: 0,
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveMutation.mutateAsync(formData);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#C21817]">Master Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage colleges across the network</p>
        </div>
        <button
          className="px-5 py-2.5 bg-gradient-to-r from-[#C21817] to-[#A51515] text-white rounded-2xl shadow-lg shadow-[#C21817]/20 hover:shadow-[#C21817]/30 hover:translate-y-[-1px] active:translate-y-[0px] transition-all"
          onClick={() => {
            setEditingCollege(null);
            setShowForm(true);
          }}
        >
          ➕ Add College
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {colleges.map((college) => (
          <div
            key={college.id}
            className="relative overflow-hidden p-6 bg-white rounded-2xl border border-gray-100 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-gradient-to-br from-[#C21817]/5 to-[#A51515]/5" />
            <div className="flex items-center gap-4 mb-4 relative">
              <img
                src={college.logo}
                alt={college.name}
                className="w-12 h-12 rounded-lg ring-1 ring-gray-100"
              />
              <h2 className="text-lg font-semibold">{college.name}</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-gray-50 px-3 py-2">
                <span className="text-gray-500">Users</span>
                <div className="font-semibold text-gray-800">{college.usersCount}</div>
              </div>
              <div className="rounded-xl bg-gray-50 px-3 py-2">
                <span className="text-gray-500">Courses</span>
                <div className="font-semibold text-gray-800">{college.coursesCount}</div>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                className="px-3 py-1.5 text-sm bg-gradient-to-r from-[#C21817] to-[#A51515] text-white rounded-lg hover:opacity-95 transition"
                onClick={() => {
                  setEditingCollege(college);
                  setFormData(college);
                  setShowForm(true);
                }}
              >
                ✏️ Edit
              </button>
              <button
                className="px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                onClick={() => window.location.assign(`/admin/clg/${college.id}`)}
              >
                📊 View
              </button>
            </div>
          </div>
        ))}
      </div>
  
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl ring-1 ring-black/5 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingCollege ? "✏️ Edit College" : "➕ Add College"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingCollege && (
                <input
                  type="text"
                  placeholder="College ID"
                  value={formData.id}
                  onChange={(e) =>
                    setFormData({ ...formData, id: e.target.value })
                  }
                  className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                  required
                />
              )}
              <input
                type="text"
                placeholder="College Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                required
              />
              <input
                type="text"
                placeholder="API Base"
                value={formData.apiBase}
                onChange={(e) =>
                  setFormData({ ...formData, apiBase: e.target.value })
                }
                className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                required
              />
              <input
                type="text"
                placeholder="Logo URL"
                value={formData.logo}
                onChange={(e) =>
                  setFormData({ ...formData, logo: e.target.value })
                }
                className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Users Count"
                  value={formData.usersCount}
                  onChange={(e) =>
                    setFormData({ ...formData, usersCount: +e.target.value })
                  }
                  className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                />
                <input
                  type="number"
                  placeholder="Courses Count"
                  value={formData.coursesCount}
                  onChange={(e) =>
                    setFormData({ ...formData, coursesCount: +e.target.value })
                  }
                  className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
  
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCollege(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:opacity-95 disabled:opacity-60"
                >
                  {saveMutation.isPending
                    ? "Saving..."
                    : editingCollege
                    ? "Update"
                    : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}