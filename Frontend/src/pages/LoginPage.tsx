/* eslint-disable */
import { useState, useEffect } from "react";
import { useAuthContext } from "../context/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";

export default function AuthPage() {
  const { user, loading, login } = useAuthContext();
  const API = import.meta.env.VITE_API_URL;
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "admin" || user.role === "Master_ADMIN") {
        navigate("/admin/courses", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  const loginMutation = useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const res = await fetch(`${API}/auth/local/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg.error || "Login failed");
      }
      return true;
    },
    onError: (err: any) => setError(err.message || "Login failed"),
  });

  const signupMutation = useMutation({
    mutationFn: async (payload: {
      name: string;
      email: string;
      password: string;
      role: string;
    }) => {
      const res = await fetch(`${API}/auth/local/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg.error || "Signup failed");
      }
      return true;
    },
    onError: (err: any) => setError(err.message || "Signup failed"),
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    await loginMutation.mutateAsync({ email, password });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    await signupMutation.mutateAsync({ name, email, password, role });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-screen grid md:grid-cols-2">
        <AnimatePresence mode="wait">
          {isLogin ? (
            <>
              {/* Left: Login Form */}
              <motion.div
                key="loginForm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center p-8"
              >
                <div className="w-full max-w-md">
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      Welcome back
                    </h1>
                    <p className="text-gray-600">
                      Please enter your credentials to continue
                    </p>
                  </div>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? "👁️" : "👁️‍🗨️"}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={() => setRememberMe(!rememberMe)}
                          className="w-4 h-4 border-gray-300 rounded text-red-600 focus:ring-red-500"
                        />
                        <span className="text-gray-600">Remember me</span>
                      </label>
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={loginMutation.isPending}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loginMutation.isPending ? "Signing in..." : "Sign in"}
                    </button>
                  </form>

                  <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="text-sm text-gray-500">or</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                  </div>

                  <button
                    onClick={() => login()}
                    className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    <img src="images/Google.jpg" alt="Google" className="h-5 w-5" />
                    <span className="font-medium text-gray-700">Continue with Google</span>
                  </button>

                  <p className="text-center text-sm text-gray-600 mt-6">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setIsLogin(false)}
                      className="text-red-600 hover:text-red-700 font-medium"
                    >
                      Sign up
                    </button>
                  </p>
                </div>
              </motion.div>

              {/* Right: Image */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="hidden md:block relative bg-gradient-to-br from-red-50 to-red-100"
              >
                <div className="absolute inset-0 flex items-center justify-center p-12">
                  <div className="relative">
                    <img
                      src="/images/loginbg.jpg"
                      alt="Login"
                      className="rounded-2xl shadow-2xl object-cover w-full h-[500px]"
                    />
                    <div className="absolute bottom-8 left-8 right-8 bg-white p-6 rounded-xl shadow-lg">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Start your learning journey
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Access thousands of courses and grow your skills
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          ) : (
            <>
              {/* Left: Image for Signup */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="hidden md:block relative bg-gradient-to-br from-red-50 to-red-100"
              >
                <div className="absolute inset-0 flex items-center justify-center p-12">
                  <div className="relative">
                    <img
                      src="/images/loginbg.jpg"
                      alt="Signup"
                      className="rounded-2xl shadow-2xl object-cover w-full h-[500px]"
                    />
                    <div className="absolute bottom-8 left-8 right-8 bg-white p-6 rounded-xl shadow-lg">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Join our community
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Create an account and unlock unlimited learning
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right: Signup Form */}
              <motion.div
                key="signupForm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center p-8"
              >
                <div className="w-full max-w-md">
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      Create account
                    </h1>
                    <p className="text-gray-600">
                      Join us and start learning today
                    </p>
                  </div>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSignup} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full name
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? "👁️" : "👁️‍🗨️"}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        I am a
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                        required
                      >
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={signupMutation.isPending}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {signupMutation.isPending ? "Creating account..." : "Create account"}
                    </button>
                  </form>

                  <p className="text-center text-sm text-gray-600 mt-6">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setIsLogin(true)}
                      className="text-red-600 hover:text-red-700 font-medium"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}