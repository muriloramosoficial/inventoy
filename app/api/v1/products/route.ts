import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/v1/products
 * List products with pagination and filters.
 * 
 * Headers:
 *   Authorization: Bearer {api_key}
 * 
 * Query params:
 *   page, page_size, search, category_id, active
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = Math.min(parseInt(searchParams.get("page_size") || "50"), 100);
    const search = searchParams.get("search");
    const categoryId = searchParams.get("category_id");
    const active = searchParams.get("active");

    let query = supabase
      .from("products")
      .select("*", { count: "exact" });

    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }
    if (active === "true") {
      query = query.eq("is_active", true);
    } else if (active === "false") {
      query = query.eq("is_active", false);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return NextResponse.json({
      data: data || [],
      pagination: {
        total: count || 0,
        page,
        page_size: pageSize,
        total_pages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (error: any) {
    console.error("API v1 products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/products
 * Create a new product.
 * 
 * Body:
 *   sku, name, description?, category_id?, min_stock?, unit?, price?, cost?
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json();

    const { sku, name, description, category_id, min_stock, unit, price, cost } = body;

    if (!sku || !name) {
      return NextResponse.json(
        { error: "Missing required fields: sku, name" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("products")
      .insert({
        sku,
        name,
        description: description || null,
        category_id: category_id || null,
        min_stock: min_stock || 0,
        unit: unit || "un",
        price: price || null,
        cost: cost || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Product with this SKU already exists" },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    console.error("API v1 products create error:", error);
    return NextResponse.json(
      { error: "Failed to create product", message: error.message },
      { status: 500 }
    );
  }
}
