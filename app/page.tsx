'use client'

import { useState } from 'react'

export default function Home() {
  const [isLogin, setIsLogin] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Handle registration/login logic here
    if (isLogin) {
      console.log('Login submitted:', { email: formData.email, password: formData.password })
    } else {
      console.log('Registration submitted:', formData)
    }
  }

  const toggleForm = () => {
    setIsLogin(!isLogin)
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
              Safe campus marketplace for students. Connect, trade, and grow your entrepreneurship confidently.
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="hidden lg:flex lg:flex-col lg:items-center lg:justify-center px-6 py-12 lg:py-0 lg:bg-cover lg:bg-center relative"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80")',
            backgroundPosition: 'center',
          }}>
          {/* Overlay for better form visibility */}
          <div className="absolute inset-0 bg-black opacity-40"></div>

          {/* Registration/Login Form */}
          <div className="relative z-10 w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6 transition-all duration-500 ease-in-out">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center transition-opacity duration-500">
                {isLogin ? 'Log In' : 'Register'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="transition-opacity duration-500">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder="you@example.com"
                  />
                </div>

                {/* Password Field */}
                <div className="transition-opacity duration-500">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                </div>

                {/* Confirm Password Field - Only show for register */}
                {!isLogin && (
                  <div className="transition-all duration-500 opacity-100 max-h-32 overflow-hidden">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                )}

                {isLogin && (
                  <div className="transition-all duration-500 opacity-0 max-h-0 overflow-hidden" />
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full mt-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors duration-200 text-lg"
                >
                  {isLogin ? 'Log In' : 'Register Now'}
                </button>
              </form>

              {/* Toggle Link */}
              <p className="text-center text-sm text-gray-600">
                {isLogin ? (
                  <>
                    Don't have an account?{' '}
                    <button
                      onClick={toggleForm}
                      className="text-gray-900 font-semibold hover:underline bg-none border-none cursor-pointer p-0"
                    >
                      Register
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      onClick={toggleForm}
                      className="text-gray-900 font-semibold hover:underline bg-none border-none cursor-pointer p-0"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Registration/Login Section */}
      <div className="lg:hidden px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6 transition-all duration-500 ease-in-out">
            <h2 className="text-2xl font-bold text-gray-900 text-center transition-opacity duration-500">
              {isLogin ? 'Log In' : 'Register'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="transition-opacity duration-500">
                <label htmlFor="email-mobile" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email-mobile"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
              </div>

              {/* Password Field */}
              <div className="transition-opacity duration-500">
                <label htmlFor="password-mobile" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password-mobile"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>

              {/* Confirm Password Field - Only show for register */}
              {!isLogin && (
                <div className="transition-all duration-500 opacity-100 max-h-32 overflow-hidden">
                  <label htmlFor="confirmPassword-mobile" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword-mobile"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                </div>
              )}

              {isLogin && (
                <div className="transition-all duration-500 opacity-0 max-h-0 overflow-hidden" />
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full mt-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors duration-200 text-lg"
              >
                {isLogin ? 'Log In' : 'Register Now'}
              </button>
            </form>

            {/* Toggle Link */}
            <p className="text-center text-sm text-gray-600">
              {isLogin ? (
                <>
                  Don't have an account?{' '}
                  <button
                    onClick={toggleForm}
                    className="text-gray-900 font-semibold hover:underline bg-none border-none cursor-pointer p-0"
                  >
                    Register
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={toggleForm}
                    className="text-gray-900 font-semibold hover:underline bg-none border-none cursor-pointer p-0"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
