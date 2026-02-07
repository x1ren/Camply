import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get school parameter from query string
    const { searchParams } = new URL(request.url);
    const school = searchParams.get("school");

    console.log("=== ITEMS API DEBUG ===");
    console.log("Requested school:", school);

    if (!school) {
      return NextResponse.json(
        { error: "School parameter is required" },
        { status: 400 }
      );
    }

    // First, let's see ALL items to debug
    const { data: allItems } = await supabase
      .from("items")
      .select("id, title, school, status")
      .eq("status", "available");

 

    // Normalize the school name for comparison (handle different hyphens and trailing text)
    const normalizedSchool = school
      .replace(/–/g, "-") // Replace en-dash with regular hyphen
      .replace(/—/g, "-") // Replace em-dash with regular hyphen
      .trim();

    // Fetch all available items and filter in memory to handle edge cases
    const { data: allAvailableItems, error: itemsError } = await supabase
      .from("items")
      .select(
        `
        id,
        title,
        description,
        price,
        condition,
        status,
        created_at,
        user_id,
        school,
        categories (
          name
        ),
        item_images (
          image_url
        )
      `
      )
      .eq("status", "available")
      .order("created_at", { ascending: false });

    if (itemsError) {
      console.error("Error fetching items:", itemsError);
      return NextResponse.json(
        { error: "Failed to fetch items" },
        { status: 500 }
      );
    }

    // Filter items by normalized school name
    const items = allAvailableItems?.filter((item) => {
      const itemSchool = item.school
        ?.replace(/–/g, "-")
        .replace(/—/g, "-")
        .replace(/, undefined$/, "") // Remove trailing ", undefined"
        .trim();
      return itemSchool === normalizedSchool;
    }) || [];

  

    return NextResponse.json({
      success: true,
      data: items || [],
    });
  } catch (error) {
    console.error("Error in items API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
