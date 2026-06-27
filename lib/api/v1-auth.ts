import { createClient } from "@/lib/supabase/server";
import { authenticateApiRequest, checkPlanAccess } from "@/lib/api/auth";

interface V1AuthResult {
  tenantId: string;
  userId: string | null;
}

export async function authenticateV1Request(
  request: Request
): Promise<V1AuthResult> {
  // Try bearer token first (API key)
  const apiResult = await authenticateApiRequest(request);
  if (apiResult.authenticated && apiResult.tenantId) {
    const hasAccess = await checkPlanAccess(apiResult.tenantId, "api");
    if (!hasAccess) {
      throw new V1AuthError("API access requires an active Starter plan or above", 403);
    }
    return { tenantId: apiResult.tenantId, userId: null };
  }

  // Fall back to cookie-based auth (dashboard users)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("tenant_id")
      .eq("id", user.id)
      .single();

    if (profile) {
      return { tenantId: profile.tenant_id, userId: user.id };
    }
  }

  throw new V1AuthError("Unauthorized. Provide a valid API key or log in.", 401);
}

export class V1AuthError extends Error {
  status: number;

  constructor(message: string, status: number = 401) {
    super(message);
    this.name = "V1AuthError";
    this.status = status;
  }
}
