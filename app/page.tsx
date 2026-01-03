"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function Home() {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If user is authenticated, show dashboard/home
  if (!loading && user) {
    return (
      <div className="min-h-screen bg-white">
        <nav className="flex justify-between items-center px-6 py-4 border-b">
          <h1 className="text-3xl font-bold">Camply</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user.email}</span>
            <Link
              href="/auth/logout"
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Logout
            </Link>
          </div>
        </nav>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
          <h2 className="text-4xl font-bold mb-4">
            Welcome back, {user.email}!
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            You're all set to use Camply
          </p>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 h-screen">
        {/* Left Column */}
        <div className="flex flex-col items-center justify-center px-6 py-12 lg:py-0">
          <div className="w-full max-w-md space-y-8">
            {/* Title */}
            <div>
              <h1 className="text-6xl sm:text-6xl md:text-8xl font-bold text-gray-900 tracking-tight">
                Camply
              </h1>
            </div>

            {/* Description */}
            <p className="text-xl sm:text-2xl md:text-xl text-gray-600 leading-relaxed">
              Safe campus marketplace for students. Connect, trade, and grow
              your entrepreneurship confidently.
            </p>

            {/* CTA Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={() => {
                  setIsLogin(false);
                  setIsModalOpen(true);
                }}
                className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
              >
                Get Started
              </button>
              <button
                onClick={() => {
                  setIsLogin(true);
                  setIsModalOpen(true);
                }}
                className="px-6 py-3 border-2 border-gray-900 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Desktop Form */}
        <div
          className="hidden lg:flex lg:flex-col lg:items-center lg:justify-center px-6 py-12 lg:py-0 lg:bg-cover lg:bg-center relative"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80")',
            backgroundPosition: "center",
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black opacity-40"></div>

          {/* Desktop Form */}
          <div className="relative z-10 w-full max-w-md">
            <AuthForm isLogin={isLogin} setIsLogin={setIsLogin} />
          </div>
        </div>
      </div>

      {/* Mobile Form Section */}
      <div className="lg:hidden px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md mx-auto">
          <AuthForm isLogin={isLogin} setIsLogin={setIsLogin} />
        </div>
      </div>
    </div>
  );
}

/**
 * Reusable Auth Form Component
 */
interface AuthFormProps {
  isLogin: boolean;
  setIsLogin: (value: boolean) => void;
}

function AuthForm({ isLogin, setIsLogin }: AuthFormProps) {
  const {
    login,
    signUp,
    error: authError,
    loading,
    signInWithGoogle,
  } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          return;
        }
        await signUp(
          formData.email,
          formData.password,
          formData.email.split("@")[0]
        );
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError(null);
  };

  const displayError = error || authError?.message;

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6 transition-all duration-500 ease-in-out">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center transition-opacity duration-500">
        {isLogin ? "Log In" : "Register"}
      </h2>

      {displayError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm animate-in slide-in-from-top duration-300">
          {displayError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div className="transition-opacity duration-500">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full px-4 py-3 border border-gray-300 
                 text-black placeholder-gray-400 
                 rounded-lg focus:outline-none focus:ring-2 
                 focus:ring-gray-900 focus:border-transparent 
                 transition-all disabled:bg-gray-100"
            placeholder="you@example.com"
          />
        </div>

        {/* Password Field */}
        <div className="transition-opacity duration-500">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full px-4 py-3 border border-gray-300 
                 text-black placeholder-gray-400 
                 rounded-lg focus:outline-none focus:ring-2 
                 focus:ring-gray-900 focus:border-transparent 
                 transition-all disabled:bg-gray-100"
            placeholder="••••••••"
          />
        </div>

        {/* Confirm Password - Only for signup */}
        {!isLogin && (
          <div className="transition-all duration-500 opacity-100 max-h-32 overflow-hidden">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 
                   text-black placeholder-gray-400 
                   rounded-lg focus:outline-none focus:ring-2 
                   focus:ring-gray-900 focus:border-transparent 
                   transition-all disabled:bg-gray-100"
              placeholder="••••••••"
            />
          </div>
        )}

        {/* Forgot Password Link - Only for login */}
        {isLogin && (
          <div className="text-right">
            <Link
              href="/auth/reset-password"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 py-3 bg-gray-900 text-white 
               font-semibold rounded-lg hover:bg-gray-800 
               transition-colors duration-200 text-lg 
               disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {loading
            ? isLogin
              ? "Logging in..."
              : "Creating account..."
            : isLogin
            ? "Log In"
            : "Register Now"}
        </button>
      </form>

      {/* OAuth Buttons */}
      <div className="space-y-3">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={() => signInWithGoogle()}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google
        </button>
      </div>

      {/* Toggle Link */}
      <p className="text-center text-sm text-gray-600">
        {isLogin ? (
          <>
            Don't have an account?{" "}
            <button
              onClick={toggleForm}
              type="button"
              className="text-gray-900 font-semibold hover:underline bg-none border-none cursor-pointer p-0"
            >
              Register
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              onClick={toggleForm}
              type="button"
              className="text-gray-900 font-semibold hover:underline bg-none border-none cursor-pointer p-0"
            >
              Sign in
            </button>
          </>
        )}
      </p>
    </div>
  );
}
