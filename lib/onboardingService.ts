/**
 * Onboarding service
 * Handles user profile creation and onboarding completion tracking
 */

import { supabase } from "./supabaseClient";
import { User } from "@/types/auth";

export interface OnboardingData {
  displayName: string;
  bio: string;
  school: string;
  program: string;
  profilePicture: string;
  avatarType: "custom" | "male" | "female";
  gender: "male" | "female" | null;
}

/**
 * Check if user has completed onboarding
 */
export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("onboarding_completed")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error checking onboarding status:", error);
      return false;
    }

    return data?.onboarding_completed || false;
  } catch (err) {
    console.error("Error checking onboarding status:", err);
    return false;
  }
}

/**
 * Get user profile
 */
export async function getUserProfile(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No profile found - this is expected for new users
        return null;
      }
      console.error("Error fetching user profile:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Error fetching user profile:", err);
    return null;
  }
}

/**
 * Save onboarding data and mark as completed
 */
export async function completeOnboarding(
  userId: string,
  data: OnboardingData
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if profile already exists
    const existingProfile = await getUserProfile(userId);

    const profileData = {
      id: userId,
      display_name: data.displayName,
      bio: data.bio,
      school: data.school,
      program: data.program,
      avatar_url: data.profilePicture,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    };

    if (existingProfile) {
      // Update existing profile
      const { error } = await supabase
        .from("users")
        .update(profileData)
        .eq("id", userId);

      if (error) {
        console.error("Error updating profile:", error);
        return {
          success: false,
          error: error.message || "Failed to update profile",
        };
      }
    } else {
      // Create new profile
      const { error } = await supabase.from("users").insert([
        {
          ...profileData,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("Error creating profile:", error);
        return {
          success: false,
          error: error.message || "Failed to create profile",
        };
      }
    }

    return { success: true };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
    console.error("Error completing onboarding:", err);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Upload profile picture to Supabase Storage
 */
export async function uploadProfilePicture(
  userId: string,
  file: File
): Promise<{ url: string | null; error?: string }> {
  try {
    const fileName = `${userId}/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from("profile-pictures")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading file:", error);
      return {
        url: null,
        error: error.message || "Failed to upload image",
      };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("profile-pictures").getPublicUrl(data.path);

    return { url: publicUrl };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
    console.error("Error uploading profile picture:", err);
    return {
      url: null,
      error: errorMessage,
    };
  }
}
