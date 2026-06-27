import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/v1/movements
 * List inventory movements (audit log).
 * 
 * Query params:
 *   page, page_size, product_id, type, from_date, to_date
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = Math.min(parseInt(searchParams.get("page_size") || "50"), 100);
    const productId = searchParams.get("product_id");
    const type = searchParams.get("type");
    const fromDate = searchParams.get("from_date");
    const toDate = searchParams.get("to_date");

    let query = supabase
      .from("movements")
      .select("*, product:products(name, sku), user:profiles(name, email)", { count: "exact" });

    if (productId) query = query.eq("product_id", productId);
    if (type) query = query.eq("type", type);
    if (fromDate) query = query.gte("created_at", fromDate);
    if (toDate) query = query.lte("created_at", toDate);

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
    console.error("API v1 movements error:", error);
    return NextResponse.json(
      { error: "Failed to fetch movements", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/movements
 * Register a new movement.
 * 
 * Body:
 *   product_id, type (in/out/transfer/adjustment/count), quantity, location_id,
 *   to_location_id (for transfers), notes?, reference?
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json();

    const { product_id, type, quantity, location_id, to_location_id, notes, reference } = body;

    if (!product_id || !type || !quantity || !location_id) {
      return NextResponse.json(
        { error: "Missing required fields: product_id, type, quantity, location_id" },
        { status: 400 }
      );
    }

    const validTypes = ["in", "out", "transfer", "adjustment", "count"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Get product to verify ownership
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("tenant_id")
      .eq("id", product_id)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    const { data, error } = await supabase
      .from("movements")
      .insert({
        tenant_id: product.tenant_id,
        product_id,
        from_location_id: type === "in" ? null : location_id,
        to_location_id: type === "out" ? null : to_location_id || location_id,
        quantity,
        type,
        notes: notes || null,
        reference: reference || null,
        user_id: profile?.id || user.id,
      })
      .select("*, product:products(name, sku)")
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    console.error("API v1 movements create error:", error);
    return NextResponse.json(
      { error: "Failed to create movement", message: error.message },
      { status: 500 }
    );
  }
}
