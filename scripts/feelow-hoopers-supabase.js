// =========================================================
// FEELOW HOOPERS v4.3 — Pulido + fotos 800px
// =========================================================
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://olcakitusgghaiphdtgh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sY2FraXR1c2dnaGFpcGhkdGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwMzg3MjgsImV4cCI6MjEwMTYxNDcyOH0.Iud3mLFAn6xzrcxuQlNYKG6TtkYLnPvxJ_iIuKyzSck';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const PHOTO_TARGET_PX = 800;
const STREAK_FIRE = 3;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

let currentUserCache;
let currentUserRequest = null;
let liveRefreshTimer = null;
let liveChannel = null;

const BADGE_SVG = {
    'CIMIENTOS':         `<svg viewBox="0 0 24 24"><path d="M3 7h18v13H3z M3 11.5h18 M3 16h18 M9 7v4.5 M15 11.5v4.5 M9 16v4"/></svg>`,
    'SANGRE NUEVA':      `<svg viewBox="0 0 24 24"><path d="M12 3c3.5 4.6 6 8 6 11a6 6 0 0 1-12 0c0-3 2.5-6.4 6-11z M8.5 14.5h2l1-2 1.5 3 1-1.5h1.5"/></svg>`,
    'DUEÑO DE LA PISTA': `<svg viewBox="0 0 24 24"><path d="M4 17l1.2-8 4 3.5L12 6l2.8 6.5 4-3.5L20 17z M4 20h16"/></svg>`,
    'ROMPE-ÍDOLOS':      `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M9 5.5l2.5 4.5-2 3 3.5 6"/></svg>`,
    'LEYENDA':           `<svg viewBox="0 0 24 24"><path d="M9.5 11h5v9h-5z M12 11V9 M12 3c1.6 2 2 3.6 0 5.4C10 6.6 10.4 5 12 3z M7 20h10"/></svg>`,
    '1V1 INCOMBATIBLE':  `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 4v16 M4.8 8.5c2.2 2 12.2 2 14.4 0 M4.8 15.5c2.2-2 12.2-2 14.4 0"/></svg>`,
    'CLUTCH':            `<svg viewBox="0 0 24 24"><path d="M6 3h12 M6 21h12 M7.5 3c0 4.5 3.5 5.5 4.5 7 1-1.5 4.5-2.5 4.5-7 M7.5 21c0-4.5 3.5-5.5 4.5-7 1 1.5 4.5 2.5 4.5 7"/></svg>`,
    'RACHA DE FUEGO':    `<svg viewBox="0 0 24 24"><path d="M12 3c1 3.5 4.5 5 4.5 9a4.5 4.5 0 0 1-9 0c0-2.2 1.2-4 2.3-5.6.5 1.2 1.4 1.8 1.4 1.8C11.4 6.5 11.6 4.8 12 3z M12 13c-.8 1-1.2 1.8-1.2 2.6a1.2 1.2 0 0 0 2.4 0c0-.8-.4-1.6-1.2-2.6z"/></svg>`,
    'CAMPEÓN DE TORNEO': `<svg viewBox="0 0 24 24"><path d="M8 4h8v5a4 4 0 0 1-8 0z M8 5H4.5c0 3.2 1.6 4.8 3.5 5 M16 5h3.5c0 3.2-1.6 4.8-3.5 5 M12 13v3 M9 20h6 M10 16h4l.8 4H9.2z"/></svg>`,
    'MVP DE LA CALLE':   `<svg viewBox="0 0 24 24"><path d="M12 3l2.7 5.8 6.3.9-4.6 4.3 1.2 6.2-5.6-3.1-5.6 3.1 1.2-6.2L3 9.7l6.3-.9z"/></svg>`
};

const BADGE_META = {
    'CIMIENTOS':         { rep: 55,  title: 'CIMIENTOS',         description: 'Una insignia de origen: la que reconoce a quien abrió la puerta y dejó la primera huella en la calle.' },
    'SANGRE NUEVA':      { rep: 40,  title: 'SANGRE NUEVA',      description: 'Para quien llegó con hambre, sin permiso y con la intención de hacerse notar desde el primer día.' },
    'DUEÑO DE LA PISTA': { rep: 80,  title: 'DUEÑO DE LA PISTA', description: 'Se reconoce a quien entra en la cancha y hace que el juego se incline a su ritmo.' },
    'ROMPE-ÍDOLOS':      { rep: 75,  title: 'ROMPE-ÍDOLOS',      description: 'Para el hooper que no se inclina ante la figura, el nombre ni la presión del momento.' },
    'LEYENDA':           { rep: 100, title: 'LEYENDA',           description: 'La marca de quien ya no solo juega: se vuelve parte del relato de las noches y del barrio.' },
    '1V1 INCOMBATIBLE':  { rep: 70,  title: '1V1 INCOMBATIBLE',  description: 'Reconoce la lectura, la distancia y la precisión de quien corta la salida antes de que el juego respire.' },
    'CLUTCH':            { rep: 60,  title: 'CLUTCH',            description: 'Para el instante exacto en el que una decisión cambia el partido y deja el silencio en la pista.' },
    'RACHA DE FUEGO':    { rep: 65,  title: 'RACHA DE FUEGO',    description: 'Una recompensa para quien no se detiene, y convierte cada aparición en una amenaza real.' },
    'CAMPEÓN DE TORNEO': { rep: 85,  title: 'CAMPEÓN DE TORNEO', description: 'Se otorga a quien cerró el torneo con autoridad, presencia y la última palabra en la noche.' },
    'MVP DE LA CALLE':   { rep: 90,  title: 'MVP DE LA CALLE',   description: 'La insignia de quien pesa en los momentos difíciles y deja la cancha más viva que cuando entró.' }
};

const GLYPH = {
    crown:  '<svg class="tick-glyph" viewBox="0 0 24 24"><path d="M4 17l1.2-8 4 3.5L12 6l2.8 6.5 4-3.5L20 17z M4 20h16"/></svg>',
    flame:  '<svg class="tick-glyph" viewBox="0 0 24 24"><path d="M12 3c1 3.5 4.5 5 4.5 9a4.5 4.5 0 0 1-9 0c0-2.2 1.2-4 2.3-5.6.5 1.2 1.4 1.8 1.4 1.8C11.4 6.5 11.6 4.8 12 3z"/></svg>',
    ball:   '<svg class="tick-glyph" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 4v16 M4 12h16"/></svg>',
    candle: '<svg class="tick-glyph" viewBox="0 0 24 24"><path d="M9.5 11h5v9h-5z M12 3c1.6 2 2 3.6 0 5.4C10 6.6 10.4 5 12 3z"/></svg>',
    star:   '<svg class="tick-glyph" viewBox="0 0 24 24"><path d="M12 3l2.7 5.8 6.3.9-4.6 4.3 1.2 6.2-5.6-3.1-5.6 3.1 1.2-6.2L3 9.7l6.3-.9z"/></svg>'
};

const TIERS = {
    kings:    { label: 'The Kings',    cls: 'tier-kings' },
    hustlers: { label: 'The Hustlers', cls: 'tier-hustlers' },
    asphalt:  { label: 'The Asphalt',  cls: 'tier-asphalt' }
};
function tierByPosition(p) {
    if (p <= 3) return TIERS.kings;
    if (p <= 50) return TIERS.hustlers;
    return TIERS.asphalt;
}

