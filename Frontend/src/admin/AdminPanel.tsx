import { useAuthContext } from "@/context/AuthProvider";

const AdminPanel = () => {
  const { user } = useAuthContext();
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <h1 className="text-3xl lg:text-5xl font-bold text-gray-800">
        Welcome to the Admin Dashboard
      </h1>
      <h2 className="text-3xl mt-10">Hi {user?.name}! Nice to see you here</h2>
    </div>
  );
};

export default AdminPanel;
