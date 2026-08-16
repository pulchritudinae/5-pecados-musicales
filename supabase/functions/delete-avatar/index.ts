import { withSupabase } from "npm:@supabase/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getPath(avatarUrl: string) {
  const marker = "/storage/v1/object/public/avatars/";
  const index = avatarUrl.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(avatarUrl.slice(index + marker.length));
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

    const callerId = ctx.userClaims?.id ?? ctx.userClaims?.sub ?? ctx.jwtClaims?.sub;
    if (!callerId) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const avatarUrl = typeof body?.avatarUrl === "string" ? body.avatarUrl : "";
    const requestedUserId = typeof body?.targetUserId === "string" ? body.targetUserId : callerId;
    const path = getPath(avatarUrl);
    if (!path) return json({ error: "Invalid avatar URL" }, 400);

    const { data: targetProfile, error: profileError } = await ctx.supabaseAdmin
      .from("hoopers")
      .select("id, username, role")
      .eq("id", requestedUserId)
      .maybeSingle();
    if (profileError) return json({ error: profileError.message }, 400);
    if (!targetProfile) return json({ error: "Profile not found" }, 404);

    if (requestedUserId !== callerId) {
      const { data: callerProfile } = await ctx.supabaseAdmin
        .from("hoopers")
        .select("role")
        .eq("id", callerId)
        .maybeSingle();
      if (callerProfile?.role !== "admin") return json({ error: "Administrator role required" }, 403);
    }

    if (!path.startsWith(`${targetProfile.username}-`)) {
      return json({ error: "Avatar does not belong to this profile" }, 403);
    }

    const { error: removeError } = await ctx.supabaseAdmin.storage
      .from("avatars")
      .remove([path]);
    if (removeError) return json({ error: removeError.message }, 400);

    return json({ ok: true });
  }),
};
