/* eslint-disable */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "../hooks/useAuth";
import { useAuthContext } from "../context/AuthProvider";

const api = import.meta.env.VITE_API_URL;

const fetchProfile = async (): Promise<User> => {
  const { data } = await axios.get(`${api}/api/user/profile`, {
    withCredentials: true,
  });
  return data.user;
};

const updateProfile = async (
  payload: Partial<User> & { password?: string }
) => {
  const { data } = await axios.put(`${api}/api/user/profile`, payload, {
    withCredentials: true,
  });
  return data.user;
};

const ProfilePage: React.FC = () => {
  const queryClient = useQueryClient();
  const { logout } = useAuthContext();
  const { data: user, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
  });

  const [name, setName] = useState("");
  const [picture, setPicture] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<User["role"]>();

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser: any) => {
      queryClient.setQueryData(["profile"], updatedUser);
      setPassword("");
    },
  });

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPicture(user.picture || "");
      setRole(user.role || "");
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center ">
        <p className="text-lg text-gray-700">Loading profile...</p>
      </div>
    );
  }

  const handleUpdate = () => {
    mutation.mutate({ name, picture, role, password: password || undefined });
  };

  return (
    <div className="min-h-screen py-10 px-4 bg-gradient-to-br from-white via-[#fff6f6] to-white">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl md:flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="md:w-1/3 bg-white p-8 flex flex-col items-center text-center">
          <img
            src={picture || "https://via.placeholder.com/120"}
            alt="avatar"
            className="w-32 h-32 rounded-full object-cover border-4 border-[#FCECEA] shadow-md mb-4"
          />
          <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
          <p className="text-gray-600 text-sm mb-1">{user.email}</p>
          <span className="text-xs bg-[#FCECEA] text-[#C21817] px-3 py-1 rounded-full">
            {role ?? "User"}
          </span>

          <button
            onClick={() => {
              logout();
              window.location.href = "/";
            }}
            className="mt-6 inline-block text-sm text-[#C21817] hover:underline"
          >
            Log Out
          </button>
        </aside>

        {/* Right Content */}
        <section className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Edit Profile
          </h1>

          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-3 focus:ring-2 focus:ring-red-400 outline-none"
              />
            </div>

            {/* Picture URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Picture URL
              </label>
              <input
                type="text"
                value={picture}
                onChange={(e) => setPicture(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full rounded-md border border-gray-300 p-3 focus:ring-2 focus:ring-red-400 outline-none"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className="w-full rounded-md border border-gray-300 p-3 focus:ring-2 focus:ring-red-400 outline-none"
              />
            </div>

            <button
              onClick={handleUpdate}
              disabled={mutation.isPending}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-white font-semibold rounded-md shadow-md bg-gradient-to-r from-[#C21817] to-[#A51515] transition disabled:opacity-60"
            >
              {mutation.isPending ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
