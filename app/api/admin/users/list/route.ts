import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    // 1. Get user from request cookies (server client)
    const supabaseServer = await createClient();
    const { data: { user: adminUser } } = await supabaseServer.auth.getUser();
    
    if (!adminUser) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // 2. Check if user is system admin/staff
    const { data: adminProfile } = await supabaseServer
      .from("profiles")
      .select("is_system_admin, is_staff")
      .eq("id", adminUser.id)
      .single();

    if (!adminProfile?.is_system_admin && !adminProfile?.is_staff) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // 3. Rate limiting - max 30 requests per minute per admin
    const { checkRateLimit } = await import('@/lib/rate-limiter');
    const rateLimitResult = await checkRateLimit(`admin:users:list:${adminUser.id}`, 30, 60);
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    // 4. Use admin client (service role) to fetch ALL users bypassing RLS
    const supabaseAdmin = createAdminClient();

    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select(`
        id,
        name,
        email,
        role,
        is_system_admin,
        is_staff,
        status,
        suspended_at,
        banned_at,
        created_at,
        tenant_id
      `)
      .order("created_at", { ascending: false });

    if (profilesError) throw profilesError;

    // Fetch all tenants for lookup
    const { data: tenants, error: tenantsError } = await supabaseAdmin
      .from("tenants")
      .select("id, name, plan, slug");

    if (tenantsError) throw tenantsError;

    // Map tenants by id
    const tenantMap: Record<string, { name: string; plan: string; slug: string }> = {};
    (tenants || []).forEach((t) => {
      tenantMap[t.id] = { name: t.name, plan: t.plan, slug: t.slug };
    });

    // Join profiles with tenant data
    const usersWithTenants = (profiles || []).map((u) => ({
      ...u,
      tenants: u.tenant_id ? tenantMap[u.tenant_id] || null : null,
    }));

    // 5. Audit log
    await supabaseAdmin.from('audit_log').insert({
      admin_user_id: adminUser.id,
      action: 'list_all_users',
      target_table: 'profiles',
      target_id: null,
      metadata: { count: usersWithTenants.length },
      created_at: new Date().toISOString(),
    }).catch(() => {}); // Don't fail request if audit log fails

    return NextResponse.json({ users: usersWithTenants });
  } catch (err) {
    console.error("[api/admin/users/list] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro interno do servidor" },
      { status: 500 }
    );
  }
}