import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Search,
  ShoppingCart,
  Bell,
  User,
  ChevronDown,
  BookOpen,
  GraduationCap,
  Library,
  Building2,
} from "lucide-react";
import { useAuthContext } from "../../context/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../../hooks/queries/cart";
import NotificationDropdown from "../NotificationDropdown";

type SearchItem = { type: string; name: string; path: string };

const SEARCH_DATA: SearchItem[] = [
  { type: "course", name: "React Basics", path: "/courses?search=react-basics" },
  { type: "course", name: "Advanced Python", path: "/courses?search=advanced-python" },
  { type: "instructor", name: "John Doe", path: "/instructors/john-doe" },
  { type: "career", name: "Fullstack Developer", path: "/careers?search=fullstack-developer" },
  { type: "course", name: "Data Science 101", path: "/courses?search=data-science-101" },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchItem[]>([]);
  const [hasScrolledOnce, setHasScrolledOnce] = useState(false);

  const { user, logout } = useAuthContext();
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const { data: cartItems = [] } = useCart();
  const navigate = useNavigate();

  const location = useLocation();
  const isLanding = location.pathname === "/";

  // Listen for first scroll on landing page
  useEffect(() => {
    if (!isLanding) return;
    const onScroll = () => {
      if (!hasScrolledOnce && window.scrollY > 10) setHasScrolledOnce(true);
      if (hasScrolledOnce && window.scrollY < 10) setHasScrolledOnce(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isLanding, hasScrolledOnce]);

  // Close user menu when clicking outside
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
      window.location.href = "/";
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

  const Controls = (
    <div className={`flex items-center space-x-4 ${ isLanding? "text-white":"text-black"}`}>
      <button onClick={() => setIsSearchOpen((p) => !p)} className="p-2 rounded-full hover:bg-white/30 transition">
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
            className="w-56 px-3 py-1.5 bg-white/60 border border-white/40 rounded-xl text-sm focus:outline-none"
          />
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 w-full bg-white/90 backdrop-blur-md border border-white/40 rounded-xl mt-1 shadow-xl z-50">
              {suggestions.map((item, i) => (
                <button key={i} className="w-full text-left px-4 py-2 hover:bg-white/40 flex justify-between" onClick={() => handleSearchSubmit(item.path)}>
                  <span>{item.name}</span>
                  <span className="text-xs text-gray-500 capitalize">{item.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <a href="/cart" className="relative p-2 hover:bg-white/30 rounded-xl transition">
        <ShoppingCart className="w-5 h-5" />
        {cartItems.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-amber-500  text-xs w-5 h-5 rounded-full flex items-center justify-center">{cartItems.length}</span>
        )}
      </a>

      {user && <NotificationDropdown />}

      {!user ? (
        <button onClick={() => (window.location.href = "/Authenticate")} className="px-5 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-semibold rounded-xl shadow hover:scale-105 transition">Sign In</button>
      ) : (
        <div className="relative" ref={userMenuRef}>
          <button onClick={() => setIsUserMenuOpen((p) => !p)} className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-white/30 transition">
            <img src={user?.picture} alt={user?.name ?? "user"} className="w-8 h-8 rounded-full ring-2 ring-white/40 object-cover" />
            <ChevronDown className={`w-4 h-4 transition ${isUserMenuOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {isUserMenuOpen && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-lg border border-white/20 rounded-xl shadow-xl py-2 z-50">
                <div className="px-4 py-3 border-b border-white/20">
                  <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <a href="/profile" className="flex items-center px-4 py-2 text-sm hover:bg-white/40"><User className="w-4 h-4 mr-3" /> Profile</a>
                <a href="/notifications" className="flex items-center px-4 py-2 text-sm hover:bg-white/40"><Bell className="w-4 h-4 mr-3" /> Notifications</a>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50/60">Sign Out</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <button onClick={() => setIsMobileMenuOpen((p) => !p)} className="md:hidden p-2 rounded-xl hover:bg-white/30 transition">
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
    </div>
  );

  return (
    <>
      {/* Landing page: floating header until first scroll, then hide entirely */}
      <AnimatePresence>
        {isLanding && !hasScrolledOnce && (
          <motion.header key="landing-header" className={`fixed w-full z-50 transition-all duration-500 bg-red-700/70 backdrop-blur-xl py-4 border border-white/20`}>
            <div className="min-w-full mx-auto px-6">
              <div className="flex justify-between items-center h-16">
                <a href="/" className="flex items-center space-x-2">
                  <img src="images/Sunadh-Logo.png" alt="Logo" className="h-10 w-auto select-none pointer-events-none" />
                </a>

                <nav className="hidden md:flex items-center space-x-3 font-bold text-white">
                  <a href="/companies" className="flex items-center px-4 py-2 text-lg font-medium hover:bg-white/30 rounded-xl transition"><Building2 className="w-4 h-4 mr-2" /> Companies</a>
                  <a href="/freshers-pratice" className="flex items-center px-4 py-2 text-lg font-medium hover:bg-white/30 rounded-xl transition"><Library className="w-4 h-4 mr-2" /> Freshers Ready</a>
                  <a href="/courses" className="flex items-center px-4 py-2 text-lg font-medium hover:bg-white/30 rounded-xl transition"><GraduationCap className="w-4 h-4 mr-2" /> Courses</a>
                  <a href="/my-learning" className="flex items-center px-4 py-2 text-lg font-medium hover:bg-white/30 rounded-xl transition"><BookOpen className="w-4 h-4 mr-2" /> My Learning</a>
                </nav>

                {Controls}
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Non-landing pages: full width header at top (not fixed/sticky) */}
      {!isLanding && (
        <header className="w-full z-50 bg-white border-b">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-center h-16">
              <a href="/" className="flex items-center space-x-2">
                <img src="images/Sunadh-Logo.png" alt="Logo" className="h-10 w-auto select-none pointer-events-none" />
              </a>

              <nav className="hidden md:flex items-center space-x-3 text-gray-800">
                <a href="/companies" className="flex items-center px-4 py-2 text-sm font-medium hover:bg-white rounded-xl transition"><Building2 className="w-4 h-4 mr-2" /> Companies</a>
                <a href="/freshers-pratice" className="flex items-center px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-xl transition"><Library className="w-4 h-4 mr-2" /> Freshers Ready</a>
                <a href="/courses" className="flex items-center px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-xl transition"><GraduationCap className="w-4 h-4 mr-2" /> Courses</a>
                <a href="/my-learning" className="flex items-center px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-xl transition"><BookOpen className="w-4 h-4 mr-2" /> My Learning</a>
              </nav>

              {Controls}
            </div>
          </div>
        </header>
      )}

      {/* Mobile dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="md:hidden bg-white/90 backdrop-blur-lg border-t border-white/30 rounded-b-2xl">
            <div className="px-4 py-3 space-y-2">
              <a href="/courses" className="block px-3 py-2 rounded-lg hover:bg-white/40">Courses</a>
              <a href="/my-learning" className="block px-3 py-2 rounded-lg hover:bg-white/40">My Learning</a>
              <a href="/cart" className="block px-3 py-2 rounded-lg hover:bg-white/40">Cart ({cartItems.length})</a>
              {!user ? (
                <a href="/Authenticate" className="block px-3 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white rounded-lg text-center">Sign In</a>
              ) : (
                <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-red-50/60">Sign Out</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout toast */}
      <AnimatePresence>
        {showLogoutPopup && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} transition={{ duration: 0.25 }} className="fixed bottom-6 right-6 bg-green-500 text-white px-4 py-2 rounded-xl shadow-lg">✅ Logged out successfully</motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
