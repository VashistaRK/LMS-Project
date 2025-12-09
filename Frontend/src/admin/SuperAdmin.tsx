/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import api from "../services/api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  phone?: string;
  createdAt: string;
}

const Base = import.meta.env.VITE_API_URL || "";

const SuperAdmin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editData, setEditData] = useState<any>({});

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await api.get(`${Base}/api/admin/users`);
      setUsers(res.data.users);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Update user
  const updateUser = async () => {
    if (!selectedUser) return;

    try {
      await api.patch(`${Base}/api/admin/users/${selectedUser._id}`, editData);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  if (loading)
    return <p className="p-6 text-center text-gray-500">Loading users…</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">All Users</h1>

      {/* Users Table */}
      <div className="overflow-x-auto shadow rounded-lg border">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Role</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Phone</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-gray-50">
                <td className="p-3 border">{u.name}</td>
                <td className="p-3 border">{u.email}</td>
                <td className="p-3 border">{u.role}</td>
                <td className="p-3 border">
                  {u.isActive ? (
                    <span className="px-2 py-1 text-sm text-green-700 bg-green-100 rounded">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-sm text-red-700 bg-red-100 rounded">
                      Disabled
                    </span>
                  )}
                </td>
                <td className="p-3 border">{u.phone || "-"}</td>
                <td className="p-3 border">
                  <button
                    onClick={() => {
                      setSelectedUser(u);
                      setEditData({
                        name: u.name,
                        email: u.email,
                        role: u.role,
                        isActive: u.isActive,
                        phone: u.phone || "",
                      });
                    }}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Edit User
            </h2>

            {/* Form */}
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Full Name"
                value={editData.name}
                onChange={(e) =>
                  setEditData({ ...editData, name: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              />

              <input
                type="email"
                placeholder="Email"
                value={editData.email}
                onChange={(e) =>
                  setEditData({ ...editData, email: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              />

              <select
                value={editData.role}
                onChange={(e) =>
                  setEditData({ ...editData, role: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </select>

              <input
                type="text"
                placeholder="Phone"
                value={editData.phone}
                onChange={(e) =>
                  setEditData({ ...editData, phone: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              />

              <label className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  checked={editData.isActive}
                  onChange={(e) =>
                    setEditData({ ...editData, isActive: e.target.checked })
                  }
                />
                <span>Active User</span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>

              <button
                onClick={updateUser}
                className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdmin;
