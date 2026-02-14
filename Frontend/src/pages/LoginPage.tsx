/* eslint-disable */
import { useState, useEffect } from "react";
import { useAuthContext } from "../context/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import api from "@/services/api";

export default function AuthPage() {
  const { user, loading } = useAuthContext();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "admin" || user.role === "Master_ADMIN") {
        navigate("/admin/courses", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
      console.log(user);
    }
  }, [user, loading, navigate]);

  const loginMutation = useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const { data } = await api.post("/auth/local/login", payload);

      // backend may return redirect for admin
      if (data?.blueirect) {
        window.location.href = data.blueirect;
        return true;
      }

      // re-check auth state
      window.location.reload();
      return true;
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.error || err?.message || "Login failed";
      setError(message);
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (payload: {
      name: string;
      email: string;
      password: string;
      role: string;
      phoneNumber: number | string;
    }) => {
      await api.post("/auth/local/register", payload);

      window.location.reload();
      return true;
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.error || err?.message || "Signup failed";
      setError(message);
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    await loginMutation.mutateAsync({ email, password });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    await signupMutation.mutateAsync({
      name,
      email,
      password,
      role,
      phoneNumber,
    });
  };

  return (
    <div className="min-h-screen bg-zinc-200">
      <div className="h-screen font-mulish flex items-center justify-center">
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
                className="grid grid-cols-2 w-7xl p-8"
              >
                <div className="mb-8">
                  <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-2">
                    Welcome back <br />
                    User
                  </h1>
                  <p className="text-gray-600">
                    let’s pick up where you left off.
                    <br /> Please enter your credentials to continue.
                  </p>
                </div>
                <div className="w-full col-span-1 max-w-md">
                  {error && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">{error}</p>
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
                        className="w-full px-4 py-2.5 ring ring-gray-300 rounded focus:border-l-4 focus:border-blue-500 outline-none transition"
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
                          className="w-full px-4 py-2.5 ring ring-gray-300 rounded focus:border-l-4 focus:border-blue-500 outline-none transition"
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
                          className="w-4 h-4 border-gray-300 rounded text-green-600 focus:ring-green-500"
                        />
                        <span className="text-gray-600">Remember me</span>
                      </label>
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={loginMutation.isPending}
                      className="w-full bg-zinc-600 hover:bg-zinc-700 text-white font-medium py-2.5 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loginMutation.isPending ? "Signing in..." : "Sign in"}
                    </button>
                  </form>

                  <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <div className="flex-1 border-t border-gray-300"></div>
                  </div>

                  <p className="text-center text-sm text-gray-600 mt-6">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setIsLogin(false)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Sign up
                    </button>
                  </p>
                </div>
              </motion.div>
            </>
          ) : (
            <>
              {/* Right: Signup Form */}
              <motion.div
                key="signupForm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-2 w-7xl p-8"
              >
                <div className="mb-8 max-w-sm">
                  <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-2">
                    Create account
                  </h1>
                  <br />
                  <p className="text-gray-600">
                    We’re excited to have you here. Create your account and
                    start something great today.
                  </p>
                  <br />
                  <p className="text-gray-600">
                    Take the first step toward building something meaningful.
                    Register now to access a platform designed to support your
                    learning, growth, and success. Join a community that values
                    progress, consistency, and excellence.
                  </p>
                </div>
                <div className="w-full max-w-md">
                  {error && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">{error}</p>
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
                        className="w-full px-4 py-2.5 ring ring-gray-300 rounded focus:border-l-4 focus:border-blue-500 outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 ********"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 ring ring-gray-300 rounded focus:border-l-4 focus:border-blue-500 outline-none transition"
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
                        className="w-full px-4 py-2.5 ring ring-gray-300 rounded focus:border-l-4 focus:border-blue-500 outline-none transition"
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
                          className="w-full px-4 py-2.5 ring ring-gray-300 rounded focus:border-l-4 focus:border-blue-500 outline-none transition pr-10"
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
                        className="w-full px-4 py-2.5 ring ring-gray-300 rounded focus:border-l-4 focus:border-blue-500 outline-none transition"
                        required
                      >
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={signupMutation.isPending}
                      className="w-full bg-zinc-600 hover:bg-zinc-700 text-white font-medium py-2.5 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {signupMutation.isPending
                        ? "Creating account..."
                        : "Create account"}
                    </button>
                  </form>

                  <p className="text-center text-sm text-gray-600 mt-6">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setIsLogin(true)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
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