function escapeHtml(v) {
    return String(v ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function getBadgeMeta(b) { return BADGE_META[b] || { rep: 0, title: b, description: 'Insignia especial de la calle.' }; }
function getBadgeSvg(b) { return BADGE_SVG[b] || '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/></svg>'; }

const CUP_COLORS = {
    Bronce: '#a86632',
    Plata: '#c5ccd2',
    Oro: '#f2c069',
    Platino: '#dfe9f2',
    Obsidiana: '#9b8be5'
};
const CUP_CATALOG = [
    ['BRONZE_RISE','Ascenso de Bronce','Bronce',20,'Primer paso: la promesa empieza a convertirse en camino.','rise'],
    ['BRONZE_BLOCK','Bloque de Bronce','Bronce',25,'Aguantar la presión de la primera calle.','block'],
    ['BRONZE_SPARK','Chispa de Bronce','Bronce',30,'Una victoria pequeña con una historia grande.','spark'],
    ['BRONZE_FOUNDATION','Cimiento de Bronce','Bronce',35,'Construir un nombre que todavía crecerá.','foundation'],
    ['BRONZE_ROOKIE','Rookie de Bronce','Bronce',40,'El primer metal de quien entra con hambre.','ribbon'],
    ['SILVER_PULSE','Pulso de Plata','Plata',45,'Saber cuándo acelerar y cuándo esperar.','pulse'],
    ['SILVER_GRIT','Filo de Plata','Plata',50,'Disciplina y desgaste hasta la última ronda.','blade'],
    ['SILVER_CIRCUIT','Circuito de Plata','Plata',55,'Cada ronda se convierte en experiencia.','circuit'],
    ['SILVER_VANGUARD','Vanguardia de Plata','Plata',60,'Marcar el ritmo antes que los demás.','wings'],
    ['SILVER_ELITE','Élite de Plata','Plata',65,'El salto que separa al buen hooper del rival habitual.','double'],
    ['GOLD_CROWN','Corona de Oro','Oro',70,'Una victoria que ya pesa en la memoria.','crown'],
    ['GOLD_IMPACT','Impacto de Oro','Oro',80,'Un torneo que cambia la posición en la calle.','impact'],
    ['GOLD_DOMINION','Dominio de Oro','Oro',90,'Controlar el cuadro de principio a fin.','dominion'],
    ['GOLD_HEADLINER','Cabeza de Cartel','Oro',100,'Convertir una final en un acontecimiento.','spotlight'],
    ['GOLD_LEGACY','Legado de Oro','Oro',110,'Una actuación que seguirá citándose.','legacy'],
    ['PLATINUM_VECTOR','Vector de Platino','Platino',120,'Trayectoria limpia, precisa y difícil de repetir.','vector'],
    ['PLATINUM_MONUMENT','Monumento de Platino','Platino',135,'Dejar una marca visible en toda la competición.','monument'],
    ['PLATINUM_APEX','Cima de Platino','Platino',150,'Reservada para cuadros realmente exigentes.','apex'],
    ['PLATINUM_ORBIT','Órbita de Platino','Platino',165,'Jugar por encima del nivel esperado.','orbit'],
    ['PLATINUM_ABSOLUTE','Absoluto de Platino','Platino',180,'Superioridad excepcional e incontestable.','absolute'],
    ['OBSIDIAN_RELIC','Reliquia de Obsidiana','Obsidiana',200,'Una competición que entra en el mito de 5PM.','relic'],
    ['OBSIDIAN_TITAN','Titán de Obsidiana','Obsidiana',225,'Sobrevivir a un cuadro de nivel extremo.','titan'],
    ['OBSIDIAN_VOID','Vacío de Obsidiana','Obsidiana',250,'Una final que deja al resto sin respuesta.','void'],
    ['OBSIDIAN_ECLIPSE','Eclipse de Obsidiana','Obsidiana',275,'Una hazaña que tapa cualquier actuación anterior.','eclipse'],
    ['OBSIDIAN_5PM','Cima 5PM','Obsidiana',300,'Dificultad, nivel y leyenda en una sola noche.','five']
].map(([key, name, tier, points, description, variant]) => ({ key, name, tier, points, description, variant }));
const CUP_BY_KEY = Object.fromEntries(CUP_CATALOG.map(cup => [cup.key, cup]));
function getCupMeta(key) { return CUP_BY_KEY[key] || { key, name: key || 'Copa', tier: 'Bronce', points: 0, description: 'Trofeo de torneo.', variant: 'rise' }; }
function getCupSvg(cupKey, className = 'cup-icon') {
    const cup = getCupMeta(cupKey);
    const color = CUP_COLORS[cup.tier] || CUP_COLORS.Bronce;
    const accent = cup.tier === 'Obsidiana' ? '#eeeaff' : '#fff6d8';
    const extras = {
        rise: '<path d="M12 2v4M6 5l2.5 3M18 5l-2.5 3"/>',
        block: '<path d="M5 8h14v8H5zM8 16v3M16 16v3"/>',
        spark: '<path d="m12 2 1.4 4.2L18 8l-4.6 1.8L12 14l-1.4-4.2L6 8l4.6-1.8Z"/>',
        foundation: '<path d="M4 19h16M6 16h12M8 13h8"/>',
        ribbon: '<path d="M9 17 8 22l4-2 4 2-1-5"/>',
        pulse: '<path d="M3 11h4l2-4 3 9 2-5 2 3h5"/>',
        blade: '<path d="m7 18 10-12 1 5-8 9Z"/>',
        circuit: '<path d="M4 6h5v5h6v7h5M4 18h4"/>',
        wings: '<path d="M9 8 4 5l2 7-4 3 7-1M15 8l5-3-2 7 4 3-7-1"/>',
        double: '<path d="M7 5v4M17 5v4M5 12h14"/>',
        crown: '<path d="m4 7 4 4 4-7 4 7 4-4-2 10H6Z"/>',
        impact: '<circle cx="12" cy="9" r="6"/><path d="M12 3v12M6 9h12M8 19h8"/>',
        dominion: '<path d="M4 17h16M6 17 8 6l4 5 4-5 2 11"/>',
        spotlight: '<circle cx="12" cy="8" r="4"/><path d="M4 19h16M7 15l-3 4M17 15l3 4"/>',
        legacy: '<path d="M12 3v17M7 8h10M5 20h14"/><circle cx="12" cy="3" r="2"/>',
        vector: '<path d="m5 19 7-14 7 14M8 14h8"/>',
        monument: '<path d="M6 20h12M7 17h10M8 17V8h8v9M6 8h12M12 4v4"/>',
        apex: '<path d="m4 19 8-16 8 16-8-4Z"/>',
        orbit: '<ellipse cx="12" cy="11" rx="9" ry="4"/><ellipse cx="12" cy="11" rx="4" ry="9"/>',
        absolute: '<circle cx="12" cy="10" r="7"/><path d="M7 20h10M9 17h6"/>',
        relic: '<path d="M7 4h10M8 4v7l4 4 4-4V4M5 20h14M8 18h8"/>',
        titan: '<path d="M5 20h14M7 17h10M8 17 7 7l5 4 5-4-1 10M12 3v8"/>',
        void: '<circle cx="12" cy="10" r="7" fill="currentColor" stroke="none"/><circle cx="12" cy="10" r="3" fill="#0b0b0b" stroke="none"/>',
        eclipse: '<circle cx="10" cy="10" r="7"/><circle cx="15" cy="8" r="7" fill="#0b0b0b" stroke="none"/><path d="M8 20h8"/>',
        five: '<path d="M12 2 14 8l6-2-4 5 5 3-6 .5 2 6.5-5-4-5 4 2-6.5-6-.5 5-3-4-5 6 2Z"/>'
    }[cup.variant] || '';
    return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H4.5c0 3 1.2 4.8 3.2 5M17 6h2.5c0 3-1.2 4.8-3.2 5M12 14v3M8 20h8M9 17h6" stroke="${color}"/>${extras}<path d="M8 20h8" stroke="${accent}"/></svg>`;
}
function globalRep(user) { return (Number(user?.rep) || 0) + (Number(user?.tournament_rep) || 0); }
function sortByGlobalRep(users) { return [...(users || [])].sort((a, b) => globalRep(b) - globalRep(a) || String(a.id).localeCompare(String(b.id))); }
function formatDateTime(d) {
    if (!d) return '';
    const date = new Date(d);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });
}
function renderTrophyCards(trophies = [], compact = false) {
    if (!trophies.length) return '<span class="profile-badges-empty">Sin copas todavía.</span>';
    return trophies.map(trophy => {
        const cup = getCupMeta(trophy.cup_key);
        const tournamentName = trophy.tournament?.name || 'Torneo 5PM';
        return `<article class="trophy-card${compact ? ' is-compact' : ''}" title="${escapeHtml(cup.description)}">
            <div class="trophy-card-icon">${getCupSvg(cup.key)}</div>
            <div class="trophy-card-copy"><strong>${escapeHtml(cup.name)}</strong><span>${escapeHtml(tournamentName)}</span><em>+${trophy.cup_points || cup.points} REP de copa</em></div>
        </article>`;
    }).join('');
}
function renderBracket(matches = [], names = new Map(), isAdmin = false) {
    if (!matches.length) return '<div class="bracket-empty">Cuadro todavía no generado.</div>';
    const rounds = [...new Set(matches.map(match => match.round))].sort((a, b) => a - b);
    return `<div class="tournament-bracket">${rounds.map(round => {
        const roundMatches = matches.filter(match => match.round === round).sort((a, b) => a.slot - b.slot);
        return `<section class="bracket-round"><span class="bracket-round-label">${round === rounds.length ? 'Final' : round === rounds.length - 1 ? 'Semifinal' : `Ronda ${round}`}</span>${roundMatches.map(match => {
            const a = names.get(match.player_a_id) || 'Pendiente';
            const b = names.get(match.player_b_id) || 'Pendiente';
            const completed = match.status === 'completed';
            const actionA = isAdmin && !completed && match.player_a_id ? `<button type="button" class="bracket-winner-btn ${match.winner_id === match.player_a_id ? 'is-winner' : ''}" data-bracket-winner="${match.player_a_id}" data-bracket-match="${match.id}">${escapeHtml(a)}</button>` : `<span class="bracket-player ${match.winner_id === match.player_a_id ? 'is-winner' : ''}">${escapeHtml(a)}</span>`;
            const actionB = isAdmin && !completed && match.player_b_id ? `<button type="button" class="bracket-winner-btn ${match.winner_id === match.player_b_id ? 'is-winner' : ''}" data-bracket-winner="${match.player_b_id}" data-bracket-match="${match.id}">${escapeHtml(b)}</button>` : `<span class="bracket-player ${match.winner_id === match.player_b_id ? 'is-winner' : ''}">${escapeHtml(b)}</span>`;
            return `<article class="bracket-match ${completed ? 'is-completed' : ''}"><div>${actionA}</div><div>${actionB}</div></article>`;
        }).join('')}</section>`;
    }).join('')}</div>`;
}
function formatDate(d) {
    const date = new Date(d);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
}
function streakLabel(s) {
    if (!s || s === 0) return '<span class="streak-cold">—</span>';
    if (s >= STREAK_FIRE) return `<span class="streak-hot">x${s}</span>`;
    if (s <= -STREAK_FIRE) return `<span class="streak-cold">x${Math.abs(s)}</span>`;
    return `<span class="streak-warm">${s}</span>`;
}
function getDefaultAvatar() {
    const svg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#111"/><circle cx="50" cy="50" r="38" fill="none" stroke="#3a3a3a" stroke-width="2"/><path d="M12 50 Q50 68 88 50" fill="none" stroke="#3a3a3a" stroke-width="2"/><path d="M50 12 Q32 50 50 88" fill="none" stroke="#3a3a3a" stroke-width="2"/></svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
function getPhotoElement(u, cls) {
    const p = u.avatar_url || getDefaultAvatar();
    return `<img class="${cls}" src="${p}" alt="${escapeHtml(u.username)}" loading="lazy" style="filter:none;-webkit-filter:none;mix-blend-mode:normal;" />`;
}
function animateNumber(el, from, to, duration = 600) {
    if (!el) return;
    const start = performance.now();
    const diff = to - from;
    const tick = now => {
        const pr = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - pr, 3);
        el.textContent = Math.round(from + diff * eased);
        if (pr < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}

// FOTOS EN COLOR: normaliza solo las imágenes, sin recorrer todos sus ancestros en cada refresco.
function forceColorPhotos() {
    document.querySelectorAll('img').forEach(img => {
        img.style.setProperty('filter', 'none', 'important');
        img.style.setProperty('-webkit-filter', 'none', 'important');
        img.style.setProperty('mix-blend-mode', 'normal', 'important');
    });
}

async function getCompressedPhoto(file) {
    if (!file) return '';
    if (!file.type.startsWith('image/')) throw new Error('El archivo no es una imagen válida.');
    if (file.size > MAX_PHOTO_BYTES) throw new Error('La imagen supera el límite de 10 MB.');
    const dataUrl = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.onerror = () => rej(new Error('No se pudo leer la imagen.'));
        r.readAsDataURL(file);
    });
    try {
        return await new Promise((res, rej) => {
            const img = new Image();
            img.onload = () => {
                const scale = Math.min(1, PHOTO_TARGET_PX / Math.max(img.width, img.height));
                const w = Math.max(1, Math.round(img.width * scale));
                const h = Math.max(1, Math.round(img.height * scale));
                const c = document.createElement('canvas');
                c.width = w; c.height = h;
                c.getContext('2d').drawImage(img, 0, 0, w, h);
                res(c.toDataURL('image/jpeg', 0.9));
            };
            img.onerror = () => rej(new Error('Imagen corrupta.'));
            img.src = dataUrl;
        });
    } catch { return dataUrl; }
}
function dataUrlToBlob(d) {
    const parts = d.split(';base64,');
    const ct = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const u = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; ++i) u[i] = raw.charCodeAt(i);
    return new Blob([u], { type: ct });
}
async function uploadAvatar(username, dataUrl) {
    const name = `${username}-${Date.now()}.jpg`;
    const { data, error } = await supabase.storage.from('avatars').upload(name, dataUrlToBlob(dataUrl), { contentType: 'image/jpeg', upsert: true });
    if (error) throw new Error('No se pudo subir la foto: ' + error.message);
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(data.path);
    return urlData.publicUrl;
}
async function removeOldAvatar(avatarUrl, targetUserId = null) {
    if (!avatarUrl) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;
    const { error } = await supabase.functions.invoke('delete-avatar', {
        body: { avatarUrl, ...(targetUserId ? { targetUserId } : {}) },
        headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (error) throw new Error(error.message);
}
function setupPhotoPreview(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    if (!input || !preview) return;
    input.addEventListener('change', () => {
        const file = input.files[0];
        if (!file) { preview.innerHTML = ''; preview.classList.remove('has-image'); return; }
        const objectUrl = URL.createObjectURL(file);
        preview.innerHTML = `<img src="${objectUrl}" alt="Vista previa" style="filter:none;-webkit-filter:none;" />`;
        preview.querySelector('img')?.addEventListener('load', () => URL.revokeObjectURL(objectUrl), { once: true });
        preview.classList.add('has-image');
        forceColorPhotos();
    });
}

let feedbackTimer = null;
function showFeedback(msg, type = 'ok') {
    const el = document.getElementById('feedback');
    if (!el) return window.alert(msg);
    el.textContent = msg;
    el.className = `feelow-feedback is-visible ${type}`;
    if (feedbackTimer) clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => el.classList.remove('is-visible'), 4200);
}

async function getCurrentUser(force = false) {
    if (!force && currentUserCache !== undefined) return currentUserCache;
    if (!force && currentUserRequest) return currentUserRequest;
    const request = (async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return (currentUserCache = null);
        const { data: profile } = await supabase.from('hoopers')
            .select('id,username,city,avatar_url,rep,tournament_rep,streak,wins,losses,unique_games,matches,tournaments,badges,role')
            .eq('id', user.id).single();
        return (currentUserCache = profile || null);
    })();
    currentUserRequest = request;
    try { return await request; }
    finally { if (currentUserRequest === request) currentUserRequest = null; }
}
function invalidateCurrentUser() { currentUserCache = undefined; currentUserRequest = null; }
async function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const email = document.getElementById('register-email').value.trim();
    const city = document.getElementById('register-city').value.trim();
    const photoFile = document.getElementById('register-photo').files[0];
    if (username.length < 3) return showFeedback('Usuario mínimo 3 caracteres.', 'error');
    if (password.length < 4) return showFeedback('Contraseña mínimo 4 caracteres.', 'error');
    if (!email || !email.includes('@')) return showFeedback('Email inválido.', 'error');
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { username, city } } });
    if (error) return showFeedback('Error: ' + error.message, 'error');
    if (!data.user) return showFeedback('No se pudo crear la cuenta.', 'error');
    if (photoFile && data.session) {
        try {
            const compressed = await getCompressedPhoto(photoFile);
            const url = await uploadAvatar(username, compressed);
            await supabase.from('hoopers').update({ avatar_url: url }).eq('id', data.user.id);
        } catch (err) {
            showFeedback('Cuenta creada, pero la foto no se subió: ' + err.message, 'error');
            event.target.reset(); updateAllViews(); return;
        }
    }
    showFeedback(`Bienvenido a la calle, ${username}.`, 'ok');
    invalidateCurrentUser();
    event.target.reset();
    const pv = document.getElementById('register-photo-preview');
    if (pv) { pv.innerHTML = ''; pv.classList.remove('has-image'); }
    updateAllViews();
}
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    if (!email || !password) return showFeedback('Email y contraseña requeridos.', 'error');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return showFeedback('Credenciales incorrectas.', 'error');
    showFeedback('Sesión iniciada.', 'ok');
    invalidateCurrentUser();
    event.target.reset();
    updateAllViews();
}
function setPasswordRecoveryMode(active) {
    document.getElementById('password-update-panel')?.classList.toggle('hidden', !active);
    if (active) document.getElementById('password-update-panel')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
}
async function handlePasswordRecovery(event) {
    event.preventDefault();
    const email = document.getElementById('recovery-email').value.trim();
    if (!email || !email.includes('@')) return showFeedback('Introduce un email válido.', 'error');
    const baseUrl = window.location.origin === 'null'
        ? window.location.href.split('?')[0]
        : `${window.location.origin}${window.location.pathname}`;
    const redirectTo = `${baseUrl}?recovery=1`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) return showFeedback('No se pudo enviar el enlace: ' + error.message, 'error');
    showFeedback('Si el email está registrado, recibirás un enlace de recuperación.', 'ok');
    event.target.reset();
}
async function handlePasswordUpdate(event) {
    event.preventDefault();
    const password = document.getElementById('new-password').value;
    const confirmation = document.getElementById('new-password-confirm').value;
    if (password.length < 4) return showFeedback('La nueva contraseña necesita 4+ caracteres.', 'error');
    if (password !== confirmation) return showFeedback('Las contraseñas no coinciden.', 'error');
    const submit = event.submitter;
    if (submit) submit.disabled = true;
    try {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) return showFeedback('No se pudo actualizar: ' + error.message, 'error');
        showFeedback('Contraseña actualizada.', 'ok');
        event.target.reset();
        setPasswordRecoveryMode(false);
        invalidateCurrentUser();
        await updateAllViews();
    } finally {
        if (submit) submit.disabled = false;
    }
}
async function handleLogout() {
    await supabase.auth.signOut();
    invalidateCurrentUser();
    showFeedback('Sesión cerrada.', 'ok');
    updateAllViews();
}

