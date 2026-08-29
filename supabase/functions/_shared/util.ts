// Shared helpers for the DS Docs Edge Functions.
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") ?? "*")
  .split(",")
  .map(o => o.trim())
  .filter(Boolean);

export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  const allow =
    ALLOWED_ORIGINS.includes("*") ? "*"
    : ALLOWED_ORIGINS.includes(origin) ? origin
    : ALLOWED_ORIGINS[0] ?? "";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

export function json(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), "content-type": "application/json" },
  });
}

export function fail(req: Request, message: string, status = 400): Response {
  return json(req, { error: message }, status);
}

/** Service-role client — bypasses RLS. Only ever used inside Edge Functions. */
export function adminClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
}

export type Caller = { id: string; role: "admin" | "editor" | "viewer" } | null;

/**
 * Resolve the signed-in user from the request's Authorization header.
 * Returns null for anonymous callers (the anon key alone is not a user).
 */
export async function getCaller(req: Request): Promise<Caller> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;

  const token = authHeader.replace(/^Bearer\s+/i, "");
  const admin = adminClient();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return null;

  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (!profile) return null;
  return { id: data.user.id, role: profile.role };
}

export function canEdit(caller: Caller): boolean {
  return caller?.role === "admin" || caller?.role === "editor";
}

/** Read a stored third-party key. Returns "" when the service is not configured. */
export async function getSecret(service: string): Promise<string> {
  const { data } = await adminClient()
    .from("service_credentials")
    .select("secret")
    .eq("service", service)
    .single();
  return data?.secret ?? "";
}

/** Figma file key out of a figma.com URL, or null. */
export function figmaFileKey(url: string): string | null {
  return url.match(/figma\.com\/(?:design|file|proto|board)\/([^/?#]+)/)?.[1] ?? null;
}
