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

    // Primero eliminamos las relaciones que impedirían borrar el perfil.
    const { error: participantDeleteError } = await ctx.supabaseAdmin
      .from("tournament_participants")
      .delete()
      .eq("hooper_id", userId);
    if (participantDeleteError) return json({ error: participantDeleteError.message }, 400);

    const { error: matchDeleteError } = await ctx.supabaseAdmin
      .from("matches")
      .delete()
      .or(`winner_id.eq.${userId},loser_id.eq.${userId}`);
    if (matchDeleteError) return json({ error: matchDeleteError.message }, 400);

    // El torneo puede seguir existiendo para los demás participantes.
    const { error: tournamentUpdateError } = await ctx.supabaseAdmin
      .from("tournaments")
      .update({ winner_id: null })
      .eq("winner_id", userId);
    if (tournamentUpdateError) return json({ error: tournamentUpdateError.message }, 400);

    const { error: profileDeleteError } = await ctx.supabaseAdmin
      .from("hoopers")
      .delete()
      .eq("id", userId);
    if (profileDeleteError) return json({ error: profileDeleteError.message }, 400);

    const { error: authDeleteError } = await ctx.supabaseAdmin.auth.admin.deleteUser(userId);
    if (authDeleteError) return json({ error: authDeleteError.message }, 400);

    // Storage se limpia al final: un fallo aquí no deja una cuenta activa,
    // aunque puede requerir borrar manualmente algún avatar antiguo.
    let storageWarning: string | undefined;
    if (avatarPaths.size > 0) {
      const { error: storageError } = await ctx.supabaseAdmin.storage
        .from("avatars")
        .remove([...avatarPaths]);
      if (storageError) storageWarning = storageError.message;
    }

    return json(storageWarning ? { ok: true, warning: storageWarning } : { ok: true });
  }),
};
