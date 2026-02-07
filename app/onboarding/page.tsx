"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  hasCompletedOnboarding,
  completeOnboarding,
} from "@/lib/onboardingService";
import { supabase } from "@/lib/supabaseClient";
interface University {
  name: string;
  type: string;
  district: string;
  barangay: string;
}

interface FormData {
  school: string;
  program: string;
  displayName: string;
  profilePicture: string;
  avatarType: "custom" | "male" | "female";
  gender: "male" | "female" | null;
  bio: string;
}

type Step = 1 | 2;

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    school: "",
    program: "",
    displayName: "",
    profilePicture: "",
    avatarType: "male",
    gender: "male",
    bio: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewImage, setPreviewImage] = useState<string>("");
  const [universities, setUniversities] = useState<University[]>([]);
  const [universitiesLoading, setUniversitiesLoading] = useState(false);
  const [showUniversityDropdown, setShowUniversityDropdown] = useState(false);
  const [universitySearchInput, setUniversitySearchInput] = useState("");
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  // Generate random dicebear avatar on mount
  useEffect(() => {
    generateRandomAvatar("male");
  }, []);

  // Check if user has already completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (authLoading) {
        return;
      }

      if (!user) {
        // User is not authenticated, redirect to login
        router.push("/");
        return;
      }

      // Check if user has completed onboarding
      try {
        const completed = await hasCompletedOnboarding(user.id);
        setCheckingOnboarding(false);

        if (completed) {
          // User has already completed onboarding, redirect to home
          router.push("/home");
          return;
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        setCheckingOnboarding(false);
      }
    };

    checkOnboardingStatus();
  }, [user, authLoading, router]);

  // Debounce function for university search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (universitySearchInput.trim()) {
        fetchUniversities(universitySearchInput);
      } else {
        setUniversities([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [universitySearchInput]);

  const fetchUniversities = async (query: string) => {
    setUniversitiesLoading(true);
    try {
      const response = await fetch(
        `/api/schools?name=${encodeURIComponent(query)}`,
      );
      const data = await response.json();
      setUniversities(data.slice(0, 10));
    } catch (error) {
      console.error("Error fetching universities:", error);
      setUniversities([]);
    } finally {
      setUniversitiesLoading(false);
    }
  };

  const handleUniversitySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUniversitySearchInput(e.target.value);
    setShowUniversityDropdown(true);
  };

  const selectUniversity = (university: University) => {
    setFormData((prev) => ({
      ...prev,
      school: university.name,
    }));
    setUniversitySearchInput("");
    setShowUniversityDropdown(false);
    setUniversities([]);
  };

  const generateRandomAvatar = (gender: "male" | "female" = "male") => {
    const randomId = Math.random().toString(36).substr(2, 9);
    // Use avataaars style with gender option
    const genderParam = gender === "male" ? "male" : "female";
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomId}&gender=${genderParam}`;
    setFormData((prev) => ({
      ...prev,
      profilePicture: avatarUrl,
      avatarType: gender,
      gender: gender,
    }));
    setPreviewImage(avatarUrl);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          profilePicture: "Please upload an image file",
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          profilePicture: "Image must be less than 5MB",
        }));
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFormData((prev) => ({
          ...prev,
          profilePicture: result,
          avatarType: "custom",
        }));
        setPreviewImage(result);
      };
      reader.readAsDataURL(file);

      // Clear error
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.profilePicture;
        return newErrors;
      });
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.school.trim()) {
      newErrors.school = "School is required";
    }

    if (!formData.program.trim()) {
      newErrors.program = "Program is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = "Display name is required";
    }

    if (!formData.bio.trim()) {
      newErrors.bio = "Bio is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep2()) {
      return;
    }

    if (!user) {
      setSubmitError("User not authenticated");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const submissionData = {
        displayName: formData.displayName,
        bio: formData.bio,
        school: formData.school,
        program: formData.program,
        profilePicture: formData.profilePicture,
        avatarType: formData.avatarType,
        gender: formData.gender,
      };

      const result = await completeOnboarding(user.id, submissionData);

      if (!result.success) {
        setSubmitError(result.error || "Failed to complete onboarding");
        return;
      }

      // Redirect to home page after successful onboarding
      router.push("/home");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      setSubmitError(errorMessage);
      console.error("Error during onboarding submission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleReset = async () => {
    // Sign out the user
    await supabase.auth.signOut();

    // Clear local storage (just in case)
    localStorage.clear();
    sessionStorage.clear();

    // Reload the page
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-white py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Loading State */}
        {(authLoading || checkingOnboarding) && (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-slate-600">Loading onboarding...</p>
            </div>
          </div>
        )}

        {!authLoading && !checkingOnboarding && (
          <>
            {/* Welcome Screen */}
            {showWelcome && (
              <div className="flex flex-col items-center justify-center min-h-screen">
                {/* Decorative Background Elements */}
                <div className="absolute top-10 left-10 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
                <div
                  className="absolute bottom-10 right-10 w-40 h-40 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
                  style={{ animationDelay: "2s" }}
                ></div>

                <div className="relative z-10 text-center space-y-8 max-w-lg">
                  {/* Welcome Icon/Emoji */}
                  <div className="text-7xl animate-bounce">🎉</div>

                  {/* Welcome Message */}
                  <div className="space-y-4">
                    <h1 className="text-5xl font-bold text-purple-900">
                      Welcome to{" "}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                        Camply!
                      </span>
                    </h1>
                    <p className="text-xl text-slate-600 leading-relaxed">
                      We're excited to have you join our community. Let's get
                      you set up so you can start planning amazing outdoor
                      adventures!
                    </p>
                  </div>

                  {/* What's Next Section */}
                  <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl shadow-lg p-8 space-y-4 border border-purple-100">
                    <h2 className="text-lg font-semibold text-slate-800">
                      Here's what's next:
                    </h2>
                    <ul className="space-y-3 text-left">
                      <li className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-semibold text-sm">
                          1
                        </span>
                        <span className="text-slate-700">
                          Tell us about your school and program
                        </span>
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-semibold text-sm">
                          2
                        </span>
                        <span className="text-slate-700">
                          Set up your profile with a photo and bio
                        </span>
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-semibold text-sm">
                          ✓
                        </span>
                        <span className="text-slate-700">
                          Start connecting with adventure buddies!
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => setShowWelcome(false)}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl transition duration-200 ease-in-out transform hover:shadow-xl active:scale-95 text-lg"
                  >
                    Complete My Profile
                  </button>

                  {/* Exit Option */}
                  <button
                    onClick={handleReset}
                    className="text-slate-500 hover:text-slate-700 text-sm font-medium transition duration-200"
                  >
                    Not ready? You can do this later.
                  </button>
                </div>
              </div>
            )}

            {/* Onboarding Steps - Shown after welcome */}
            {/* Onboarding Steps - Shown after welcome */}
            {!showWelcome && (
              <>
                {/* Progress Indicator */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-medium text-purple-600">
                      Step {currentStep} of 2
                    </div>
                    <div className="text-xs text-purple-500">
                      {currentStep === 1 ? "School" : "Profile"}
                    </div>
                  </div>
                  <div className="h-1.5 bg-purple-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300 ease-out"
                      style={{
                        width: currentStep === 1 ? "50%" : "100%",
                      }}
                    ></div>
                  </div>
                </div>

                {/* Error Message */}
                {submitError && (
                  <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 font-medium">
                      {submitError}
                    </p>
                  </div>
                )}

                {/* Step 1: School & Program */}
                <div
                  className={`transition-all duration-500 ease-in-out ${
                    currentStep === 1
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10 hidden"
                  }`}
                >
                  <div className="mb-4">
                    <h1 className="text-3xl font-bold text-purple-900 mb-1">
                      Let's get started
                    </h1>
                    <p className="text-sm text-purple-600">
                      Tell us about your school
                    </p>
                  </div>

                  <form className="bg-white rounded-xl shadow-md p-6 space-y-4">
                    {/* School */}
                    <div className="relative">
                      <label
                        htmlFor="school"
                        className="block text-sm font-semibold text-slate-800 mb-2"
                      >
                        School <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="school"
                        placeholder="Search for your school..."
                        value={universitySearchInput || formData.school}
                        onChange={handleUniversitySearch}
                        onFocus={() => setShowUniversityDropdown(true)}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition text-slate-900 placeholder-slate-600 ${
                          errors.school
                            ? "border-red-500 focus:border-red-500"
                            : "border-slate-200 hover:border-purple-300 focus:border-purple-500"
                        }`}
                      />
                      {universitiesLoading && (
                        <div className="absolute right-4 top-11 transform">
                          <div className="animate-spin h-5 w-5 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                        </div>
                      )}
                      {/* University Dropdown */}
                      {showUniversityDropdown && universities.length > 0 && (
                        <div className="absolute z-10 w-full mt-2 bg-white border-2 border-purple-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                          {universities.map((uni, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => selectUniversity(uni)}
                              className="w-full text-left px-4 py-3 hover:bg-purple-50 transition border-b border-slate-100 last:border-b-0"
                            >
                              <div className="font-medium text-slate-900">
                                {uni.name}
                              </div>
                              <div className="text-sm text-slate-500">
                                {uni.district}, {uni.barangay}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      {errors.school && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.school}
                        </p>
                      )}
                      {formData.school && !universitySearchInput && (
                        <p className="mt-1 text-sm text-green-600 font-medium">
                          ✓ {formData.school}
                        </p>
                      )}
                    </div>

                    {/* Program */}
                    <div>
                      <label
                        htmlFor="program"
                        className="block text-sm font-semibold text-slate-800 mb-2"
                      >
                        Program <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="program"
                        name="program"
                        value={formData.program}
                        onChange={handleInputChange}
                        placeholder="e.g., Computer Science, Business Administration"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition text-slate-900 placeholder-slate-600 ${
                          errors.program
                            ? "border-red-500 focus:border-red-500"
                            : "border-slate-200 hover:border-purple-300 focus:border-purple-500"
                        }`}
                      />
                      {errors.program && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.program}
                        </p>
                      )}
                    </div>

                    {/* Next Button */}
                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition duration-200 ease-in-out transform hover:shadow-lg active:scale-95 mt-8"
                    >
                      Next →
                    </button>
                  </form>
                </div>

                {/* Step 2: Profile Setup */}
                <div
                  className={`transition-all duration-500 ease-in-out ${
                    currentStep === 2
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10 hidden"
                  }`}
                >
                  <div className="mb-10">
                    <h1 className="text-4xl font-bold text-purple-900 mb-3">
                      Create your profile
                    </h1>
                    <p className="text-lg text-purple-600">
                      Add your photo, name, and bio
                    </p>
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-2xl shadow-lg p-8 space-y-8"
                  >
                    {/* Profile Section - Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left: Profile Picture & Gender Selection */}
                      <div className="flex flex-col items-center space-y-6">
                        {/* Profile Picture Circle */}
                        <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-purple-200 shadow-xl">
                          {previewImage && (
                            <img
                              src={previewImage}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        {/* Avatar Generation & Upload */}
                        <div className="w-full space-y-3">
                          <button
                            type="button"
                            onClick={() =>
                              generateRandomAvatar(formData.gender || "male")
                            }
                            className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-all duration-200"
                          >
                            🎲 Generate Avatar
                          </button>

                          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all duration-200">
                            <svg
                              className="w-8 h-8 text-purple-500 mb-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                            <span className="text-sm font-semibold text-purple-700">
                              Upload photo
                            </span>
                            <span className="text-xs text-slate-500">
                              PNG, JPG up to 5MB
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleProfilePictureChange}
                              className="hidden"
                            />
                          </label>
                          {errors.profilePicture && (
                            <p className="text-sm text-red-500 text-center">
                              {errors.profilePicture}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Display Name Input */}
                      {/* Right: Display Name Input */}
                      <div className="flex flex-col justify-center space-y-6">
                        <div>
                          <label
                            htmlFor="displayName"
                            className="block text-sm font-semibold text-slate-800 mb-2"
                          >
                            Display Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="displayName"
                            name="displayName"
                            value={formData.displayName}
                            onChange={handleInputChange}
                            placeholder="Enter your display name"
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition text-slate-900 placeholder-slate-600 ${
                              errors.displayName
                                ? "border-red-500 focus:border-red-500"
                                : "border-slate-200 hover:border-purple-300 focus:border-purple-500"
                            }`}
                          />
                          {errors.displayName && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.displayName}
                            </p>
                          )}
                        </div>

                        {/* Bio - Full Width Below */}
                        <div>
                          <label
                            htmlFor="bio"
                            className="block text-sm font-semibold text-slate-800 mb-2"
                          >
                            Bio <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            placeholder="Tell us about yourself, your interests, and what you're looking for in outdoor adventures..."
                            rows={4}
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition text-slate-900 placeholder-slate-600 resize-none ${
                              errors.bio
                                ? "border-red-500 focus:border-red-500"
                                : "border-slate-200 hover:border-purple-300 focus:border-purple-500"
                            }`}
                          />
                          {errors.bio && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.bio}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4 pt-6">
                      <button
                        type="button"
                        onClick={handleBack}
                        disabled={isSubmitting}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-100 disabled:opacity-50 text-slate-700 font-semibold py-3 rounded-lg transition duration-200 ease-in-out"
                      >
                        ← Back
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-purple-400 disabled:to-purple-500 text-white font-semibold py-3 rounded-lg transition duration-200 ease-in-out transform hover:shadow-lg active:scale-95 disabled:active:scale-100 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            Completing...
                          </>
                        ) : (
                          "Complete Profile"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