function askDeleteAccountConfirmation() {
    const dialog = document.getElementById('delete-account-dialog');
    if (!dialog || typeof dialog.showModal !== 'function') {
        return Promise.resolve(window.confirm('Esta acción borrará tu perfil, tu foto y tu cuenta de acceso. No se puede deshacer. ¿Continuar?'));
    }
    return new Promise(resolve => {
        const handleClose = () => resolve(dialog.returnValue === 'confirm');
        dialog.addEventListener('close', handleClose, { once: true });
        dialog.showModal();
    });
}

async function handleDeleteAccount() {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.access_token) {
        invalidateCurrentUser();
        return showFeedback('La sesión ha caducado. Cierra sesión y vuelve a entrar antes de eliminar la cuenta.', 'error');
    }
    const user = await getCurrentUser(true);
    if (!user) return showFeedback('No hay una sesión activa.', 'error');
    const confirmed = await askDeleteAccountConfirmation();
    if (!confirmed) return;
    const button = document.getElementById('delete-account-btn');
    if (button) button.disabled = true;
    try {
        const { error } = await supabase.functions.invoke('delete-account', {
            body: {},
            headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (error) return showFeedback('No se pudo eliminar la cuenta: ' + error.message, 'error');
        await supabase.auth.signOut();
        invalidateCurrentUser();
        showFeedback('Cuenta eliminada.', 'ok');
        await updateAllViews();
    } finally {
        if (button) button.disabled = false;
    }
}
async function handleEditSelf(event) {
    event.preventDefault();
    const me = await getCurrentUser();
    if (!me) return showFeedback('No hay sesión activa.', 'error');
    const updateData = { city: document.getElementById('edit-self-city').value.trim() };
    const oldAvatarUrl = me.avatar_url;
    const password = document.getElementById('edit-self-password').value;
    const photoFile = document.getElementById('edit-self-photo').files[0];
    if (photoFile) {
        try {
            const compressed = await getCompressedPhoto(photoFile);
            updateData.avatar_url = await uploadAvatar(me.username, compressed);
        } catch (err) { return showFeedback(err.message, 'error'); }
    }
    const { error: upErr } = await supabase.from('hoopers').update(updateData).eq('id', me.id);
    if (upErr) return showFeedback('Error al guardar: ' + upErr.message, 'error');
    let avatarCleanupWarning = false;
    if (photoFile && oldAvatarUrl && oldAvatarUrl !== updateData.avatar_url) {
        try { await removeOldAvatar(oldAvatarUrl); } catch { avatarCleanupWarning = true; }
    }
    if (password) {
        if (password.length < 4) return showFeedback('La nueva contraseña necesita 4+ caracteres.', 'error');
        const { error: pwErr } = await supabase.auth.updateUser({ password });
        if (pwErr) return showFeedback('Error de contraseña: ' + pwErr.message, 'error');
    }
    showFeedback(avatarCleanupWarning ? 'Perfil actualizado. La foto anterior quedó pendiente de limpieza.' : 'Perfil actualizado.', avatarCleanupWarning ? 'error' : 'ok');
    invalidateCurrentUser();
    document.getElementById('edit-self-password').value = '';
    const pv = document.getElementById('edit-self-photo-preview');
    if (pv) { pv.innerHTML = ''; pv.classList.remove('has-image'); }
    document.getElementById('edit-self-photo').value = '';
    updateAllViews();
}

let lastRepMap = {};
async function updateRanking() {
    const { data: rawUsers, error } = await supabase.from('hoopers')
        .select('id,username,city,avatar_url,rep,tournament_rep,streak,wins,losses,unique_games,matches,tournaments,badges');
    const users = sortByGlobalRep(rawUsers);
    const tbody = document.getElementById('ranking-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (error) {
        tbody.innerHTML = `<tr><td colspan="8" class="ranking-empty">No se pudo cargar el ranking. Inténtalo de nuevo.</td></tr>`;
        return;
    }
    if (!users || !users.length) {
        tbody.innerHTML = `<tr><td colspan="8" class="ranking-empty">Aún no hay hoopers registrados.</td></tr>`;
        return;
    }
    users.forEach((user, index) => {
        const pos = index + 1;
        const label = pos < 10 ? `0${pos}` : String(pos);
        const tier = tierByPosition(pos);
        const row = document.createElement('tr');
        row.className = `ranking-row ${tier.cls}`;
        row.dataset.userId = user.id;
        row.tabIndex = 0;
        row.setAttribute('role', 'button');
        row.setAttribute('aria-label', `Abrir placa de ${user.username}`);
        row.innerHTML = `
            <td><span class="rank-position">${label}</span></td>
            <td><div class="rank-photo-cell">${getPhotoElement(user, 'ranking-photo')}<span class="rank-name">${escapeHtml(user.username)}</span></div></td>
            <td>${user.wins}</td>
            <td>${user.unique_games || 0}</td>
            <td>${user.matches || 0}</td>
            <td>${user.losses || 0}</td>
            <td><span class="score-cell" data-user-id="${user.id}">${globalRep(user)}</span></td>
            <td>${streakLabel(user.streak || 0)}</td>`;
        row.addEventListener('click', () => openProfileModal(user.id));
        row.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openProfileModal(user.id);
            }
        });
        tbody.appendChild(row);
        if (lastRepMap[user.id] !== undefined && lastRepMap[user.id] !== globalRep(user)) {
            const cell = row.querySelector('.score-cell');
            if (cell) {
                animateNumber(cell, lastRepMap[user.id], globalRep(user));
                cell.classList.add('glowing');
                setTimeout(() => cell.classList.remove('glowing'), 2000);
            }
        }
        lastRepMap[user.id] = globalRep(user);
    });
    forceColorPhotos();
    updateSpotlight(users[0]);
    updateTicker(users);
}
function updateSpotlight(top) {
    if (!top) return;
    const photo = document.getElementById('spotlight-photo');
    const name = document.getElementById('spotlight-name');
    const rep = document.getElementById('spotlight-rep');
    if (photo) {
        photo.src = top.avatar_url || getDefaultAvatar();
        photo.alt = `Foto de ${top.username}`;
    }
    if (name) name.textContent = top.username;
    if (rep) rep.textContent = `${globalRep(top)} REP`;
    forceColorPhotos();
}

