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

// ⬇⬇ UPDATED to support multipart and file upload ⬇⬇
const updateProfile = async (
  payload: Partial<User> & { password?: string; pictureFile?: File | null }
) => {
  const formData = new FormData();

  if (payload.name) formData.append("name", payload.name);
  if (payload.role) formData.append("role", payload.role);
  if (payload.password) formData.append("password", payload.password);

  // Send picture (file or existing URL)
  if (payload.pictureFile) {
    formData.append("picture", payload.pictureFile);
  } else if (payload.picture) {
    formData.append("picture", payload.picture);
  }

  const { data } = await axios.put(`${api}/api/user/profile`, formData, {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
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
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<User["role"]>();

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser: any) => {
      queryClient.setQueryData(["profile"], updatedUser);
      setPassword("");
      setPictureFile(null);
    },
  });

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPicture(user.picture || "");
      setRole(user.role || "");
      setPreviewImage(user.picture || "");
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center ">
        <p className="text-lg text-gray-700">Loading profile...</p>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPictureFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleUpdate = () => {
    mutation.mutate({
      name,
      picture,
      role,
      password: password || undefined,
      pictureFile,
    });
  };

  return (
    <div className="min-h-screen py-10 px-4 bg-gradient-to-br from-white via-[#fff6f6] to-white">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl md:flex overflow-hidden">

        {/* LEFT SIDEBAR */}
        <aside className="md:w-1/3 bg-white p-8 flex flex-col items-center text-center">
          <img
            src={previewImage || "https://via.placeholder.com/120"}
            alt="avatar"
            className="w-32 h-32 rounded-full object-cover border-4 border-[#FCECEA] shadow-md mb-4"
          />

          {/* Upload New Profile Photo */}
          <label className="cursor-pointer mt-2 text-sm text-red-700 hover:underline">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            Change Profile Photo
          </label>

          <h2 className="text-xl font-bold text-gray-800 mt-3">{user.name}</h2>
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

        {/* RIGHT FORM */}
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

            {/* Profile Picture URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Picture URL (optional)
              </label>
              <input
                type="text"
                value={picture}
                onChange={(e) => {
                  setPicture(e.target.value);
                  setPreviewImage(e.target.value);
                  setPictureFile(null);
                }}
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
