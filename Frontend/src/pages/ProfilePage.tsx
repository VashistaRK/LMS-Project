/* eslint-disable */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "../hooks/useAuth";
import { useAuthContext } from "../context/AuthProvider";
import { DarkGradientBg } from "@/components/ui/elegant-dark-pattern";

const api = import.meta.env.VITE_API_URL;

const fetchProfile = async (): Promise<User> => {
  const { data } = await axios.get(`${api}/api/user/profile`, {
    withCredentials: true,
  });
  return data.user;
};

// ⬇⬇ UPDATED to support multipart and file upload ⬇⬇
const updateProfile = async (
  payload: Partial<User> & { password?: string; pictureFile?: File | null },
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
  const [ChangeReq, setChaneReq] = useState(false);

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
    <DarkGradientBg className="text-[#e5e1e4]">
    <div className="relative z-10 min-h-screen leading-tight tracking-tight py-10 max-w-7xl mx-6 xl:mx-auto xl:px-6">
      <div className="md:flex gap-12 space-y-12 md:justify-between max-h-fit py-12">
        {/* LEFT FORM */}
        <section className="flex-1 lg:max-w-2/3">
          <header className="">
            <h1 className="text-2xl xl:text-3xl font-extrabold text-gray-900 mb-6 font-mulish">
              Edit Profile
            </h1>
            <p className="text-xl font-bold text-gray-500 mb-6 font-mulish">
              Yooo!👋 Wanna Update Things!
              <br />
              It look's cool if you update your profile picture and name!
              <br />
              You can also change your password here!
              <br />
              Just click the "Save Changes" button when you're done!
            </p>
          </header>
          <div className="space-y-6 lg:max-w-3/4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xl font-semibold focus:pl-2 outline-none focus:border-l-2 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <p className="w-full text-gray-500 select-none cursor-not-allowed outline-none">
                {user.email}{" "}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <p className="w-full text-gray-500 select-none cursor-not-allowed outline-none">
                {user?.phoneNumber}{" "}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                You are here as a
              </label>
              <p className="w-full uppercase text-gray-500 select-none cursor-not-allowed outline-none">
                {role}{" "}
              </p>
            </div>

            {/* Password */}
            <div>
              <button
                onClick={() => setChaneReq(!ChangeReq)}
                className="underline mb-4"
              >
                {ChangeReq ? "Leave it!" : "wanna change password?"}
              </button>
              {ChangeReq && (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank to keep current password"
                    className="w-full rounded-md border border-gray-300 p-3 focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </>
              )}
            </div>

            <button
              onClick={handleUpdate}
              disabled={mutation.isPending}
              className="hidden md:inline-flex w-full items-center justify-center gap-2 px-4 py-3 text-white font-semibold rounded-md shadow-md bg-gradient-to-r from-[#17aec2] to-[#153ba5] transition disabled:opacity-60"
            >
              {mutation.isPending ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </section>
        {/* Right SIDEBAR */}
        <aside className="md:w-1/3 flex flex-col items-center justify-start text-center">
          <img
            src={previewImage || "https://via.placeholder.com/120"}
            alt="avatar"
            className="w-full h-2/3 rounded-full object-cover border-4 border-[#eaf5fc] shadow-md mb-4"
          />

          {/* Upload New Profile Photo */}
          <label className="cursor-pointer mt-2 text-sm text-blue-700 hover:underline">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            Change Profile Photo
          </label>

          <button
            onClick={() => {
              logout();
              window.location.href = "/";
            }}
            className="mt-6 px-4 p-2 rounded-lg border-gray-400 hidden md:inline-block text-xl border font-bold hover:underline"
          >
            Log Out
          </button>
          <button
            onClick={handleUpdate}
            disabled={mutation.isPending}
            className="relative md:hidden w-full text-center mt-6 px-4 py-3 text-white font-semibold rounded-md shadow-md bg-gradient-to-r from-[#17aec2] to-[#153ba5] transition disabled:opacity-60"
          >
            {mutation.isPending ? "Updating..." : "Save Changes"}
          </button>
        </aside>
      </div>
    </div>
    </DarkGradientBg>
  );
};

export default ProfilePage;