// TICKER ARREGLADO: nombres con clase ticker-user + espacio no colapsable
function updateTicker(users) {
    const track = document.getElementById('tickerTrack');
    if (!track || !users || !users.length) return;
    const items = [];
    const medals = [GLYPH.crown, GLYPH.star, GLYPH.ball];
    users.slice(0, 3).forEach((u, i) => items.push(`${medals[i]}<b class="ticker-user">${escapeHtml(u.username)}</b>\u00A0domina con ${globalRep(u)} REP`));
    users.filter(u => u.streak >= STREAK_FIRE).slice(0, 2).forEach(u => items.push(`${GLYPH.flame}<b class="ticker-user">${escapeHtml(u.username)}</b>\u00A0encadena ${u.streak} victorias`));
    const active = [...users].sort((a, b) => (b.matches || 0) - (a.matches || 0))[0];
    if (active && active.matches > 0) items.push(`${GLYPH.ball}<b class="ticker-user">${escapeHtml(active.username)}</b>\u00A0es el más activo: ${active.matches} partidos`);
    users.filter(u => u.badges && u.badges.includes('LEYENDA')).slice(0, 1).forEach(u => items.push(`${GLYPH.candle}<b class="ticker-user">${escapeHtml(u.username)}</b>\u00A0ostenta el título de LEYENDA`));
    if (!items.length) items.push(`${GLYPH.ball}\u00A0Bienvenido al registro oficial de Feelow Hoopers`);
    const half = items.map(i => `<span class="ticker-item">${i}</span>`).join('');
    track.innerHTML = half + half;
}

async function renderProfile() {
    const pv = document.getElementById('profile-view');
    if (!pv) return;
    const user = await getCurrentUser();
    if (!user) { pv.innerHTML = '<p class="is-empty">No has iniciado sesión.</p>'; return; }
    const [{ data: all }, { data: trophies }] = await Promise.all([
        supabase.from('hoopers').select('id,rep,tournament_rep'),
        supabase.from('tournament_trophies').select('id,cup_key,cup_points,awarded_at,tournament:tournaments(name)').eq('hooper_id', user.id).order('awarded_at', { ascending: false })
    ]);
    const ranked = sortByGlobalRep(all);
    const pos = ranked.findIndex(u => u.id === user.id) + 1;
    const tier = tierByPosition(pos || 999);
    const badgesHtml = (user.badges && user.badges.length)
        ? user.badges.map(b => { const m = getBadgeMeta(b); return `<button type="button" class="profile-badge-chip" data-badge="${escapeHtml(b)}" title="${escapeHtml(m.title || b)}">${getBadgeSvg(b)}</button>`; }).join('')
        : '<span class="is-empty">Sin insignias</span>';
    pv.innerHTML = `
        <div class="profile-card">
            ${getPhotoElement(user, 'profile-photo')}
            <div>
                <h3>${escapeHtml(user.username)}</h3>
                <p>${user.city ? escapeHtml(user.city) : 'Sin ciudad'}</p>
                <p class="profile-rep-line"><strong>${globalRep(user)}</strong> REP · <span class="profile-tier-tag ${tier.cls}">${tier.label}</span></p>
            </div>
        </div>
        <div class="profile-stats">
            <div><span>Torneos</span><strong>${user.tournaments || 0}</strong></div>
            <div><span>Partidos</span><strong>${user.matches || 0}</strong></div>
            <div><span>Victorias</span><strong>${user.wins}</strong></div>
            <div><span>Juego Único</span><strong>${user.unique_games || 0}</strong></div>
        </div>
        <div class="profile-badges">${badgesHtml}</div>
        <div class="profile-trophies-heading">Copas de torneo</div>
        <div class="profile-trophies">${renderTrophyCards(trophies || [])}</div>`;
    pv.querySelectorAll('.profile-badge-chip').forEach(btn => {
        btn.addEventListener('click', () => {
            const m = getBadgeMeta(btn.dataset.badge);
            alert(`${m.title} (+${m.rep} REP)\n\n${m.description}`);
        });
    });
    const cityInput = document.getElementById('edit-self-city');
    if (cityInput) cityInput.value = user.city || '';
    forceColorPhotos();
}

async function renderTournaments() {
    const list = document.getElementById('tournaments-list');
    if (!list) return;
    const { data, error } = await supabase.from('tournaments')
        .select('id,name,status,created_at,closed_at,starts_at,ends_at,cup_key,cup_points,winner_id,winner:hoopers!tournaments_winner_id_fkey(username),participants:tournament_participants(hooper:hoopers!tournament_participants_hooper_id_fkey(username))')
        .order('created_at', { ascending: false });
    list.innerHTML = '';
    if (error) { list.innerHTML = '<div class="tournament-empty">No se pudieron cargar los torneos.</div>'; return; }
    if (!data || !data.length) { list.innerHTML = '<div class="tournament-empty">La cancha espera su primer torneo.</div>'; return; }
    const tournamentIds = data.map(tournament => tournament.id);
    const { data: bracketMatches } = await supabase.from('tournament_matches')
        .select('id,tournament_id,round,slot,player_a_id,player_b_id,winner_id,status')
        .in('tournament_id', tournamentIds);
    const matchUserIds = [...new Set((bracketMatches || []).flatMap(match => [match.player_a_id, match.player_b_id, match.winner_id]).filter(Boolean))];
    const { data: matchUsers } = matchUserIds.length ? await supabase.from('hoopers').select('id,username').in('id', matchUserIds) : { data: [] };
    const names = new Map((matchUsers || []).map(user => [user.id, user.username]));
    const currentUser = await getCurrentUser();
    const isAdmin = currentUser?.role === 'admin';
    data.forEach(tournament => {
        const card = document.createElement('article');
        card.className = `tournament-card is-${tournament.status}`;
        const parts = (tournament.participants || []).map(p => p.hooper?.username).filter(Boolean).join(', ') || 'Sin participantes';
        const cup = tournament.cup_key ? getCupMeta(tournament.cup_key) : null;
        const timing = tournament.starts_at || tournament.ends_at ? `<div class="tournament-timing">${tournament.starts_at ? `Inicio · ${escapeHtml(formatDateTime(tournament.starts_at))}` : ''}${tournament.ends_at ? `<br>Final · ${escapeHtml(formatDateTime(tournament.ends_at))}` : ''}</div>` : '';
        const matches = (bracketMatches || []).filter(match => match.tournament_id === tournament.id);
        card.innerHTML = `<header class="tournament-head"><div><span class="tournament-status ${tournament.status}">${tournament.status === 'open' ? 'En curso' : 'Cerrado'}</span><h3>${escapeHtml(tournament.name)}</h3><p class="tournament-date">Creado · ${formatDate(tournament.created_at)}</p>${timing}${tournament.closed_at ? `<p class="tournament-date">Cerrado · ${formatDate(tournament.closed_at)}</p>` : ''}</div>${cup ? `<div class="tournament-cup-mark">${getCupSvg(cup.key)}<span>${escapeHtml(cup.name)} · +${cup.points}</span></div>` : ''}${tournament.winner ? `<div class="tournament-winner">Campeón<div class="tournament-winner-name">${escapeHtml(tournament.winner.username)}</div></div>` : ''}</header><div class="tournament-participants">${escapeHtml(parts)}</div>${renderBracket(matches, names, isAdmin)}`;
        list.appendChild(card);
    });
    list.querySelectorAll('[data-bracket-winner]').forEach(button => button.addEventListener('click', handleBracketWinner));
}

