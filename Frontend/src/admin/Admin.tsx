import { Outlet } from "react-router";
import Admin_Header from "./Admin_Header";

const Admin = () => {
  return (
    <div className="min-h-screen font-mulish bg-zinc-100">
      <Admin_Header />
      <main className="relative">
        <div className="max-w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Admin;
