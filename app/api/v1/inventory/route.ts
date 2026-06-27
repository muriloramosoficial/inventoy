import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/v1/inventory
 * List inventory items with product and location details.
 * 
 * Query params:
 *   page, page_size, search, category_id, status (low/critical)
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = Math.min(parseInt(searchParams.get("page_size") || "50"), 100);
    const search = searchParams.get("search");

    let query = supabase
      .from("inventory_items")
      .select("*, product:products(*), location:locations(*)", { count: "exact" });

    if (search) {
      query = query.or(`product.name.ilike.%${search}%,product.sku.ilike.%${search}%`);
    }
    // Note: low stock filtering should be done client-side using product.min_stock

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await query
      .order("updated_at", { ascending: false })
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
    console.error("API v1 inventory error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory", message: error.message },
      { status: 500 }
    );
  }
}