async function renderTournamentsLegacy() {
    const list = document.getElementById('tournaments-list');
    if (!list) return;
    const { data, error } = await supabase.from('tournaments')
        .select(`id,name,status,created_at,closed_at,winner_id,winner:hoopers!tournaments_winner_id_fkey(username),participants:tournament_participants(hooper:hoopers!tournament_participants_hooper_id_fkey(username))`)
        .order('created_at', { ascending: false });
    list.innerHTML = '';
    if (error) { list.innerHTML = '<div class="tournament-empty">No se pudieron cargar los torneos.</div>'; return; }
    if (!data || !data.length) { list.innerHTML = `<div class="tournament-empty">La cancha espera su primer torneo.</div>`; return; }
    data.forEach(ev => {
        const card = document.createElement('article');
        card.className = `tournament-card is-${ev.status}`;
        const parts = (ev.participants || []).map(p => p.hooper?.username).filter(Boolean).join(', ') || 'Sin participantes';
        card.innerHTML = `<header class="tournament-head"><div><span class="tournament-status ${ev.status}">${ev.status === 'open' ? 'En curso' : 'Cerrado'}</span><h3>${escapeHtml(ev.name)}</h3><p class="tournament-date">Iniciado · ${formatDate(ev.created_at)}</p>${ev.closed_at ? `<p class="tournament-date">Cerrado · ${formatDate(ev.closed_at)}</p>` : ''}</div>${ev.winner ? `<div class="tournament-winner">Campeón<div class="tournament-winner-name">${escapeHtml(ev.winner.username)}</div></div>` : ''}</header><div class="tournament-participants">${parts}</div>`;
        list.appendChild(card);
    });
}

async function renderMatches() {
    const list = document.getElementById('matches-list');
    if (!list) return;
    const { data: matches, error } = await supabase.from('matches')
        .select('id,winner_id,loser_id,winner_unique,loser_unique,created_at')
        .order('created_at', { ascending: false }).limit(20);
    if (error) {
        list.innerHTML = '<div class="match-history-empty">No se pudo cargar el historial.</div>';
        return;
    }
    if (!matches || !matches.length) {
        list.innerHTML = '<div class="match-history-empty">Todavía no hay enfrentamientos registrados.</div>';
        return;
    }
    const ids = [...new Set(matches.flatMap(match => [match.winner_id, match.loser_id]).filter(Boolean))];
    const { data: users } = await supabase.from('hoopers').select('id,username').in('id', ids);
    const names = new Map((users || []).map(user => [user.id, user.username]));
    list.innerHTML = matches.map(match => {
        const date = match.created_at ? formatDate(match.created_at) : 'Partido registrado';
        const ju = match.winner_unique || match.loser_unique ? 'JU' : '1V1';
        return `<div class="match-history-row">
            <strong class="winner">${escapeHtml(names.get(match.winner_id) || 'Hooper')}</strong>
            <span class="match-result">${ju}<br>${escapeHtml(date)}</span>
            <strong class="loser">${escapeHtml(names.get(match.loser_id) || 'Hooper')}</strong>
        </div>`;
    }).join('');
}

async function openProfileModal(userId) {
    const { data: user } = await supabase.from('hoopers')
        .select('id,username,city,avatar_url,rep,tournament_rep,streak,wins,unique_games,badges')
        .eq('id', userId).single();
    if (!user) return;
    const [{ data: all }, { data: trophies }] = await Promise.all([
        supabase.from('hoopers').select('id,rep,tournament_rep'),
        supabase.from('tournament_trophies').select('id,cup_key,cup_points,awarded_at,tournament:tournaments(name)').eq('hooper_id', user.id).order('awarded_at', { ascending: false })
    ]);
    const ranked = sortByGlobalRep(all);
    const pos = ranked.findIndex(u => u.id === user.id) + 1;
    const tier = tierByPosition(pos || 999);
    const dialog = document.getElementById('profile-modal');
    if (!dialog) return;

    document.getElementById('profile-modal-photo').src = user.avatar_url || getDefaultAvatar();
    document.getElementById('profile-modal-photo').alt = `Foto de ${user.username}`;
    document.getElementById('profile-modal-name').textContent = user.username;
    document.getElementById('profile-modal-city').textContent = user.city || '—';
    document.getElementById('profile-modal-rep').textContent = globalRep(user);
    document.getElementById('profile-modal-streak').textContent = user.streak || 0;
    document.getElementById('profile-modal-wins').textContent = user.wins || 0;
    document.getElementById('profile-modal-unique').textContent = user.unique_games || 0;
    const tierEl = document.getElementById('profile-modal-tier');
    tierEl.textContent = `${tier.label} · ${globalRep(user)} REP`;
    tierEl.className = `profile-modal-tier ${tier.cls}`;
    const bw = document.getElementById('profile-modal-badges');
    const detail = document.getElementById('profile-modal-badge-detail');
    if (user.badges && user.badges.length) {
        bw.innerHTML = user.badges.map(b => { const m = getBadgeMeta(b); return `<button type="button" class="street-badge" data-badge="${escapeHtml(b)}" title="${escapeHtml(m.title || b)}">${getBadgeSvg(b)}</button>`; }).join('');
        if (detail) detail.innerHTML = '<span class="badge-detail-hint">Pulsa una insignia para leer su historia.</span>';
        bw.querySelectorAll('.street-badge').forEach(btn => {
            btn.addEventListener('click', () => {
                const m = getBadgeMeta(btn.dataset.badge);
                if (detail) detail.innerHTML = `<strong>${escapeHtml(m.title)} (+${m.rep} REP)</strong><span>${escapeHtml(m.description)}</span>`;
            });
        });
    } else {
        bw.innerHTML = '<span class="profile-badges-empty">Sin insignias todavía.</span>';
        if (detail) detail.innerHTML = '';
    }
    forceColorPhotos();

    if (typeof dialog.showModal === 'function') {
        if (dialog.open) dialog.close();
        dialog.showModal();
        const core = document.querySelector('.fh-cursor-core');
        const ring = document.querySelector('.fh-cursor-ring');
        if (core && ring) {
            dialog.appendChild(core);
            dialog.appendChild(ring);
        }
    } else {
        dialog.setAttribute('open', '');
    }
}

function closeProfileModal() {
    const d = document.getElementById('profile-modal');
    if (d && d.open) {
        const core = document.querySelector('.fh-cursor-core');
        const ring = document.querySelector('.fh-cursor-ring');
        if (core && ring) {
            document.body.appendChild(core);
            document.body.appendChild(ring);
        }
        d.close();
    }
}

