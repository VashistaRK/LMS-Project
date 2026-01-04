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
    return <p className="p-4 md:p-6 text-center text-gray-500 text-sm md:text-base">Loading users…</p>;

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">All Users</h1>

      {/* Users Table */}
      <div className="overflow-x-auto shadow rounded-lg border">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-2 md:p-3 border text-xs md:text-sm">Name</th>
              <th className="p-2 md:p-3 border text-xs md:text-sm hidden sm:table-cell">Email</th>
              <th className="p-2 md:p-3 border text-xs md:text-sm">Role</th>
              <th className="p-2 md:p-3 border text-xs md:text-sm">Status</th>
              <th className="p-2 md:p-3 border text-xs md:text-sm hidden md:table-cell">Phone</th>
              <th className="p-2 md:p-3 border text-xs md:text-sm">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-gray-50">
                <td className="p-2 md:p-3 border">
                  <div className="font-medium text-sm md:text-base">{u.name}</div>
                  <div className="text-xs text-gray-500 sm:hidden mt-1">{u.email}</div>
                </td>
                <td className="p-2 md:p-3 border text-xs md:text-sm hidden sm:table-cell">{u.email}</td>
                <td className="p-2 md:p-3 border text-xs md:text-sm">{u.role}</td>
                <td className="p-2 md:p-3 border">
                  {u.isActive ? (
                    <span className="px-2 py-1 text-xs md:text-sm text-green-700 bg-green-100 rounded whitespace-nowrap">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs md:text-sm text-red-700 bg-red-100 rounded whitespace-nowrap">
                      Disabled
                    </span>
                  )}
                </td>
                <td className="p-2 md:p-3 border text-xs md:text-sm hidden md:table-cell">{u.phone || "-"}</td>
                <td className="p-2 md:p-3 border">
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
                    className="px-2 md:px-3 py-1 text-xs md:text-sm bg-blue-600 text-white rounded hover:bg-blue-700 whitespace-nowrap"
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
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-lg shadow p-4 md:p-6 space-y-3 md:space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">
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
                className="w-full border px-3 py-2 rounded text-sm md:text-base"
              />

              <input
                type="email"
                placeholder="Email"
                value={editData.email}
                onChange={(e) =>
                  setEditData({ ...editData, email: e.target.value })
                }
                className="w-full border px-3 py-2 rounded text-sm md:text-base"
              />

              <select
                value={editData.role}
                onChange={(e) =>
                  setEditData({ ...editData, role: e.target.value })
                }
                className="w-full border px-3 py-2 rounded text-sm md:text-base"
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
                className="w-full border px-3 py-2 rounded text-sm md:text-base"
              />

              <label className="flex items-center gap-2 mt-1 text-sm md:text-base">
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
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4 md:mt-6">
              <button
                onClick={() => setSelectedUser(null)}
                className="w-full sm:w-auto px-3 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm md:text-base"
              >
                Cancel
              </button>

              <button
                onClick={updateUser}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm md:text-base"
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
