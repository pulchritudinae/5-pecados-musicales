-- Ampliación de torneos 5PM.
-- Ejecutar una sola vez en Supabase SQL Editor.

create table if not exists public.tournament_cups (
  key text primary key,
  name text not null,
  tier text not null,
  points integer not null check (points > 0),
  description text not null
);

insert into public.tournament_cups (key, name, tier, points, description) values
  ('BRONZE_RISE', 'Ascenso de Bronce', 'Bronce', 20, 'Para el primer torneo que deja de ser promesa y empieza a ser camino.'),
  ('BRONZE_BLOCK', 'Bloque de Bronce', 'Bronce', 25, 'La copa de quien aguanta la presión de su primera calle.'),
  ('BRONZE_SPARK', 'Chispa de Bronce', 'Bronce', 30, 'Reconoce una victoria pequeña con una historia grande.'),
  ('BRONZE_FOUNDATION', 'Cimiento de Bronce', 'Bronce', 35, 'Para quien empieza a construir un nombre que todavía crecerá.'),
  ('BRONZE_ROOKIE', 'Rookie de Bronce', 'Bronce', 40, 'El primer metal de quien entra al circuito con hambre.'),
  ('SILVER_PULSE', 'Pulso de Plata', 'Plata', 45, 'Para quien ya sabe cuándo acelerar y cuándo esperar.'),
  ('SILVER_GRIT', 'Filo de Plata', 'Plata', 50, 'Premia una competición ganada con disciplina y desgaste.'),
  ('SILVER_CIRCUIT', 'Circuito de Plata', 'Plata', 55, 'Una copa para quien convierte cada ronda en experiencia.'),
  ('SILVER_VANGUARD', 'Vanguardia de Plata', 'Plata', 60, 'Para el jugador que marca el ritmo antes de que los demás lo entiendan.'),
  ('SILVER_ELITE', 'Élite de Plata', 'Plata', 65, 'El salto que separa a un buen hooper de un rival habitual.'),
  ('GOLD_CROWN', 'Corona de Oro', 'Oro', 70, 'Una victoria que ya pesa en la memoria colectiva.'),
  ('GOLD_IMPACT', 'Impacto de Oro', 'Oro', 80, 'Para un torneo que cambia la posición de alguien en la calle.'),
  ('GOLD_DOMINION', 'Dominio de Oro', 'Oro', 90, 'Reconoce a quien controla el cuadro de principio a fin.'),
  ('GOLD_HEADLINER', 'Cabeza de Cartel', 'Oro', 100, 'La copa de quien convierte una final en un acontecimiento.'),
  ('GOLD_LEGACY', 'Legado de Oro', 'Oro', 110, 'Para una actuación que seguirá citándose después del torneo.'),
  ('PLATINUM_VECTOR', 'Vector de Platino', 'Platino', 120, 'Una trayectoria limpia, precisa y difícil de repetir.'),
  ('PLATINUM_MONUMENT', 'Monumento de Platino', 'Platino', 135, 'Para un campeón que deja una marca visible en toda la competición.'),
  ('PLATINUM_APEX', 'Cima de Platino', 'Platino', 150, 'La copa reservada para cuadros realmente exigentes.'),
  ('PLATINUM_ORBIT', 'Órbita de Platino', 'Platino', 165, 'Para quien juega por encima del nivel esperado y no pierde altura.'),
  ('PLATINUM_ABSOLUTE', 'Absoluto de Platino', 'Platino', 180, 'Una distinción excepcional para una superioridad incontestable.'),
  ('OBSIDIAN_RELIC', 'Reliquia de Obsidiana', 'Obsidiana', 200, 'Para una competición que se convierte en parte del mito de 5PM.'),
  ('OBSIDIAN_TITAN', 'Titán de Obsidiana', 'Obsidiana', 225, 'La copa de quien sobrevive a un cuadro de nivel extremo.'),
  ('OBSIDIAN_VOID', 'Vacío de Obsidiana', 'Obsidiana', 250, 'Para una final que deja al resto sin respuesta.'),
  ('OBSIDIAN_ECLIPSE', 'Eclipse de Obsidiana', 'Obsidiana', 275, 'Una hazaña tan rara que tapa cualquier actuación anterior.'),
  ('OBSIDIAN_5PM', 'Cima 5PM', 'Obsidiana', 300, 'La copa máxima: dificultad, nivel y leyenda en una sola noche.')