async function showAdminPanel() {
    const ap = document.getElementById('admin-panel');
    if (!ap) return;
    const user = await getCurrentUser();
    const isAdm = user && user.role === 'admin';
    ap.classList.toggle('hidden', !isAdm);
    if (isAdm) await updateAdminSelects();
}
async function updateAdminSelects() {
    const { data: users, error } = await supabase.from('hoopers').select('id, username').order('username');
    if (error) return;
    if (!users) return;
    const selectIds = ['admin-user-select','admin-edit-user-select','admin-badge-user','admin-delete-select','tournament-add-user','admin-match-winner','admin-match-loser'];
    const previousSelections = new Map(selectIds.map(id => [id, document.getElementById(id)?.value || '']));
    const opts = users.map(u => `<option value="${u.id}">${escapeHtml(u.username)}</option>`).join('');
    ['admin-user-select','admin-edit-user-select','admin-badge-user','admin-delete-select','tournament-add-user','admin-match-winner','admin-match-loser'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = opts || '<option disabled>— Sin hoopers —</option>';
    });
    selectIds.forEach(id => {
        const el = document.getElementById(id);
        const previous = previousSelections.get(id);
        if (el && previous && users.some(u => u.id === previous)) el.value = previous;
    });
    await loadTournamentSelects();
    await loadAdminStats();
    await updateBadgeAssignment();
    updateBadgePreview();
}
async function loadAdminStats() {
    const uid = document.getElementById('admin-user-select')?.value;
    if (!uid) return;
    const { data: user } = await supabase.from('hoopers')
        .select('wins,unique_games,tournaments,matches,rep,tournament_rep').eq('id', uid).single();
    if (!user) return;
    const fields = {
        'admin-wins': user.wins || 0,
        'admin-unique-games': user.unique_games || 0,
        'admin-tournaments': user.tournaments || 0,
        'admin-matches': user.matches || 0,
        'admin-rep': globalRep(user)
    };
    Object.entries(fields).forEach(([id, value]) => {
        const field = document.getElementById(id);
        if (field) field.value = value;
    });
}
async function updateBadgeAssignment() {
    const uid = document.getElementById('admin-badge-user')?.value;
    const target = document.getElementById('admin-badge-current');
    if (!target || !uid) return;
    const { data: user } = await supabase.from('hoopers').select('badges').eq('id', uid).single();
    const badges = user?.badges || [];
    target.innerHTML = badges.length
        ? `<strong>Actualmente:</strong> ${badges.map(escapeHtml).join(' · ')}`
        : 'Actualmente: sin insignias';
}
function updateBadgePreview() {
    const sel = document.getElementById('admin-badge-select');
    if (!sel) return;
    const m = getBadgeMeta(sel.value);
    const icon = document.getElementById('admin-badge-preview-icon');
    const title = document.getElementById('admin-badge-preview-title');
    const text = document.getElementById('admin-badge-preview-text');
    if (icon) icon.innerHTML = getBadgeSvg(sel.value);
    if (title) title.textContent = m.title || sel.value;
    if (text) text.textContent = m.description || '';
}
function cupOptions(selected = '') {
    return CUP_CATALOG.map(cup => `<option value="${cup.key}"${cup.key === selected ? ' selected' : ''}>${escapeHtml(cup.tier)} · ${escapeHtml(cup.name)} (+${cup.points})</option>`).join('');
}
function populateCupSelect(id, selected = '') {
    const select = document.getElementById(id);
    if (!select) return;
    select.innerHTML = cupOptions(selected);
}
function updateCupPreview() {
    const select = document.getElementById('tournament-cup-select');
    const preview = document.getElementById('tournament-cup-preview');
    if (!select || !preview) return;
    const cup = getCupMeta(select.value);
    preview.innerHTML = `<div class="cup-preview-icon">${getCupSvg(cup.key)}</div><div><strong>${escapeHtml(cup.name)}</strong><span>${escapeHtml(cup.description)}</span><em>+${cup.points} REP de copa</em></div>`;
}
async function requireAdmin() {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        showFeedback('Necesitas permisos de administrador.', 'error');
        return false;
    }
    return true;
}
async function handleAdminStats(event) {
    event.preventDefault();
    if (!await requireAdmin()) return;
    const uid = document.getElementById('admin-user-select').value;
    if (!uid) return showFeedback('Selecciona un hooper.', 'error');
    const values = ['admin-wins', 'admin-unique-games', 'admin-tournaments', 'admin-matches']
        .map(id => Number(document.getElementById(id).value));
    if (values.some(value => !Number.isInteger(value) || value < 0)) {
        return showFeedback('Las estadísticas deben ser números enteros no negativos.', 'error');
    }
    const submit = event.submitter;
    if (submit) submit.disabled = true;
    try {
        const [wins, unique_games, tournaments, matches] = values;
        const { error } = await supabase.from('hoopers').update({ wins, unique_games, tournaments, matches }).eq('id', uid);
        if (error) return showFeedback('Error: ' + error.message, 'error');
        showFeedback('Stats actualizadas.', 'ok');
        await updateAllViews();
    } finally {
        if (submit) submit.disabled = false;
    }
}
async function handleAdminMatch(event) {
    event.preventDefault();
    if (!await requireAdmin()) return;
    const w = document.getElementById('admin-match-winner').value;
    const l = document.getElementById('admin-match-loser').value;
    if (!w || !l) return showFeedback('Selecciona ganador y perdedor.', 'error');
    if (w === l) return showFeedback('Deben ser distintos.', 'error');
    const submit = event.submitter;
    if (submit) submit.disabled = true;
    try {
        const { error } = await supabase.from('matches').insert({
            winner_id: w, loser_id: l,
            winner_unique: document.getElementById('admin-match-unique-winner')?.checked || false,
            loser_unique: document.getElementById('admin-match-unique-loser')?.checked || false
        });
        if (error) return showFeedback('Error: ' + error.message, 'error');
        document.getElementById('admin-match-unique-winner').checked = false;
        document.getElementById('admin-match-unique-loser').checked = false;
        showFeedback('Partido registrado. La calle toma nota.', 'ok');
        await updateAllViews();
    } finally {
        if (submit) submit.disabled = false;
    }
}
async function handleBadge(action) {
    if (!await requireAdmin()) return;
    const uid = document.getElementById('admin-badge-user').value;
    const badge = document.getElementById('admin-badge-select').value;
    if (!uid) return showFeedback('Selecciona un hooper.', 'error');
    const { data: user } = await supabase.from('hoopers').select('badges').eq('id', uid).single();
    if (!user) return;
    let nb = user.badges || [];
    if (action === 'grant') { if (nb.includes(badge)) return showFeedback('Ya tiene esa insignia.', 'error'); nb.push(badge); }
    else { const b = nb.length; nb = nb.filter(x => x !== badge); if (nb.length === b) return showFeedback('No tenía esa insignia.', 'error'); }
    const button = document.getElementById(action === 'grant' ? 'admin-badge-grant' : 'admin-badge-revoke');
    if (button) button.disabled = true;
    try {
        const { error } = await supabase.from('hoopers').update({ badges: nb }).eq('id', uid);
        if (error) return showFeedback('Error: ' + error.message, 'error');
        showFeedback(`Insignia ${action === 'grant' ? 'otorgada' : 'revocada'}.`, 'ok');
        await updateAllViews();
    } finally {
        if (button) button.disabled = false;
    }
}
async function handleAdminEdit(event) {
    event.preventDefault();
    if (!await requireAdmin()) return;
    const uid = document.getElementById('admin-edit-user-select').value;
    if (!uid) return showFeedback('Selecciona un hooper.', 'error');
    const updateData = { city: document.getElementById('admin-edit-city').value.trim() };
    const photoFile = document.getElementById('admin-edit-photo').files[0];
    if (photoFile) {
        try {
            const { data: u } = await supabase.from('hoopers').select('username,avatar_url').eq('id', uid).single();
            const compressed = await getCompressedPhoto(photoFile);
            updateData.avatar_url = await uploadAvatar(u.username, compressed);
            updateData._oldAvatarUrl = u.avatar_url;
        } catch (err) { return showFeedback(err.message, 'error'); }
    }
    const oldAvatarUrl = updateData._oldAvatarUrl;
    delete updateData._oldAvatarUrl;
    const { error } = await supabase.from('hoopers').update(updateData).eq('id', uid);
    if (error) return showFeedback('Error: ' + error.message, 'error');
    let avatarCleanupWarning = false;
    if (oldAvatarUrl && oldAvatarUrl !== updateData.avatar_url) {
        try { await removeOldAvatar(oldAvatarUrl, uid); } catch { avatarCleanupWarning = true; }
    }
    showFeedback(avatarCleanupWarning ? 'Perfil actualizado. La foto anterior quedó pendiente de limpieza.' : 'Perfil actualizado.', avatarCleanupWarning ? 'error' : 'ok');
    const pv = document.getElementById('admin-edit-photo-preview');
    if (pv) { pv.innerHTML = ''; pv.classList.remove('has-image'); }
    updateAllViews();
}
async function handleAdminDelete(event) {
    event.preventDefault();
    if (!await requireAdmin()) return;
    const uid = document.getElementById('admin-delete-select').value;
    if (!uid) return showFeedback('Selecciona un hooper.', 'error');
    const me = await getCurrentUser();
    if (!me) return showFeedback('La sesión de administrador ha caducado.', 'error');
    if (uid === me.id) return showFeedback('No puedes eliminarte a ti mismo.', 'error');
    if (!window.confirm('¿Eliminar definitivamente del registro?')) return;
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.access_token) return showFeedback('La sesión de administrador ha caducado.', 'error');
    const { error } = await supabase.functions.invoke('delete-account', {
        body: { targetUserId: uid },
        headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (error) return showFeedback('Error: ' + error.message, 'error');
    showFeedback('Usuario eliminado del registro y de Authentication.', 'ok');
    updateAllViews();
}
async function loadTournamentSelects() {
    const { data } = await supabase.from('tournaments').select('id, name, cup_key').eq('status', 'open').order('created_at', { ascending: false });
    const opts = data && data.length ? data.map(t => `<option value="${t.id}">${escapeHtml(t.name)}</option>`).join('') : '<option disabled value="">— Sin torneos —</option>';
    const a = document.getElementById('tournament-add-select');
    const c = document.getElementById('tournament-close-select');
    const b = document.getElementById('tournament-bracket-select');
    const previous = { add: a?.value || '', close: c?.value || '', bracket: b?.value || '' };
    if (a) a.innerHTML = opts;
    if (c) c.innerHTML = opts;
    if (b) b.innerHTML = opts;
    if (a && data?.some(tournament => tournament.id === previous.add)) a.value = previous.add;
    if (c && data?.some(tournament => tournament.id === previous.close)) c.value = previous.close;
    if (b && data?.some(tournament => tournament.id === previous.bracket)) b.value = previous.bracket;
    populateCupSelect('tournament-cup-select');
    populateCupSelect('tournament-close-cup');
    updateCupPreview();
    await loadTournamentParticipants();
}
async function loadTournamentParticipants() {
    const tid = document.getElementById('tournament-close-select').value;
    const sel = document.getElementById('tournament-close-participant');
    const remove = document.getElementById('tournament-remove-select');
    if (!sel) return;
    if (!tid) {
        sel.innerHTML = '<option disabled value="">— Elige torneo —</option>';
        if (remove) remove.innerHTML = '<option disabled value="">— Elige torneo —</option>';
        return;
    }
    const { data } = await supabase.from('tournament_participants').select('hooper:hoopers(id, username)').eq('tournament_id', tid);
    const { data: tournament } = await supabase.from('tournaments').select('cup_key').eq('id', tid).maybeSingle();
    const closeCup = document.getElementById('tournament-close-cup');
    if (closeCup && tournament?.cup_key) closeCup.value = tournament.cup_key;
    const opts = data && data.length ? data.map(p => `<option value="${p.hooper.id}">${escapeHtml(p.hooper.username)}</option>`).join('') : '<option disabled value="">— Sin participantes —</option>';
    sel.innerHTML = opts;
    if (remove) remove.innerHTML = opts;
}
async function handleCreateTournament(event) {
    event.preventDefault();
    if (!await requireAdmin()) return;
    const n = document.getElementById('tournament-name').value.trim();
    if (!n) return showFeedback('Falta el nombre del torneo.', 'error');
    const startsValue = document.getElementById('tournament-starts-at')?.value;
    const endsValue = document.getElementById('tournament-ends-at')?.value;
    const starts_at = startsValue ? new Date(startsValue).toISOString() : null;
    const ends_at = endsValue ? new Date(endsValue).toISOString() : null;
    if (starts_at && ends_at && new Date(ends_at) <= new Date(starts_at)) return showFeedback('La finalización debe ser posterior al inicio.', 'error');
    const cup_key = document.getElementById('tournament-cup-select')?.value || CUP_CATALOG[0].key;
    const cup = getCupMeta(cup_key);
    const { error } = await supabase.from('tournaments').insert({ name: n, status: 'open', starts_at, ends_at, cup_key, cup_points: cup.points });
    if (error) return showFeedback('Error: ' + error.message, 'error');
    event.target.reset();
    showFeedback(`Torneo «${n}» abierto.`, 'ok');
    updateAllViews();
}
async function handleGenerateBracket() {
    if (!await requireAdmin()) return;
    const tournamentId = document.getElementById('tournament-bracket-select')?.value;
    if (!tournamentId) return showFeedback('Selecciona un torneo.', 'error');
    const { data: participants, error: participantError } = await supabase.from('tournament_participants')
        .select('hooper_id').eq('tournament_id', tournamentId).order('hooper_id');
    if (participantError) return showFeedback('Error: ' + participantError.message, 'error');
    const ids = (participants || []).map(participant => participant.hooper_id);
    if (ids.length < 2) return showFeedback('Necesitas al menos dos participantes.', 'error');
    const size = 2 ** Math.ceil(Math.log2(ids.length));
    const rounds = Math.log2(size);
    const { error: clearError } = await supabase.from('tournament_matches').delete().eq('tournament_id', tournamentId);
    if (clearError) return showFeedback('No se pudo reiniciar el cuadro: ' + clearError.message, 'error');
    const rows = [];
    for (let round = 1; round <= rounds; round += 1) {
        const matchCount = size / (2 ** round);
        for (let slot = 1; slot <= matchCount; slot += 1) {
            rows.push({
                tournament_id: tournamentId,
                round,
                slot,
                player_a_id: round === 1 ? ids[(slot - 1) * 2] || null : null,
                player_b_id: round === 1 ? ids[(slot - 1) * 2 + 1] || null : null,
                status: 'pending'
            });
        }
    }
    const { error: insertError } = await supabase.from('tournament_matches').insert(rows);
    if (insertError) return showFeedback('No se pudo generar el cuadro: ' + insertError.message, 'error');
    const status = document.getElementById('admin-bracket-status');
    if (status) status.textContent = `${ids.length} participantes · cuadro de ${size} plazas generado.`;
    showFeedback('Cuadro generado. Ya puedes avanzar los ganadores.', 'ok');
    await updateAllViews();
}
async function handleBracketWinner(event) {
    if (!await requireAdmin()) return;
    const button = event.currentTarget;
    const matchId = button.dataset.bracketMatch;
    const winnerId = button.dataset.bracketWinner;
    const { data: match, error: matchError } = await supabase.from('tournament_matches').select('id,tournament_id,round,slot,status').eq('id', matchId).single();
    if (matchError || !match) return showFeedback('No se encontró esa partida.', 'error');
    if (match.status === 'completed') return;
    const { error: updateError } = await supabase.from('tournament_matches').update({ winner_id: winnerId, status: 'completed', played_at: new Date().toISOString() }).eq('id', matchId);
    if (updateError) return showFeedback('No se pudo avanzar el ganador: ' + updateError.message, 'error');
    const nextRound = match.round + 1;
    const nextSlot = Math.ceil(match.slot / 2);
    const { data: nextMatch } = await supabase.from('tournament_matches').select('id,slot,player_a_id,player_b_id').eq('tournament_id', match.tournament_id).eq('round', nextRound).eq('slot', nextSlot).maybeSingle();
    if (nextMatch) {
        const update = match.slot % 2 ? { player_a_id: winnerId } : { player_b_id: winnerId };
        await supabase.from('tournament_matches').update(update).eq('id', nextMatch.id);
    }
    showFeedback('Ganador avanzado en el cuadro.', 'ok');
    await updateAllViews();
}
async function handleAddParticipant() {
    if (!await requireAdmin()) return;
    const t = document.getElementById('tournament-add-select').value;
    const h = document.getElementById('tournament-add-user').value;
    if (!t || !h) return showFeedback('Selecciona torneo y hooper.', 'error');
    const { error } = await supabase.from('tournament_participants').insert({ tournament_id: t, hooper_id: h });
    if (error) return showFeedback(error.code === '23505' ? 'Ya estaba inscrito.' : 'Error: ' + error.message, 'error');
    showFeedback('Hooper inscrito.', 'ok');
    await updateAllViews();
}
async function handleCloseTournament(event) {
    event.preventDefault();
    if (!await requireAdmin()) return;
    const t = document.getElementById('tournament-close-select').value;
    const w = document.getElementById('tournament-close-participant').value;
    const cupKey = document.getElementById('tournament-close-cup')?.value || CUP_CATALOG[0].key;
    if (!t) return showFeedback('Selecciona un torneo.', 'error');
    if (!w) return showFeedback('Selecciona al campeón antes de cerrar el torneo.', 'error');
    const { error } = await supabase.rpc('finalize_tournament', { p_tournament_id: t, p_winner_id: w, p_cup_key: cupKey });
    if (error) return showFeedback('Error: ' + error.message, 'error');
    if (w) {
        const { data: winner } = await supabase.from('hoopers').select('badges').eq('id', w).single();
        if (winner) {
            const nb = [...(winner.badges || [])];
            if (!nb.includes('DUEÑO DE LA PISTA')) nb.push('DUEÑO DE LA PISTA');
            if (!nb.includes('CAMPEÓN DE TORNEO')) nb.push('CAMPEÓN DE TORNEO');
            const { error: badgeError } = await supabase.from('hoopers').update({ badges: nb }).eq('id', w);
            if (badgeError) return showFeedback('Torneo cerrado, pero no se pudieron asignar las insignias: ' + badgeError.message, 'error');
        }
    }
    showFeedback('Torneo cerrado. Corona entregada.', 'ok');
    await updateAllViews();
}

async function handleRemoveParticipant() {
    if (!await requireAdmin()) return;
    const t = document.getElementById('tournament-close-select').value;
    const h = document.getElementById('tournament-remove-select').value;
    if (!t || !h) return showFeedback('Selecciona torneo y participante.', 'error');
    const { error } = await supabase.from('tournament_participants').delete().eq('tournament_id', t).eq('hooper_id', h);
    if (error) return showFeedback('Error: ' + error.message, 'error');
    showFeedback('Participante desinscrito.', 'ok');
    await updateAllViews();
}

async function toggleAuthViews() {
    const user = await getCurrentUser();
    const auth = document.querySelector('.auth-panel');
    const prof = document.getElementById('user-profile');
    const edit = document.getElementById('edit-my-profile');
    if (!auth || !prof) return;
    if (user) { auth.classList.add('hidden'); prof.classList.remove('hidden'); if (edit) edit.classList.remove('hidden'); }
    else { auth.classList.remove('hidden'); prof.classList.add('hidden'); if (edit) edit.classList.add('hidden'); }
}
async function updateAllViews() {
    await Promise.all([
        updateRanking(),
        renderTournaments(),
        renderMatches(),
        renderProfile(),
        showAdminPanel(),
        toggleAuthViews()
    ]);
    const trophiesEl = document.getElementById('profile-modal-trophies');
    if (trophiesEl) trophiesEl.innerHTML = renderTrophyCards(trophies || [], true);
    forceColorPhotos();
}
async function loadEditUser() {
    const sel = document.getElementById('admin-edit-user-select');
    if (!sel) return;
    const uid = sel.value;
    if (!uid) return;
    const { data: u } = await supabase.from('hoopers').select('username,city,avatar_url').eq('id', uid).single();
    if (!u) return;
    document.getElementById('admin-edit-city').value = u.city || '';
    document.getElementById('admin-edit-photo-current').innerHTML = u.avatar_url
        ? `<img class="profile-photo" src="${u.avatar_url}" alt="${escapeHtml(u.username)}" style="filter:none;-webkit-filter:none;" />`
        : `<div class="admin-edit-photo-empty">Sin foto</div>`;
    forceColorPhotos();
}

// MÚSICA v7: carga con fetch+blob desde catbox (evita error 416)
function scheduleLiveRefresh() {
    if (liveRefreshTimer) clearTimeout(liveRefreshTimer);
    liveRefreshTimer = setTimeout(() => {
        liveRefreshTimer = null;
        updateAllViews();
    }, 350);
}
function initRealtime() {
    if (liveChannel) return;
    liveChannel = supabase.channel('feelow-hoopers-live')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'hoopers' }, scheduleLiveRefresh)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, scheduleLiveRefresh)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tournaments' }, scheduleLiveRefresh)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tournament_participants' }, scheduleLiveRefresh)
        .subscribe();
}

