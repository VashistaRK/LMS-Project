import { useAuthContext } from "@/context/AuthProvider";
import { Users, BarChart3, ShieldQuestionMark, User } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";

const sidebarItems = [
  // { name: "Dashboard", href: "/admin/dashboard", icon: Home },
  { name: "Students", href: "/admin/students", icon: Users },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "FAQ", href: "/admin/FAQ", icon: ShieldQuestionMark },
  { name: "Resumes", href: "/admin/resumes", icon: ShieldQuestionMark },
];

export default function AdminLayout() {
  const { user } = useAuthContext();
  const location = useLocation();

  return (
    <div className="flex font-mulish">
      {/* Sidebar */}
      <aside
        className="
          lg:static
          inset-y-0 left-0
          z-40
          flex flex-col
          border-r-4
          transition-all
          duration-300
          w-16 lg:w-56
          p-2 lg:p-8
        "
      >
        {/* Logo / Title */}
        <div className="mb-6 flex items-center justify-center lg:justify-start">
          <span className="hidden lg:block text-2xl font-bold">
            Admin Panel
          </span>
          <span className="lg:hidden text-xl font-bold border-b-2">AP</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 space-y-4">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={`
                  group flex items-center
                  justify-center lg:justify-start
                  gap-3
                  transition-all
                  font-medium
                  ${
                    isActive
                      ? "border-l-4 pl-2 border-blue-300 text-gray-900"
                      : "text-gray-600 hover:bg-gray-200"
                  }
                `}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className="hidden lg:inline">{item.name}</span>
              </Link>
            );
          })}

          {user?.role === "Master_ADMIN" && (
            <Link
              to="/admin/super-admin"
              className={`
                group flex items-center
                justify-center lg:justify-start
                gap-3
                transition-all
                font-medium
                ${
                  location.pathname === "/admin/super-admin"
                    ? "border-l-4 pl-2 border-blue-300 text-gray-900"
                    : "text-gray-600 hover:bg-gray-200"
                }
              `}
            >
              <User className="w-5 h-5 shrink-0" />
              <span className="hidden lg:inline">Super Admin</span>
            </Link>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl lg:p-4">
        <Outlet />
      </main>
    </div>
  );
}
