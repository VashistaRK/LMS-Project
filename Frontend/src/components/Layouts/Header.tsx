import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Search, Bell, User, ChevronDown } from "lucide-react";
import { useAuthContext } from "../../context/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";

type SearchItem = { type: string; name: string; path: string };

const SEARCH_DATA: SearchItem[] = [
  { type: "course", name: "React Basics", path: "/courses?search=react-basics" },
  { type: "course", name: "Advanced Python", path: "/courses?search=advanced-python" },
  { type: "instructor", name: "John Doe", path: "/instructors/john-doe" },
  { type: "career", name: "Fullstack Developer", path: "/careers?search=fullstack-developer" },
  { type: "course", name: "Data Science 101", path: "/courses?search=data-science-101" },
];

const NAV_LINKS = [
  { href: "/companies", label: "Companies" },
  { href: "/freshers-pratice", label: "Fresher Practice" },
  { href: "/courses", label: "Courses" },
  { href: "/resumes", label: "Resumes" },
  { href: "https://jobs.fresherready.com/", label: "Jobs Portal" },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchItem[]>([]);

  const { user, logout } = useAuthContext();
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowLogoutPopup(true);
    setTimeout(() => {
      setShowLogoutPopup(false);
      window.location.href = "/Authenticate";
    }, 1400);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (!value.trim()) return setSuggestions([]);
    setSuggestions(SEARCH_DATA.filter((s) => s.name.toLowerCase().includes(value.toLowerCase())));
  };

  const handleSearchSubmit = (path?: string) => {
    if (path) navigate(path);
    else if (searchQuery.trim()) navigate(`/courses/?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery("");
    setSuggestions([]);
    setIsSearchOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 w-full z-50 bg-gradient-to-r from-[#0a0a1a]/90 via-[#0d0d20]/90 to-[#0a0a1a]/90 backdrop-blur-xl border-b border-[#c0c1ff]/10 shadow-[0_4px_24px_-8px_rgba(99,102,241,0.15)]">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2">
              <img src="/assets/Sunadh-Logo.png" alt="Logo" className="h-16 w-auto select-none pointer-events-none brightness-0 invert drop-shadow-[0_0_8px_rgba(192,193,255,0.5)]" />
            </a>

            {/* Desktop Nav */}
            <nav className="hidden xl:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 font-jetbrains text-xs uppercase tracking-[0.05em] transition-colors rounded-lg ${
                    location.pathname === link.href
                      ? "text-[#c0c1ff] bg-[#c0c1ff]/10"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => setIsSearchOpen((p) => !p)}
                  className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition"
                >
                  <Search className="w-5 h-5" />
                </button>

                {isSearchOpen && (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                      className="w-56 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-[#c0c1ff]/50 font-dmsans"
                    />
                    {suggestions.length > 0 && (
                      <div className="absolute top-full left-0 w-full bg-[#18181b]/95 backdrop-blur-xl border border-white/10 rounded-lg mt-1 shadow-xl z-50 overflow-hidden">
                        {suggestions.map((item, i) => (
                          <button
                            key={i}
                            className="w-full text-left px-4 py-2 hover:bg-white/5 flex justify-between text-sm text-zinc-200"
                            onClick={() => handleSearchSubmit(item.path)}
                          >
                            <span>{item.name}</span>
                            <span className="text-xs text-zinc-500 capitalize font-jetbrains">{item.type}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Auth */}
              {!user ? (
                <button
                  onClick={() => (window.location.href = "/Authenticate")}
                  className="hidden md:flex relative group items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#6366F1] to-[#4edea3] text-white font-jetbrains text-xs font-semibold rounded-lg uppercase tracking-wider shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_32px_rgba(99,102,241,0.6)] transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10">Sign In</span>
                  <span className="relative z-10">→</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#4edea3] to-[#6366F1] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              ) : (
                <div className="hidden md:block relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen((p) => !p)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition"
                  >
                    <img
                      src={user?.picture}
                      alt={user?.name ?? "user"}
                      className="w-8 h-8 rounded-full ring-2 ring-white/10 object-cover"
                    />
                    <ChevronDown className={`w-4 h-4 text-zinc-400 transition ${isUserMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 mt-2 w-56 bg-[#18181b]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl py-2 z-[200]"
                      >
                        <div className="px-4 py-3 border-b border-white/5">
                          <p className="text-sm font-semibold text-zinc-100">{user?.name}</p>
                          <p className="text-xs text-zinc-500 font-jetbrains">{user?.email}</p>
                        </div>
                        <a href="/profile" className="flex items-center px-4 py-2 text-sm text-zinc-300 hover:bg-white/5">
                          <User className="w-4 h-4 mr-3 text-zinc-500" /> Profile
                        </a>
                        <a href="/notifications" className="flex items-center px-4 py-2 text-sm text-zinc-300 hover:bg-white/5">
                          <Bell className="w-4 h-4 mr-3 text-zinc-500" /> Notifications
                        </a>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                        >
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMobileMenuOpen((p) => !p)}
                className="xl:hidden p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="xl:hidden fixed left-0 right-0 top-20 z-[9999] bg-[#09090B]/95 backdrop-blur-xl border-b border-white/5"
          >
            <div className="px-4 py-3 space-y-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="flex items-center px-3 py-2.5 rounded-lg text-zinc-300 hover:bg-white/5 font-jetbrains text-xs uppercase tracking-[0.05em]"
                >
                  {link.label}
                </a>
              ))}
              <a href="/my-learning" className="flex items-center px-3 py-2.5 rounded-lg text-zinc-300 hover:bg-white/5 font-jetbrains text-xs uppercase tracking-[0.05em]">
                My Learning
              </a>
              {!user ? (
                <a href="/Authenticate" className="block px-3 py-2.5 bg-gradient-to-r from-[#6366F1] to-[#4edea3] text-white rounded-lg text-center font-jetbrains text-xs uppercase font-semibold shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                  Sign In
                </a>
              ) : (
                <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 font-jetbrains text-xs uppercase">
                  Sign Out
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout toast */}
      <AnimatePresence>
        {showLogoutPopup && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 right-6 bg-emerald-500 text-white px-4 py-2 rounded-xl shadow-lg z-50 font-jetbrains text-sm"
          >
            Logged out successfully
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