function initMusicPlayer() {
    const audio = document.getElementById('bgMusic');
    const toggle = document.getElementById('musicToggle');
    const mute = document.getElementById('musicMute');
    const progress = document.getElementById('musicProgress');
    const player = document.getElementById('musicPlayer');
    if (!audio || !toggle || !mute || !player) return;

    const iconPlay = toggle.querySelector('.music-icon-play');
    const iconPause = toggle.querySelector('.music-icon-pause');
    const iconSound = mute.querySelector('.music-icon-sound');
    const iconMuted = mute.querySelector('.music-icon-muted');

    audio.volume = 0.3;
    audio.muted = localStorage.getItem('feelow_music_muted') === 'true';
    if (audio.muted) {
        if (iconSound) iconSound.style.display = 'none';
        if (iconMuted) iconMuted.style.display = 'block';
    }

    let audioLoaded = false;
    let audioBlobUrl = null;
    let loadPromise = null;

    function showError(msg) {
        const existing = player.querySelector('.music-error');
        if (existing) existing.remove();
        const err = document.createElement('span');
        err.className = 'music-error';
        err.textContent = msg;
        player.appendChild(err);
        setTimeout(() => err.remove(), 6000);
    }

    async function loadAudioBlob() {
        if (audioLoaded && audioBlobUrl) return audioBlobUrl;
        if (loadPromise) return loadPromise;

        loadPromise = (async () => {
            try {
                const response = await fetch('https://files.catbox.moe/pn2l2l.mp3', {
                    method: 'GET',
                    cache: 'force-cache'
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const blob = await response.blob();
                if (blob.size < 5000) throw new Error(`Archivo demasiado pequeño (${blob.size} bytes). ¿Subido con Git LFS?`);
                if (!blob.type.includes('audio') && blob.type !== '') throw new Error(`Tipo incorrecto: ${blob.type}. ¿Es realmente un MP3?`);
                audioBlobUrl = URL.createObjectURL(blob);
                audioLoaded = true;
                audio.src = audioBlobUrl;
                return audioBlobUrl;
            } catch (e) {
                console.error('Error cargando audio:', e);
                throw e;
            }
        })();

        return loadPromise;
    }

    async function tryPlay() {
        try {
            await loadAudioBlob();
            await audio.play();
            if (iconPlay) iconPlay.style.display = 'none';
            if (iconPause) iconPause.style.display = 'block';
        } catch (e) {
            console.warn('No se pudo reproducir:', e);
            const msg = e.message || '';
            if (msg.includes('pequeño') || msg.includes('LFS')) showError('♪ MP3 corrupto o puntero LFS');
            else if (msg.includes('404')) showError('♪ MP3 no encontrado');
            else if (msg.includes('AbortError') || msg.includes('NotAllowed')) { /* normal */ }
            else showError('♪ Error al reproducir');
        }
    }

    const unlockAudio = async () => {
        if (audio.paused && !audio.muted) await tryPlay();
        window.removeEventListener('pointerdown', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio, { once: true });

    toggle.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (audio.paused) await tryPlay();
        else {
            audio.pause();
            if (iconPlay) iconPlay.style.display = 'block';
            if (iconPause) iconPause.style.display = 'none';
        }
    });

    mute.addEventListener('click', (e) => {
        e.stopPropagation();
        audio.muted = !audio.muted;
        localStorage.setItem('feelow_music_muted', audio.muted);
        if (iconSound) iconSound.style.display = audio.muted ? 'none' : 'block';
        if (iconMuted) iconMuted.style.display = audio.muted ? 'block' : 'none';
    });

    audio.addEventListener('timeupdate', () => {
        if (audio.duration && progress) progress.style.width = (audio.currentTime / audio.duration * 100) + '%';
    });

    audio.addEventListener('play', () => {
        if (iconPlay) iconPlay.style.display = 'none';
        if (iconPause) iconPause.style.display = 'block';
    });

    audio.addEventListener('pause', () => {
        if (iconPlay) iconPlay.style.display = 'block';
        if (iconPause) iconPause.style.display = 'none';
    });

    window.addEventListener('beforeunload', () => {
        if (audioBlobUrl) URL.revokeObjectURL(audioBlobUrl);
    });
}

// CURSOR GRIS con corrección de calibrado dentro del dialog
function initCursor() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const core = document.querySelector('.fh-cursor-core');
    const ring = document.querySelector('.fh-cursor-ring');
    if (!core || !ring) return;
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my, rx = mx, ry = my;
    let cursorFrame = 0;
    let lastMove = performance.now();
    window.addEventListener('pointermove', e => {
        mx = e.clientX; my = e.clientY;
        lastMove = performance.now();
        const el = document.elementFromPoint(mx, my);
        const interactive = el && el.closest('a, button, select, input, label, .ranking-row, .street-badge, .profile-badge-chip, .info-tooltip');
        ring.classList.toggle('is-active', !!interactive);
        if (!cursorFrame) cursorFrame = requestAnimationFrame(loop);
    }, { passive: true });
    function loop(now = performance.now()) {
        cursorFrame = 0;
        cx += (mx - cx) * 0.35; cy += (my - cy) * 0.35;
        rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
        let ox = 0, oy = 0;
        if (core.parentElement && core.parentElement.tagName === 'DIALOG') {
            const r = core.parentElement.getBoundingClientRect();
            ox = r.left; oy = r.top;
        }
        core.style.left = (cx - ox) + 'px'; core.style.top = (cy - oy) + 'px';
        ring.style.left = (rx - ox) + 'px'; ring.style.top = (ry - oy) + 'px';
        const moving = now - lastMove < 260 || Math.abs(mx - cx) > 0.5 || Math.abs(my - cy) > 0.5;
        if (moving) cursorFrame = requestAnimationFrame(loop);
    }
    loop();
}

