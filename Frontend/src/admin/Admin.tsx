import { Outlet } from "react-router";
import Admin_Header from "./Admin_Header";

const Admin = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#fff6f6] to-white">
      <Admin_Header />
      <main className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_300px_at_50%_-10%,rgba(255,230,230,0.6),transparent)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Admin;