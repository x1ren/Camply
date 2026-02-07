import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { id } = await context.params;

    console.log("Fetching product with ID:", id);

    // 1️⃣ Fetch the item along with categories and images
    const { data: item, error: itemError } = await supabase
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
        school,
        user_id,
        display_name,
        avatar_url,
        categories (
          name
        ),
        item_images (
          image_url
        )
      `
      )
      .eq("id", id)
      .maybeSingle(); 

    if (itemError) {
      console.error("Error fetching item:", itemError);
      return NextResponse.json(
        { error: itemError.message || "Product not found" },
        { status: 500 }
      );
    }

    if (!item) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }


 




    // 3️⃣ Handle categories and images
    // Note: categories is an object (not array) from Supabase join
    const categoryName = (item.categories as any)?.name || "Uncategorized";
    const images = (item.item_images || []).map((img: any) => img.image_url);


    const productDetails = {
      id: item.id,
      title: item.title,
      description: item.description,
      price: item.price,
      condition: item.condition,
      status: item.status,
      created_at: item.created_at,
      category: categoryName,
      images,
      seller: {
        avatar_url: item.avatar_url || null,
        display_name: item.display_name || "Unknown",
        school: item.school || "Unknown",
      },
    };

    return NextResponse.json({
      success: true,
      data: productDetails,
    });
  } catch (error) {
    console.error("Error in item detail API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
