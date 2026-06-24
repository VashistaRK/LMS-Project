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
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);

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

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY.current && currentY > 80) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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

  const isLanding = location.pathname === "/";
  const navText = isLanding ? "text-white" : "text-zinc-800";
  const navTextActive = isLanding ? "text-fuchsia-200" : "text-fuchsia-600";
  const navHoverBg = isLanding ? "hover:bg-white/15" : "hover:bg-white/40";
  const navActiveBg = isLanding ? "bg-white/15" : "bg-white/40";
  const logoFilter = isLanding ? "brightness-0 invert drop-shadow" : "";

  return (
    <>
      <header
        className={`fixed top-4 left-4 right-4 md:left-8 md:right-8 z-50 transition-transform duration-300 ${
          isHidden ? "-translate-y-[150%]" : "translate-y-0"
        }`}
      >
        <div
          className="relative max-w-[1400px] mx-auto rounded-full px-6 overflow-hidden border border-white/40"
          style={{
            backgroundColor: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(28px) saturate(200%)",
            WebkitBackdropFilter: "blur(28px) saturate(200%)",
            boxShadow:
              "inset 0 1px 0 0 rgba(255,255,255,0.7), inset 0 0 0 1px rgba(255,255,255,0.05), inset 0 -8px 16px -8px rgba(255,255,255,0.25), 0 12px 40px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.08)",
          }}
        >
          {/* Specular highlight sweep */}
          <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/40 via-white/5 to-transparent opacity-60" />
          {/* Bottom glow */}
          <div className="pointer-events-none absolute inset-x-8 -bottom-px h-px bg-white/40 blur-sm" />
          <div className="relative z-10 flex justify-between items-center h-16">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2">
              <img src="/assets/Sunadh-Logo.png" alt="Logo" className={`h-12 w-auto select-none pointer-events-none ${logoFilter}`} />
            </a>

            {/* Desktop Nav */}
            <nav className="hidden xl:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-base font-bold transition-colors rounded-lg ${
                    location.pathname === link.href
                      ? `${navTextActive} ${navActiveBg}`
                      : `${navText} ${navHoverBg}`
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Mobile search toggle */}
              <button
                onClick={() => setIsSearchOpen((p) => !p)}
                className={`md:hidden p-2 rounded-lg ${navText} ${navHoverBg} transition`}
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Search */}
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => setIsSearchOpen((p) => !p)}
                  className={`p-2 rounded-lg ${navText} ${navHoverBg} transition`}
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
                      className="w-56 px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-fuchsia-400"
                    />
                    {suggestions.length > 0 && (
                      <div className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border border-zinc-200 rounded-lg mt-1 shadow-xl z-50 overflow-hidden">
                        {suggestions.map((item, i) => (
                          <button
                            key={i}
                            className="w-full text-left px-4 py-2 hover:bg-zinc-50 flex justify-between text-sm text-zinc-800"
                            onClick={() => handleSearchSubmit(item.path)}
                          >
                            <span>{item.name}</span>
                            <span className="text-xs text-zinc-400 capitalize">{item.type}</span>
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
                  className="hidden md:inline-flex items-center gap-2 px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-base font-bold rounded-lg shadow-sm transition-colors"
                >
                  <span>Sign In</span>
                  <span>→</span>
                </button>
              ) : (
                <div className="hidden md:block relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen((p) => !p)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-100 transition"
                  >
                    <img
                      src={user?.picture}
                      alt={user?.name ?? "user"}
                      className="w-8 h-8 rounded-full ring-2 ring-zinc-200 object-cover"
                    />
                    <ChevronDown className={`w-4 h-4 text-zinc-500 transition ${isUserMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl border border-zinc-200 rounded-xl shadow-xl py-2 z-[200]"
                      >
                        <div className="px-4 py-3 border-b border-zinc-100">
                          <p className="text-sm font-semibold text-zinc-900">{user?.name}</p>
                          <p className="text-xs text-zinc-500">{user?.email}</p>
                        </div>
                        <a href="/profile" className="flex items-center px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50">
                          <User className="w-4 h-4 mr-3 text-zinc-400" /> Profile
                        </a>
                        <a href="/notifications" className="flex items-center px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50">
                          <Bell className="w-4 h-4 mr-3 text-zinc-400" /> Notifications
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

              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMobileMenuOpen((p) => !p)}
                className={`xl:hidden p-2 rounded-lg ${navText} ${navHoverBg} transition`}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile search panel */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed left-4 right-4 top-24 z-[9999] rounded-2xl bg-white/95 backdrop-blur-xl border border-zinc-200 shadow-lg p-3"
          >
            <input
              autoFocus
              type="text"
              placeholder="Search courses, instructors, careers…"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
              className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-fuchsia-400"
            />
            {suggestions.length > 0 && (
              <div className="mt-2 max-h-64 overflow-auto rounded-lg border border-zinc-200 bg-white">
                {suggestions.map((item) => (
                  <button
                    key={item.path}
                    className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 flex justify-between text-sm text-zinc-800"
                    onClick={() => handleSearchSubmit(item.path)}
                  >
                    <span>{item.name}</span>
                    <span className="text-xs text-zinc-400 capitalize">{item.type}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="xl:hidden fixed left-4 right-4 top-24 z-[9999] rounded-2xl bg-white/95 backdrop-blur-xl border border-zinc-200 shadow-lg"
          >
            <div className="px-4 py-3 space-y-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="flex items-center px-3 py-2.5 rounded-lg text-zinc-700 hover:bg-zinc-100 text-sm font-medium"
                >
                  {link.label}
                </a>
              ))}
              <a href="/my-learning" className="flex items-center px-3 py-2.5 rounded-lg text-zinc-700 hover:bg-zinc-100 text-sm font-medium">
                My Learning
              </a>
              {!user ? (
                <a href="/Authenticate" className="block px-3 py-2.5 bg-zinc-900 text-white rounded-lg text-center text-sm font-medium hover:bg-zinc-800">
                  Sign In
                </a>
              ) : (
                <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 text-sm font-medium">
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
