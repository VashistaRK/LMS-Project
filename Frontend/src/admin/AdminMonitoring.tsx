import React, { useEffect, useState } from "react";
import axios from "axios";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  picture?: string;
  accessGranted: boolean;
}

const StudentsAdminPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/api/admin/users");
      setUsers(res.data.users);
    } catch (err) {
      toast.error("Failed to fetch users");
      console.log("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const approveAccess = async (id: string) => {
    try {
      await api.post(`/api/admin/users/${id}/approve`);
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, accessGranted: true } : u)),
      );
      toast.success("Access granted");
    } catch {
      toast.error("Failed to approve access");
    }
  };

  const revokeAccess = async (id: string) => {
    try {
      await api.post(`/api/admin/users/${id}/revoke`);
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, accessGranted: false } : u)),
      );
      toast.success("Access revoked");
    } catch {
      toast.error("Failed to revoke access");
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading users...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Students Management</h1>

      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <div
            key={user._id}
            className="bg-white rounded-md shadow-sm border p-4 flex gap-4 items-center"
          >
            {/* Avatar */}
            <img
              src={user.picture || "/avatar.png"}
              alt={user.name}
              className="w-14 h-14 hidden md:flex rounded-full object-cover border"
            />

            {/* Info */}
            <div className="flex-1">
              <p className="font-medium">{user.name || "Unnamed User"}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
              <p className="text-xs mt-1">
                Status:{" "}
                <span
                  className={`font-medium ${
                    user.accessGranted ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {user.accessGranted ? "Access Granted" : "Locked"}
                </span>
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              {!user.accessGranted ? (
                <button
                  onClick={() => approveAccess(user._id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1
                             rounded text-xs flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  Approve
                </button>
              ) : (
                <button
                  onClick={() => revokeAccess(user._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1
                             rounded text-xs flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Revoke
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentsAdminPage;
