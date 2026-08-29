// Invite and delete auth users. Both need the service-role key (the browser's
// anon key cannot touch auth.admin), so they live here rather than in the client.
// Role/name changes are plain table updates and stay on the client under RLS.

import { adminClient, corsHeaders, fail, getCaller, json } from "../_shared/util.ts";

interface Body {
  action: "invite" | "delete";
  email?: string;
  name?: string;
  role?: "admin" | "editor" | "viewer";
  id?: string;
  /** Where the invited user lands after accepting. */
  redirectTo?: string;
}

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return fail(req, "Use POST", 405);

  const caller = await getCaller(req);
  if (caller?.role !== "admin") return fail(req, "Admin access required", 403);

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return fail(req, "Invalid JSON body");
  }

  const admin = adminClient();

  if (body.action === "invite") {
    if (!body.email) return fail(req, "email is required");

    const { data, error } = await admin.auth.admin.inviteUserByEmail(body.email, {
      data: { name: body.name ?? "" },
      redirectTo: body.redirectTo,
    });
    if (error) return fail(req, error.message, 400);

    // handle_new_user() has already created the profile with the default role;
    // apply the requested one and name on top.
    const { error: profileError } = await admin
      .from("profiles")
      .update({ name: body.name ?? "", role: body.role ?? "viewer" })
      .eq("id", data.user.id);
    if (profileError) return fail(req, profileError.message, 400);

    return json(req, { id: data.user.id });
  }

  if (body.action === "delete") {
    if (!body.id) return fail(req, "id is required");
    if (body.id === caller.id) return fail(req, "You cannot delete your own account", 400);

    // Deleting the auth user cascades to profiles via the FK.
    const { error } = await admin.auth.admin.deleteUser(body.id);
    if (error) return fail(req, error.message, 400);
    return json(req, { ok: true });
  }

  return fail(req, `Unknown action: ${body.action}`);
});
