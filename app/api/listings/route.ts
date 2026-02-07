import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);

    // Create Supabase client with user's token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Verify the user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's school from the users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("school")
      .eq("id", user.id)
      .single();

    if (userError || !userData?.school) {
      console.error("Error fetching user school:", userError);
      return NextResponse.json(
        { error: "User school not found. Please complete your profile." },
        { status: 400 }
      );
    }

    // Parse form data
    const formData = await request.formData();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price") as string;
    const category = formData.get("category") as string;
    const condition = formData.get("condition") as string;
    const status = formData.get("status") as string;
    const images = formData.getAll("images") as File[];

    // Map condition to database format
    const conditionMap: Record<string, string> = {
      "Brand New": "new",
      "Like New": "like_new",
      Good: "good",
      Fair: "fair",
    };

    const dbCondition = conditionMap[condition] || condition;

    // Map status to database format
    const statusMap: Record<string, string> = {
      Available: "available",
      Reserved: "reserved",
      Sold: "sold",
    };

    const dbStatus = statusMap[status] || status;

    // Validate required fields
    if (
      !title ||
      !description ||
      !price ||
      !category ||
      !condition ||
      !status
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (images.length === 0) {
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 },
      );
    }

    // Upload images to Supabase Storage
    const imageUrls: string[] = [];
    for (const image of images) {
      const fileExt = image.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Convert File to ArrayBuffer
      const arrayBuffer = await image.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from("listings")
        .upload(fileName, buffer, {
          contentType: image.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        throw new Error(
          `Failed to upload image: ${uploadError.message || "Unknown error"}`,
        );
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("listings").getPublicUrl(fileName);

      imageUrls.push(publicUrl);
    }

    // Map category names to match database
    const categoryNameMap: Record<string, string> = {
      essentials: "School Essentials",
      clothing: "Thrift & Clothing",
      gadgets: "Gadgets",
      food: "Food & Snacks",
      dorm: "Dorm/Boarding",
      services: "Services",
    };

    const dbCategoryName = categoryNameMap[category] || category;

    console.log("=== CATEGORY DEBUG ===");
    console.log("Form category value:", category);
    console.log("Mapped category name:", dbCategoryName);

    // Get the category ID from the categories table
    const { data: categoryData, error: categoryLookupError } = await supabase
      .from("categories")
      .select("id, name")
      .eq("name", dbCategoryName)
      .single();

    console.log("Category lookup result:", categoryData);
    console.log("Category lookup error:", categoryLookupError);

    if (categoryLookupError || !categoryData) {
      // Let's also try to see what categories exist
      const { data: allCategories } = await supabase
        .from("categories")
        .select("id, name");
      console.error("Available categories in DB:", allCategories);
      console.error("Error finding category:", categoryLookupError);
      throw new Error(`Category not found: ${dbCategoryName}. Available categories: ${allCategories?.map(c => c.name).join(", ")}`);
    }

    // Insert item into items table with school
    const { data: itemData, error: itemError } = await supabase
      .from("items")
      .insert({
        title,
        description,
        price: parseFloat(price),
        condition: dbCondition,
        status: dbStatus,
        user_id: user.id,
        category_id: categoryData.id,
        school: userData.school,
      })
      .select()
      .single();

    if (itemError) {
      console.error("Error creating item:", itemError);
      throw new Error(
        `Failed to create item: ${itemError.message || JSON.stringify(itemError)}`,
      );
    }

    // Insert images into item_images table
    const imageInserts = imageUrls.map((url) => ({
      item_id: itemData.id,
      image_url: url,
    }));

    const { error: imageError } = await supabase
      .from("item_images")
      .insert(imageInserts);

    if (imageError) {
      console.error("Error creating images:", imageError);
      // Rollback: delete the item
      await supabase.from("items").delete().eq("id", itemData.id);
      throw new Error("Failed to save images");
    }

    return NextResponse.json({
      success: true,
      message: "Listing created successfully",
      data: {
        id: itemData.id,
        title,
        description,
        price: parseFloat(price),
        category,
        condition,
        status,
        userId: user.id,
        images: imageUrls,
      },
    });
  } catch (error) {
    console.error("Error creating listing:", error);

    if (
      error instanceof Error &&
      error.message === "Unauthorized: No valid session"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return more specific error message
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Create a basic Supabase client for public reads
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Fetch listings with their categories and images
    const { data: items, error: itemsError } = await supabase
      .from("items")
      .select(
        `
        *,
        categories (
          category_name
        ),
        item_images (
          image_url
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (itemsError) {
      console.error("Error fetching listings:", itemsError);
      throw new Error("Failed to fetch listings");
    }

    return NextResponse.json({
      success: true,
      data: items || [],
    });
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
