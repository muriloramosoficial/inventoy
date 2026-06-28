import { createClient } from "@supabase/supabase-js";
import type { LoginRequest, AuthSession } from "../domain/auth.types";

export async function loginUseCase(request: LoginRequest): Promise<AuthSession> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email: request.email,
    password: request.password,
  });

  if (error || !data.user) {
    throw new Error("Email ou senha inválidos");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (!profile) {
    throw new Error("Perfil não encontrado");
  }

  return {
    user: { id: data.user.id, email: data.user.email },
    tenantId: profile.tenant_id,
    profile: { id: profile.id, name: profile.name, role: profile.role },
  };
}
