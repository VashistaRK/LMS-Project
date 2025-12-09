import { useAuthContext } from "@/context/AuthProvider";
import { Home, Users, BarChart3, ShieldQuestionMark, User } from "lucide-react";
import { Link, Outlet } from "react-router-dom";

const sidebarItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: Home },
  { name: "Students", href: "/admin/students", icon: Users },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "FAQ", href: "/admin/FAQ", icon: ShieldQuestionMark },
];

export default function AdminLayout() {
   const { user } = useAuthContext();
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r-8 border-r-zinc-600 p-4 space-y-4">
        <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>

        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-200 transition-all font-medium text-gray-700"
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
          {user && user.role==="Master_ADMIN" && (
            <Link
              to="/admin/super-admin"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-200 transition-all font-medium text-gray-700"
            >
              <User className="w-5 h-5" />
              Super Admin
            </Link>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