on conflict (key) do update set
  name = excluded.name,
  tier = excluded.tier,
  points = excluded.points,
  description = excluded.description;

alter table public.tournaments add column if not exists starts_at timestamptz;
alter table public.tournaments add column if not exists ends_at timestamptz;
alter table public.tournaments add column if not exists cup_key text;
alter table public.tournaments add column if not exists cup_points integer not null default 0;
alter table public.hoopers add column if not exists tournament_rep integer not null default 0;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'tournaments_cup_key_fkey'
  ) then
    alter table public.tournaments
      add constraint tournaments_cup_key_fkey
      foreign key (cup_key) references public.tournament_cups(key);
  end if;
end $$;

create table if not exists public.tournament_trophies (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null unique references public.tournaments(id) on delete cascade,
  hooper_id uuid not null references public.hoopers(id) on delete cascade,
  cup_key text not null references public.tournament_cups(key),
  cup_points integer not null check (cup_points > 0),
  awarded_at timestamptz not null default now()
);

create table if not exists public.tournament_matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  round integer not null check (round > 0),
  slot integer not null check (slot > 0),
  player_a_id uuid references public.hoopers(id) on delete set null,
  player_b_id uuid references public.hoopers(id) on delete set null,
  winner_id uuid references public.hoopers(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'live', 'completed')),
  created_at timestamptz not null default now(),
  played_at timestamptz,
  unique (tournament_id, round, slot)
);

alter table public.tournament_cups enable row level security;
alter table public.tournament_trophies enable row level security;
alter table public.tournament_matches enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'tournament_cups' and policyname = 'Public reads tournament cups') then
    create policy "Public reads tournament cups" on public.tournament_cups for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'tournament_trophies' and policyname = 'Public reads tournament trophies') then
    create policy "Public reads tournament trophies" on public.tournament_trophies for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'tournament_trophies' and policyname = 'Admin manages tournament trophies') then
    create policy "Admin manages tournament trophies" on public.tournament_trophies for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where tablename = 'tournament_matches' and policyname = 'Public reads tournament matches') then
    create policy "Public reads tournament matches" on public.tournament_matches for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'tournament_matches' and policyname = 'Admin manages tournament matches') then
    create policy "Admin manages tournament matches" on public.tournament_matches for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
  end if;
end $$;

create or replace function public.finalize_tournament(
  p_tournament_id uuid,
  p_winner_id uuid,
  p_cup_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  tournament_row public.tournaments%rowtype;
  cup_row public.tournament_cups%rowtype;
  old_trophy public.tournament_trophies%rowtype;
begin
  if not is_admin(auth.uid()) then
    raise exception 'Administrator role required';
  end if;

  select * into tournament_row from public.tournaments where id = p_tournament_id for update;
  if not found then raise exception 'Tournament not found'; end if;

  select * into cup_row from public.tournament_cups where key = p_cup_key;
  if not found then raise exception 'Tournament cup not found'; end if;

  if not exists (
    select 1 from public.tournament_participants
    where tournament_id = p_tournament_id and hooper_id = p_winner_id
  ) then
    raise exception 'Winner is not registered in this tournament';
  end if;

  select * into old_trophy from public.tournament_trophies where tournament_id = p_tournament_id;
  if found then
    update public.hoopers
      set tournament_rep = greatest(0, coalesce(tournament_rep, 0) - old_trophy.cup_points)
      where id = old_trophy.hooper_id;
    delete from public.tournament_trophies where id = old_trophy.id;
  end if;

  update public.tournaments
    set status = 'closed',
        winner_id = p_winner_id,
        cup_key = cup_row.key,
        cup_points = cup_row.points,
        closed_at = coalesce(closed_at, now())
    where id = p_tournament_id;

  insert into public.tournament_trophies (tournament_id, hooper_id, cup_key, cup_points)
  values (p_tournament_id, p_winner_id, cup_row.key, cup_row.points);

  update public.hoopers
    set tournament_rep = coalesce(tournament_rep, 0) + cup_row.points
    where id = p_winner_id;

  return jsonb_build_object('ok', true, 'cup_key', cup_row.key, 'cup_points', cup_row.points);
end;
$$;

grant execute on function public.finalize_tournament(uuid, uuid, text) to authenticated;
