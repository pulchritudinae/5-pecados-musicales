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

function getAvatarPath(avatarUrl: string | null | undefined) {
  if (!avatarUrl) return null;
  const marker = "/storage/v1/object/public/avatars/";
  const index = avatarUrl.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(avatarUrl.slice(index + marker.length));
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

    const userId = ctx.userClaims?.sub;
    if (!userId) return json({ error: "Unauthorized" }, 401);

    const { data: profile, error: profileError } = await ctx.supabaseAdmin
      .from("hoopers")
      .select("id, username, avatar_url")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) return json({ error: profileError.message }, 400);

    const avatarPaths = new Set<string>();
    const currentAvatarPath = getAvatarPath(profile?.avatar_url);
    if (currentAvatarPath) avatarPaths.add(currentAvatarPath);

    // Las fotos creadas por la web actual se guardan en la raíz como
    // {username}-{timestamp}.jpg. Esto también limpia reemplazos antiguos.
    if (profile?.username) {
      const { data: files } = await ctx.supabaseAdmin.storage
        .from("avatars")
        .list("", { limit: 1000 });
      const prefix = `${profile.username}-`;
      (files ?? [])
        .filter((file) => file.name.startsWith(prefix))
        .forEach((file) => avatarPaths.add(file.name));
    }

    if (avatarPaths.size > 0) {
      const { error: storageError } = await ctx.supabaseAdmin.storage
        .from("avatars")
        .remove([...avatarPaths]);
      if (storageError) return json({ error: storageError.message }, 400);
    }

    const { error: profileDeleteError } = await ctx.supabaseAdmin
      .from("hoopers")
      .delete()
      .eq("id", userId);
    if (profileDeleteError) return json({ error: profileDeleteError.message }, 400);

    const { error: authDeleteError } = await ctx.supabaseAdmin.auth.admin.deleteUser(userId);
    if (authDeleteError) return json({ error: authDeleteError.message }, 400);

    return json({ ok: true });
  }),
};
