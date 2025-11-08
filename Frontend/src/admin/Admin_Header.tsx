import { useState } from "react";
import {
  Home,
  BookOpen,
  Users,
  BarChart3,
  Menu,
  X,
  ChevronDown,
  User,
  ShieldQuestionMark,
  Library,
  Building2,
} from "lucide-react";
import { useAuthContext } from "../context/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import NotificationDropdown from "../components/NotificationDropdown";

const Admin_Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { user, logout } = useAuthContext();

  const navigationItems = [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Courses", href: "/admin/courses", icon: BookOpen },
    { name: "Students", href: "/admin/students", icon: Users },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "FAQ", href: "/admin/FAQ", icon: ShieldQuestionMark },
    { name: "assessments", href: "/admin/assessments", icon: Library },
    { name: "companies", href: "/admin/companies", icon: Building2 },
    { name: "quizMan", href: "/admin/quizMan", icon: Building2 },
  ];

  const handleLogout = () => {
    logout();

    // Wait for animation & popup, then redirect
    setTimeout(() => {
      window.location.href = "/";
    }, 1500);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/60 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)]">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <a className="relative group" href="/">
              <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-purple-500/0 blur opacity-0 group-hover:opacity-100 transition" />
              <img
                src="/images/Sunadh-Logo.png"
                alt="Sunadh Logo"
                className="relative h-10 w-auto transition-transform group-hover:scale-105"
              />
            </a>
  
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="group relative flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-xl transition-all duration-200 hover:bg-white"
                  >
                    <Icon className="w-4 h-4 transition-colors group-hover:text-[#C21817]" />
                    <span>{item.name}</span>
                    <span className="pointer-events-none absolute -inset-x-2 -bottom-1 h-px bg-gradient-to-r from-transparent via-[#C21817]/60 to-transparent opacity-0 group-hover:opacity-100 transition" />
                  </a>
                );
              })}
            </nav>
  
            {/* Right Section */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              {user && <NotificationDropdown />}
  
              {/* Profile Dropdown */}
              {!user ? (
                <button
                  onClick={() => (window.location.href = "/Authenticate")}
                  className="ml-3 px-6 py-2 bg-gradient-to-r from-[#C21817] to-[#A51515] text-white font-semibold rounded-xl shadow-lg shadow-[#C21817]/20 hover:shadow-[#C21817]/30 hover:scale-[1.02] active:scale-[0.99] transition"
                >
                  Sign In
                </button>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileDropdownOpen((p) => !p)}
                    className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-white transition border border-white/60 shadow-sm"
                  >
                    <img
                      src={user?.picture}
                      alt={user.name}
                      className="w-8 h-8 rounded-full ring-2 ring-white"
                    />
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 transition ${isProfileDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>
  
                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl ring-1 ring-black/5 border border-gray-100 py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b bg-gradient-to-r from-[#fff5f5] to-white">
                          <p className="text-sm font-semibold">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <a
                          href="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                        >
                          <User className="w-4 h-4 mr-3" />
                          Profile
                        </a>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
  
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-full transition-all"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
  
          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200/70 bg-white/95 backdrop-blur-xl rounded-b-xl shadow-xl">
              <div className="py-3 space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
  
        {/* Click outside to close dropdowns */}
        {isProfileDropdownOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setIsProfileDropdownOpen(false);
            }}
          />
        )}
      </div>
    </header>
  );
};

export default Admin_Header;
