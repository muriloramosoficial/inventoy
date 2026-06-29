import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, tenantId, ...params } = body;

    if (!action || !tenantId) {
      return NextResponse.json({ error: "action e tenantId sao obrigatorios" }, { status: 400 });
    }

    // 1. Get user from request cookies (server client)
    const supabaseServer = await createClient();
    const { data: { user: adminUser } } = await supabaseServer.auth.getUser();
    if (!adminUser) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
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

    // 3. Use admin client (service role) for mutations bypassing RLS
    const supabaseAdmin = createAdminClient();

    switch (action) {
      // ─── Update Tenant (plan & status) ───
      case "update-tenant": {
        const { plan, subscription_status } = params;

        if (plan && !["free", "starter", "pro", "enterprise"].includes(plan)) {
          return NextResponse.json({ error: "Plano invalido" }, { status: 400 });
        }

        if (subscription_status && !["active", "trialing", "past_due", "canceled"].includes(subscription_status)) {
          return NextResponse.json({ error: "Status de assinatura invalido" }, { status: 400 });
        }

        const updateData: Record<string, string> = {};
        if (plan) updateData.plan = plan;
        if (subscription_status) updateData.subscription_status = subscription_status;

        const { error } = await supabaseAdmin
          .from("tenants")
          .update(updateData)
          .eq("id", tenantId);

        if (error) throw error;

        return NextResponse.json({ success: true, message: "Empresa atualizada com sucesso" });
      }

      // ─── Toggle Tenant Status ───
      case "toggle-status": {
        const { subscription_status } = params;

        if (!subscription_status || !["active", "canceled"].includes(subscription_status)) {
          return NextResponse.json({ error: "Status invalido" }, { status: 400 });
        }

        const { error } = await supabaseAdmin
          .from("tenants")
          .update({ subscription_status })
          .eq("id", tenantId);

        if (error) throw error;

        return NextResponse.json({ success: true, message: `Empresa ${subscription_status === "active" ? "ativada" : "suspensa"} com sucesso` });
      }

      default:
        return NextResponse.json({ error: `Acao desconhecida: ${action}` }, { status: 400 });
    }
  } catch (err) {
    console.error("[Admin Tenant Update Error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao processar requisicao" },
      { status: 500 }
    );
  }
}