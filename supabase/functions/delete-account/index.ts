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

function fail(step: string, error: unknown, status = 400) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[delete-account] ${step}: ${message}`);
  return json({ error: message, step }, status);
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

    // @supabase/server puede exponer el identificador como userClaims.id
    // y conserva el claim JWT original como jwtClaims.sub.
    const callerId = ctx.userClaims?.id ?? ctx.userClaims?.sub ?? ctx.jwtClaims?.sub;
    if (!callerId) return fail("auth-user-id", "Unauthorized", 401);

    let userId = callerId;
    try {
      const payload = await req.json().catch(() => ({}));
      const requestedUserId = typeof payload?.targetUserId === "string"
        ? payload.targetUserId
        : null;

      if (requestedUserId && requestedUserId !== callerId) {
        const { data: callerProfile, error: callerProfileError } = await ctx.supabaseAdmin
          .from("hoopers")
          .select("role")
          .eq("id", callerId)
          .maybeSingle();

        if (callerProfileError) return fail("read-caller-role", callerProfileError);
        if (callerProfile?.role !== "admin") return fail("admin-required", "Administrator role required", 403);
        userId = requestedUserId;
      }
    } catch (error) {
      return fail("read-request", error);
    }

    console.log(`[delete-account] start user=${userId}`);

    const { data: profile, error: profileError } = await ctx.supabaseAdmin
      .from("hoopers")
      .select("id, username, avatar_url")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) return fail("read-profile", profileError);
    if (!profile) return fail("profile-not-found", "Profile not found", 404);

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
    if (participantDeleteError) return fail("delete-tournament-participants", participantDeleteError);

    const { error: matchDeleteError } = await ctx.supabaseAdmin
      .from("matches")
      .delete()
      .or(`winner_id.eq.${userId},loser_id.eq.${userId}`);
    if (matchDeleteError) return fail("delete-matches", matchDeleteError);

    // El torneo puede seguir existiendo para los demás participantes.
    const { error: tournamentUpdateError } = await ctx.supabaseAdmin
      .from("tournaments")
      .update({ winner_id: null })
      .eq("winner_id", userId);
    if (tournamentUpdateError) return fail("clear-tournament-winner", tournamentUpdateError);

    const { error: profileDeleteError } = await ctx.supabaseAdmin
      .from("hoopers")
      .delete()
      .eq("id", userId);
    if (profileDeleteError) return fail("delete-profile", profileDeleteError);

    console.log(`[delete-account] profile deleted user=${userId}`);

    const { error: authDeleteError } = await ctx.supabaseAdmin.auth.admin.deleteUser(userId);
    if (authDeleteError) return fail("delete-auth-user", authDeleteError);

    console.log(`[delete-account] auth user deleted user=${userId}`);

    // Storage se limpia al final: un fallo aquí no deja una cuenta activa,
    // aunque puede requerir borrar manualmente algún avatar antiguo.
    let storageWarning: string | undefined;
    if (avatarPaths.size > 0) {
      const { error: storageError } = await ctx.supabaseAdmin.storage
        .from("avatars")
        .remove([...avatarPaths]);
      if (storageError) {
        console.error(`[delete-account] cleanup-storage: ${storageError.message}`);
        storageWarning = storageError.message;
      }
    }

    return json(storageWarning ? { ok: true, warning: storageWarning } : { ok: true });
  }),
};
