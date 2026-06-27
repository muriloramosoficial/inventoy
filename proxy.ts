import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login, register, auth (auth routes)
     * - termos, privacidade (legal pages)
     * - api/ (API routes handle their own auth)
     * - Static files (.svg, .png, .jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|login|register|auth|termos|privacidade|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
