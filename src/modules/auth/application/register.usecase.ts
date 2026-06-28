import { createClient } from "@supabase/supabase-js";
import type { RegisterRequest } from "../domain/auth.types";

interface RegisterResult {
  userId: string;
  tenantId: string;
}

export async function registerUseCase(request: RegisterRequest): Promise<RegisterResult> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: request.email,
    password: request.password,
  });

  if (authError || !authData.user) {
    throw new Error(authError?.message || "Erro ao criar conta");
  }

  const slug = request.tenantName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .insert({ name: request.tenantName, slug, plan: "free", locale: "pt-BR" })
    .select()
    .single();

  if (tenantError || !tenant) {
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw new Error("Erro ao criar organização");
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: authData.user.id,
    tenant_id: tenant.id,
    email: request.email,
    name: request.name,
    role: "admin",
  });

  if (profileError) {
    await supabase.from("tenants").delete().eq("id", tenant.id);
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw new Error("Erro ao criar perfil");
  }

  return { userId: authData.user.id, tenantId: tenant.id };
}