// LIGHTBOX: ampliar cualquier foto al hacer clic
function initLightbox() {
    const lb = document.getElementById('photo-lightbox');
    const lbImg = document.getElementById('lightbox-img');
    if (!lb || !lbImg) return;

    document.addEventListener('click', (e) => {
        const img = e.target.closest('.ranking-photo, .profile-photo, .spotlight-photo, .profile-modal-photo');
        if (!img) return;
        e.preventDefault();
        e.stopPropagation();
        lbImg.src = img.currentSrc || img.src;
        lbImg.alt = img.alt || 'Foto ampliada';
        if (typeof lb.showModal === 'function') {
            if (lb.open) lb.close();
            lb.showModal();
        } else {
            lb.setAttribute('open', '');
        }
        const core = document.querySelector('.fh-cursor-core');
        const ring = document.querySelector('.fh-cursor-ring');
        if (core && ring) { lb.appendChild(core); lb.appendChild(ring); }
    }, true);

    lb.addEventListener('close', () => {
        const core = document.querySelector('.fh-cursor-core');
        const ring = document.querySelector('.fh-cursor-ring');
        const profileModal = document.getElementById('profile-modal');
        const dest = (profileModal && profileModal.open) ? profileModal : document.body;
        if (core && ring) { dest.appendChild(core); dest.appendChild(ring); }
    });

    lb.addEventListener('click', () => { if (lb.open) lb.close(); });
}

function init() {
    setupPhotoPreview('register-photo', 'register-photo-preview');
    setupPhotoPreview('edit-self-photo', 'edit-self-photo-preview');
    setupPhotoPreview('admin-edit-photo', 'admin-edit-photo-preview');

    document.getElementById('register-form')?.addEventListener('submit', handleRegister);
    document.getElementById('login-form')?.addEventListener('submit', handleLogin);
    document.getElementById('forgot-password-btn')?.addEventListener('click', () => {
        const form = document.getElementById('password-recovery-form');
        if (!form) return;
        form.classList.toggle('hidden');
        const email = document.getElementById('login-email')?.value.trim();
        if (email) document.getElementById('recovery-email').value = email;
    });
    document.getElementById('password-recovery-form')?.addEventListener('submit', handlePasswordRecovery);
    document.getElementById('password-update-form')?.addEventListener('submit', handlePasswordUpdate);
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
    document.getElementById('delete-account-btn')?.addEventListener('click', handleDeleteAccount);
    document.getElementById('edit-self-form')?.addEventListener('submit', handleEditSelf);

    document.getElementById('admin-stats-form')?.addEventListener('submit', handleAdminStats);
    document.getElementById('admin-edit-form')?.addEventListener('submit', handleAdminEdit);
    document.getElementById('admin-delete-form')?.addEventListener('submit', handleAdminDelete);
    document.getElementById('admin-match-form')?.addEventListener('submit', handleAdminMatch);
    document.getElementById('admin-badge-grant')?.addEventListener('click', () => handleBadge('grant'));
    document.getElementById('admin-badge-revoke')?.addEventListener('click', () => handleBadge('revoke'));
    document.getElementById('admin-edit-user-select')?.addEventListener('change', loadEditUser);
    document.getElementById('admin-user-select')?.addEventListener('change', loadAdminStats);
    document.getElementById('admin-badge-user')?.addEventListener('change', updateBadgeAssignment);
    document.getElementById('admin-badge-select')?.addEventListener('change', updateBadgePreview);
    document.getElementById('tournament-cup-select')?.addEventListener('change', updateCupPreview);
    document.getElementById('tournament-close-select')?.addEventListener('change', loadTournamentParticipants);
    document.getElementById('tournament-create-form')?.addEventListener('submit', handleCreateTournament);
    document.getElementById('tournament-generate-bracket')?.addEventListener('click', handleGenerateBracket);
    document.getElementById('tournament-add-btn')?.addEventListener('click', handleAddParticipant);
    document.getElementById('tournament-remove-btn')?.addEventListener('click', handleRemoveParticipant);
    document.getElementById('tournament-close-form')?.addEventListener('submit', handleCloseTournament);

    document.getElementById('profile-modal-close')?.addEventListener('click', closeProfileModal);
    const modal = document.getElementById('profile-modal');
    if (modal) modal.addEventListener('click', e => { if (e.target === modal) closeProfileModal(); });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            const lb = document.getElementById('photo-lightbox');
            if (lb && lb.open) return;
            closeProfileModal();
        }
    });

    initMusicPlayer();
    initCursor();
    initLightbox();
    document.querySelectorAll('.info-tooltip').forEach(tip => {
        tip.tabIndex = 0;
        tip.setAttribute('role', 'img');
        tip.setAttribute('aria-label', tip.dataset.tooltip || 'Información');
    });
    supabase.auth.onAuthStateChange((event) => {
        invalidateCurrentUser();
        if (event === 'PASSWORD_RECOVERY') setPasswordRecoveryMode(true);
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
            setTimeout(() => updateAllViews(), 0);
        }
    });
    initRealtime();
    window.addEventListener('beforeunload', () => {
        if (liveChannel) supabase.removeChannel(liveChannel);
    });
    updateAllViews();
}
init();
