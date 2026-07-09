/* =========================================================
   FEELOW HOOPERS — Registro de jugadores (Leo Feelow · 5PM)
   ---------------------------------------------------------
   Mini-aplicación de frontend puro (localStorage) + escena
   3D del balón de hormigón como fondo del Hero.

   Estética estricta de Leo: SOLO escala de grises, negro
   profundo, blanco y asfalto. Cero colores vivos. El único
   acento permitido es una pátina ocre/oro viejo (#c28a35),
   reservada en exclusiva a la élite absoluta (The Kings).

   MÉTRICAS DE LA CALLE
   ----------------------------------------------------------------
   No existe "Derrotas". En su lugar: Juego Único (JU) =
   partidos donde el hooper demostró estilo salvaje, movimientos
   locos o puro respeto, más allá del marcador.

   REP es AUTOMÁTICA (nadie la edita a mano):
       REP = 1000 + (W × 30) + (JU × 15) + (Insignias × 50)

   MODELO DE DATOS
   ----------------------------------------------------------------
   users: [{
     id, username, password, city, photo,
     wins, losses(legacy), uniqueGames, tournaments, matches,
     rep, streak,                          // ← Reputación + racha
     joinedAt, badges: [string]
   }]
   events: [{
     id, name, status: 'open'|'closed', winner: username|null,
     participants: [username], createdAt, closedAt: iso|null
   }]
   ----------------------------------------------------------------
   ========================================================= */

const STORAGE_KEY = 'feelow-hoopers-users';
const CURRENT_KEY = 'feelow-hoopers-current-user';
const EVENTS_KEY  = 'feelow-hoopers-events';

const DEFAULT_ADMIN          = 'LeoFeelow';
const DEFAULT_ADMIN_PASSWORD = 'pecadomusical';

const MIN_USERNAME_LEN = 3;
const MIN_PASSWORD_LEN = 4;
const PHOTO_MAX_BYTES  = 420_000;   // tope de un dataURL en localStorage (~0.4MB)
const PHOTO_TARGET_PX  = 256;       // lado máx. del thumbnail tras compresión

/* ---------- Fórmula de reputación (respeto callejero) ---------- */
const REP_BASE      = 1000;          // todo hooper inicia con 1000 REP
const REP_PER_WIN   = 30;            // cada Victoria suma +30 REP
const REP_PER_JU    = 15;            // cada Juego Único suma +15 REP
const REP_PER_MATCH = 4;             // jugar partidos da respeto base, aunque menos que ganar
const REP_PER_LOSS  = 6;             // las derrotas cortan el impulso si se acumulan
const REP_PER_BADGE = 45;           // valor base para insignias desconocidas
const STREAK_FIRE   = 3;             // a partir de aquí se muestra 💨 xN

const BADGE_REP_VALUES = {
    'CIMIENTOS': 55,
    'SANGRE NUEVA': 40,
    'DUEÑO DE LA PISTA': 80,
    'ROMPE-ÍDOLOS': 75,
    'LEYENDA': 100,
    '1V1 INCOMBATIBLE': 70,
    'CLUTCH': 60,
    'RACHA DE FUEGO': 65,
    'CAMPEÓN DE TORNEO': 85,
    'MVP DE LA CALLE': 90,
};

const TIERS = {
    kings:    { label: 'The Kings',    cls: 'tier-kings',    accent: '#c28a35' }, // oro viejo desgastado
    hustlers: { label: 'The Hustlers', cls: 'tier-hustlers', accent: '#d8d8d8' }, // acero cepillado
    asphalt:  { label: 'The Asphalt',  cls: 'tier-asphalt',  accent: '#a7a7a2' }, // hormigón poroso
};

/* ---------- Tiers urbanos por POSICIÓN (estatus callejero) ----------
   Top 1-3     = The Kings    (único acento ocre/oro viejo permitido)
   Puestos 4-50 = The Hustlers (acero industrial cepillado)
   Puestos 51+  = The Asphalt  (hormigón poroso crudo)                       */
function tierByPosition(position) {
    if (position <= 3)  return TIERS.kings;
    if (position <= 50) return TIERS.hustlers;
    return TIERS.asphalt;
}

/* Alias para calcular el tier por posición de un usuario concreto. */
function tierByRank(rank) {
    return tierByPosition(rank);
}

/* ---------- Badges (lore callejero · medallas octogonales) ---------- */
const BADGE_META = {
    'CIMIENTOS':         { emoji: '🧱', cls: 'badge-founder',   title: 'CIMIENTOS',         description: 'Una insignia de origen: la que reconoce a quien abrió la puerta y dejó la primera huella en la calle.' },
    'SANGRE NUEVA':      { emoji: '⚡', cls: 'badge-first',     title: 'SANGRE NUEVA',      description: 'Para quien llegó con hambre, sin permiso y con la intención de hacerse notar desde el primer día.' },
    'DUEÑO DE LA PISTA': { emoji: '👑', cls: 'badge-champion',  title: 'DUEÑO DE LA PISTA', description: 'Se reconoce a quien entra en la cancha y hace que el juego se incline a su ritmo.' },
    'ROMPE-ÍDOLOS':      { emoji: '💀', cls: 'badge-leo',       title: 'ROMPE-ÍDOLOS',      description: 'Para el hooper que no se inclina ante la figura, el nombre ni la presión del momento.' },
    'LEYENDA':           { emoji: '🕯️', cls: 'badge-legend',    title: 'LEYENDA',           description: 'La marca de quien ya no solo juega: se vuelve parte del relato de las noches y del barrio.' },
    '1V1 INCOMBATIBLE':  { emoji: '🏀', cls: 'badge-ones',      title: '1V1 INCOMBATIBLE',  description: 'Reconoce la lectura, la distancia y la precisión de quien corta la salida antes de que el juego respire.' },
    'CLUTCH':            { emoji: '⏱️', cls: 'badge-clutch',    title: 'CLUTCH',            description: 'Para el instante exacto en el que una decisión cambia el partido y deja el silencio en la pista.' },
    'RACHA DE FUEGO':    { emoji: '🔥', cls: 'badge-streak',    title: 'RACHA DE FUEGO',    description: 'Una recompensa para quien no se detiene, y convierte cada aparición en una amenaza real.' },
    'CAMPEÓN DE TORNEO': { emoji: '🏆', cls: 'badge-tournament', title: 'CAMPEÓN DE TORNEO', description: 'Se otorga a quien cerró el torneo con autoridad, presencia y la última palabra en la noche.' },
    'MVP DE LA CALLE':   { emoji: '⭐', cls: 'badge-mvp',       title: 'MVP DE LA CALLE',   description: 'La insignia de quien pesa en los momentos difíciles y deja la cancha más viva que cuando entró.' },
};

/* Alias legacy → nuevos títulos (para migrar cuentas antiguas sin perder insignias). */
const BADGE_ALIASES = {
    'Participante fundador': 'CIMIENTOS',
    'Primer Hooper':         'SANGRE NUEVA',
    'Campeón del torneo':    'CAMPEÓN DE TORNEO',
    'Derrotó a Leo':         'ROMPE-ÍDOLOS',
    'Leyenda':               'LEYENDA',
    'MVP':                   'MVP DE LA CALLE',
    'Racha de fuego':        'RACHA DE FUEGO',
};

/* ---------- Persistencia ---------- */

function loadUsers() {
    let raw = localStorage.getItem(STORAGE_KEY);
    let users;

    if (!raw) {
        // Seed inicial. El admin canónico se garantiza en ensureAdminUser().
        users = [
            { id: 2, username: 'Rook', password: 'rook1234', city: 'Barcelona', photo: '', wins: 9, losses: 0, uniqueGames: 3, tournaments: 2, matches: 16, joinedAt: '2026-06-02', badges: ['CIMIENTOS'] }
        ];
    } else {
        try { users = JSON.parse(raw); }
        catch { users = []; }
    }

    users = migrateUsers(users);
    ensureAdminUser(users);
    recomputeAllRep(users);   // REP siempre automatizada al cargar
    saveUsers(users);
    return users;
}

// Rellena campos nuevos en usuarios antiguos para no perder datos.
// Migración: 'losses' legacy → se descarta (ya no existe la métrica),
// introduce 'uniqueGames' (JU) y renombra insignias con el nuevo lore.
function migrateUsers(users) {
    if (!Array.isArray(users)) return [];

    // Migración de la seed antigua: 'Leo' → 'LeoFeelow' (admin canónico).
    users.forEach((u) => {
        if (u.username === 'Leo' && !users.some((x) => x.username === DEFAULT_ADMIN)) {
            u.username = DEFAULT_ADMIN;
            u.password = DEFAULT_ADMIN_PASSWORD;
        }
    });

    users.forEach((u) => {
        if (typeof u.password    !== 'string') u.password    = '';
        if (typeof u.tournaments !== 'number') u.tournaments = 0;
        if (typeof u.matches     !== 'number') u.matches     = 0;
        if (typeof u.wins        !== 'number') u.wins        = 0;
        // 'losses' ya no se usa como métrica activa, pero se conserva por compat.
        if (typeof u.losses      !== 'number') u.losses      = 0;
        // NUEVO: Juego Único (JU).
        if (typeof u.uniqueGames !== 'number') u.uniqueGames = 0;
        if (typeof u.streak      !== 'number') u.streak      = 0;
        if (!Array.isArray(u.badges)) u.badges = [];

        if (typeof u.photo    !== 'string') u.photo    = '';
        if (typeof u.city     !== 'string') u.city     = '';
        if (typeof u.joinedAt !== 'string') u.joinedAt = new Date().toISOString();

        // Migrar insignias legacy a los nuevos títulos del lore callejero.
        u.badges = u.badges.map((b) => BADGE_ALIASES[b] || b);

        // 'rep' se recalcula siempre en recomputeAllRep(); aquí solo saneamos.
        if (typeof u.rep !== 'number') u.rep = REP_BASE;
    });
    return users;
}

// Garantiza que el admin canónico siempre exista como hooper real.
function ensureAdminUser(users) {
    const idx = users.findIndex((u) => u.username === DEFAULT_ADMIN);
    if (idx === -1) {
        users.unshift({
            id: 1,
            username: DEFAULT_ADMIN,
            password: DEFAULT_ADMIN_PASSWORD,
            city: 'Madrid',
            photo: '',
            wins: 12, losses: 0, uniqueGames: 4, tournaments: 3, matches: 16,
            rep: REP_BASE, streak: 0,
            joinedAt: '2026-06-01',
            badges: ['CIMIENTOS', 'SANGRE NUEVA', 'DUEÑO DE LA PISTA', 'LEYENDA']
        });
    } else {
        // Refuerza credenciales por si una versión vieja las vació.
        users[idx].password = DEFAULT_ADMIN_PASSWORD;
    }
}

/* ---------- REP automatizada (respeto callejero) ---------- */
// Calcula la reputación de un hooper en base exclusivamente a sus
// estadísticas: victorias, juegos únicos e insignias. Nunca se
// persiste un valor escrito a mano.
function getBadgeRepValue(badge) {
    return BADGE_REP_VALUES[badge] || REP_PER_BADGE;
}

function computeRep(user) {
    const wins   = Math.max(0, user.wins || 0);
    const ju     = Math.max(0, user.uniqueGames || 0);
    const matches = Math.max(0, user.matches || 0);
    const losses = Math.max(0, user.losses || 0);
    const badgeRep = Array.isArray(user.badges)
        ? user.badges.reduce((sum, badge) => sum + getBadgeRepValue(badge), 0)
        : 0;
    return Math.max(0, REP_BASE + wins * REP_PER_WIN + ju * REP_PER_JU + matches * REP_PER_MATCH + badgeRep - losses * REP_PER_LOSS);
}

// Recalcula y asigna la REP de todos los usuarios en una pasada.
function recomputeAllRep(users) {
    users.forEach((u) => { u.rep = computeRep(u); });
}

function saveUsers(users) { localStorage.setItem(STORAGE_KEY, JSON.stringify(users)); }

function getCurrentUser()  { return localStorage.getItem(CURRENT_KEY); }
function setCurrentUser(u) { localStorage.setItem(CURRENT_KEY, u); }
function clearCurrentUser(){ localStorage.removeItem(CURRENT_KEY); }


/* ---------- Torneos / Eventos ---------- */

function loadEvents() {
    const raw = localStorage.getItem(EVENTS_KEY);
    if (!raw) return [];
    try { return migrateEvents(JSON.parse(raw)); }
    catch { return []; }
}

function saveEvents(events) { localStorage.setItem(EVENTS_KEY, JSON.stringify(events)); }

function migrateEvents(events) {
    if (!Array.isArray(events)) return [];
    events.forEach((e) => {
        if (typeof e.name        !== 'string') e.name        = 'Torneo sin nombre';
        if (!Array.isArray(e.participants))   e.participants = [];
        if (e.status !== 'open' && e.status !== 'closed') e.status = 'open';
        if (e.winner !== null && typeof e.winner !== 'string') e.winner = null;
        if (typeof e.createdAt !== 'string') e.createdAt = new Date().toISOString();
        if (e.closedAt !== null && typeof e.closedAt !== 'string') e.closedAt = null;
        if (typeof e.id !== 'number') e.id = Date.now() + Math.floor(Math.random() * 1000);
    });
    return events;
}


/* ---------- Tiers / Racha ---------- */

// Aplica un enfrentamiento (ganador vs perdedor). Como ya no hay ELO,
// solo se actualizan W, partidos jugados, racha y (opcionalmente) JU.
// La REP se recalcula automáticamente vía computeRep().
// Devuelve el delta de REP aplicado al ganador.
function applyMatch(winner, loser, opts = {}) {
    const repWBefore = winner.rep;

    winner.wins   += 1;
    winner.matches = (winner.matches || 0) + 1;
    loser.matches  = (loser.matches  || 0) + 1;
    loser.losses   = (loser.losses   || 0) + 1;

    // Juego Único (JU): bandera de estilo salvaje, independiente del marcador.
    if (opts.winnerUnique) winner.uniqueGames = (winner.uniqueGames || 0) + 1;
    if (opts.loserUnique)  loser.uniqueGames  = (loser.uniqueGames  || 0) + 1;

    winner.streak = (winner.streak || 0) >= 0 ? winner.streak + 1 : 1;
    loser.streak  = 0;

    winner.rep = computeRep(winner);
    loser.rep  = computeRep(loser);

    return winner.rep - repWBefore;
}

// Racha legible: 💨 xN a partir de STREAK_FIRE; "—" si está en cero.
function streakLabel(streak) {
    if (!streak || streak <= 0) return '<span class="streak-cold">—</span>';
    if (streak >= STREAK_FIRE)  return `<span class="streak-hot">💨 x${streak}</span>`;
    return `<span class="streak-warm">${streak}</span>`;
}


/* ---------- Utilidades ---------- */

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (ch) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
    ));
}

function getBadgeMeta(badge) {
    return BADGE_META[badge] || { emoji: '·', cls: 'badge-custom', title: badge, description: 'Insignia especial para quien deja marca en la pista.' };
}

function formatDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
}

function sortUsers(users) {
    return [...users].sort((a, b) => {
        const diff = (b.rep || 0) - (a.rep || 0);
        if (diff !== 0) return diff;
        if (b.wins !== a.wins) return b.wins - a.wins;
        return a.username.localeCompare(b.username);
    });
}

function validUsername(username) {
    return typeof username === 'string'
        && username.length >= MIN_USERNAME_LEN
        && !/\s/.test(username);
}

function validPassword(password) {
    return typeof password === 'string' && password.length >= MIN_PASSWORD_LEN;
}

function isAdmin() {
    return getCurrentUser() === DEFAULT_ADMIN;
}


/* ---------- Avatar por defecto ---------- */

function getDefaultAvatar() {
    const svg = `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" fill="#111111"/>
            <circle cx="50" cy="50" r="38" fill="none" stroke="#3a3a3a" stroke-width="2"/>
            <path d="M 12 50 Q 50 68 88 50" fill="none" stroke="#3a3a3a" stroke-width="2"/>
            <path d="M 50 12 Q 32 50 50 88" fill="none" stroke="#3a3a3a" stroke-width="2"/>
            <path d="M 22 22 Q 50 40 78 22" fill="none" stroke="#3a3a3a" stroke-width="1.5"/>
            <path d="M 22 78 Q 50 60 78 78" fill="none" stroke="#3a3a3a" stroke-width="1.5"/>
        </svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function getPhotoElement(user, className) {
    const photo = user.photo || getDefaultAvatar();
    return `<img class="${className}" src="${photo}" alt="${escapeHtml(user.username)}" loading="lazy" />`;
}


/* ---------- Compresión de fotos ---------- */

async function getCompressedPhoto(file) {
    if (!file) return '';
    if (!file.type.startsWith('image/')) {
        throw new Error('El archivo no es una imagen válida.');
    }
    const dataUrl = await readAsDataUrl(file);
    try { return await downscale(dataUrl); }
    catch { return dataUrl; }
}

function readAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
        reader.readAsDataURL(file);
    });
}

function downscale(dataUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const scale = Math.min(1, PHOTO_TARGET_PX / Math.max(img.width, img.height));
            const w = Math.max(1, Math.round(img.width  * scale));
            const h = Math.max(1, Math.round(img.height * scale));
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = () => reject(new Error('La imagen está corrupta o no se pudo procesar.'));
        img.src = dataUrl;
    });
}


/* ---------- Feedback ---------- */

let feedbackTimer = null;

function showFeedback(message, type = 'ok') {
    const el = document.getElementById('feedback');
    if (!el) { window.alert(message); return; }
    el.textContent = message;
    el.className = `feelow-feedback is-visible ${type}`;
    el.setAttribute('role', type === 'error' ? 'alert' : 'status');
    if (feedbackTimer) clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => { el.classList.remove('is-visible'); }, 4200);
}


/* ---------- Render: Ranking (con REP, racha y filas clickeables) ---------- */

function updateRanking() {
    const users = sortUsers(loadUsers());
    const tbody = document.getElementById('ranking-body');
    tbody.innerHTML = '';

    if (!users.length) {
        tbody.innerHTML = `<tr><td colspan="6" class="ranking-empty">Aún no hay hoopers registrados</td></tr>`;
        return;
    }

    users.forEach((user, index) => {
        const position = index + 1;
        const positionLabel = position < 10 ? `0${position}` : String(position);
        // Tier por posición (estatus callejero), no por valor de REP.
        const tier = tierByPosition(position);

        const row = document.createElement('tr');
        row.classList.add('ranking-row');
        row.dataset.username = user.username;   // ← dato canónico para el modal
        row.classList.add(tier.cls);
        // El título accesible refuerza a qué hooper abre la placa.
        row.setAttribute('title', `Abrir placa de ${user.username}`);

        row.innerHTML = `
            <td><span class="rank-position">${positionLabel}</span></td>
            <td>
                <div class="rank-photo-cell">
                    ${getPhotoElement(user, 'ranking-photo')}
                    <span class="rank-name">${escapeHtml(user.username)}</span>
                </div>
            </td>
            <td>${user.wins}</td>
            <td class="ju-cell">${user.uniqueGames || 0}</td>
            <td>${user.matches || 0}</td>
            <td>${user.losses || 0}</td>
            <td><span class="score-cell">${user.rep || 0}</span></td>
            <td class="streak-cell">${streakLabel(user.streak || 0)}</td>
        `;

        // BUGFIX: capturamos el username EXACTO de la fila (no del usuario
        // logueado) y abrimos el modal contra ese dato. Evita que el modal
        // pinte siempre los datos del usuario en sesión.
        row.addEventListener('click', () => {
            const targetUsername = row.dataset.username;
            if (targetUsername) openProfileModal(targetUsername);
        });
        tbody.appendChild(row);
    });
}


/* ---------- Render: Perfil (sidebar) ---------- */

// Calcula el tier por posición de un usuario concreto dentro del ranking.
function tierOfUser(user, allUsers) {
    const sorted = sortUsers(allUsers);
    const pos = sorted.findIndex((u) => u.username === user.username) + 1;
    return tierByPosition(pos || 999);
}

function renderProfile() {
    const profileView = document.getElementById('profile-view');
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const users = loadUsers();
    const user = users.find((entry) => entry.username === currentUser);

    if (!user) {
        clearCurrentUser();
        return;
    }

    const tier = tierOfUser(user, users);
    const badgesHtml = (user.badges && user.badges.length)
        ? user.badges.map((b) => {
            const meta = getBadgeMeta(b);
            return `<button type="button" class="profile-badge-chip ${meta.cls}" data-badge="${escapeHtml(b)}" title="${escapeHtml(meta.title || b)}"><span class="profile-badge-emoji">${escapeHtml(meta.emoji || '·')}</span><span class="profile-badge-label">${escapeHtml(meta.title || b)}</span></button>`;
        }).join('')
        : '<span class="is-empty">Sin insignias</span>';

    profileView.innerHTML = `
        <div class="profile-card">
            ${getPhotoElement(user, 'profile-photo')}
            <div>
                <h3>${escapeHtml(user.username)}</h3>
                <p>${user.city ? escapeHtml(user.city) : 'Ubicación desconocida'}</p>
                <p>Registro · ${formatDate(user.joinedAt)}</p>
                <p class="profile-rep-line"><strong>${user.rep || 0}</strong> REP · <span class="profile-tier-tag ${tier.cls}">${tier.label}</span></p>
            </div>
        </div>
        <div class="profile-stats">
            <div><span>Torneos</span><strong>${user.tournaments || 0}</strong></div>
            <div><span>Partidos</span><strong>${user.matches || 0}</strong></div>
            <div><span>Victorias</span><strong>${user.wins}</strong></div>
            <div><span>Juego Único</span><strong>${user.uniqueGames || 0}</strong></div>
        </div>
        <div class="profile-badges">${badgesHtml}</div>
        <div id="profile-badge-detail" class="badge-detail-card">Pulsa una insignia para ver su significado y el motivo de la recompensa.</div>
    `;

    profileView.querySelectorAll('.profile-badge-chip').forEach((button) => {
        button.addEventListener('click', () => {
            const badge = button.dataset.badge;
            const meta = getBadgeMeta(badge);
            const detail = profileView.querySelector('#profile-badge-detail');
            if (detail) {
                detail.innerHTML = `<strong>${escapeHtml(meta.title || badge)}</strong><span>${escapeHtml(meta.description || 'Insignia especial del registro de hoopers.')}</span>`;
            }
        });
    });
}


/* ---------- Render: Torneos ---------- */

function renderTournaments() {
    const list = document.getElementById('tournaments-list');
    if (!list) return;

    const events = loadEvents();
    list.innerHTML = '';

    if (!events.length) {
        list.innerHTML = `<div class="tournament-empty">No hay torneos registrados todavía.</div>`;
        return;
    }

    // Orden: abiertos primero, luego por creación desc.
    const sorted = [...events].sort((a, b) => {
        if (a.status !== b.status) return a.status === 'open' ? -1 : 1;
        return (b.createdAt || '').localeCompare(a.createdAt || '');
    });

    sorted.forEach((ev) => {
        const card = document.createElement('article');
        card.className = `tournament-card is-${ev.status}`;
        card.innerHTML = `
            <header class="tournament-head">
                <div>
                    <span class="tournament-status ${ev.status}">${ev.status === 'open' ? 'En curso' : 'Cerrado'}</span>
                    <h3>${escapeHtml(ev.name)}</h3>
                    <p class="tournament-date">Iniciado · ${formatDate(ev.createdAt)}</p>
                    ${ev.closedAt ? `<p class="tournament-date">Cerrado · ${formatDate(ev.closedAt)}</p>` : ''}
                </div>
                ${ev.winner ? `<div class="tournament-winner">Campeón<div class="tournament-winner-name">${escapeHtml(ev.winner)}</div></div>` : ''}
            </header>
            <div class="tournament-participants">
                ${ev.participants.length
                    ? ev.participants.map((p) => `<span>${escapeHtml(p)}</span>`).join('')
                    : '<span class="muted">Sin participantes</span>'}
            </div>
        `;
        list.appendChild(card);
    });
}


/* ---------- Render: Selects admin ---------- */

function buildUserOptions(excludeUsername = null) {
    const users = loadUsers();
    return users
        .filter((u) => u.username !== excludeUsername)
        .map((u) => `<option value="${escapeHtml(u.username)}">${escapeHtml(u.username)}</option>`)
        .join('');
}

function updateBadgePreview() {
    const select = document.getElementById('admin-badge-select');
    const icon = document.getElementById('admin-badge-preview-icon');
    const title = document.getElementById('admin-badge-preview-title');
    const text = document.getElementById('admin-badge-preview-text');
    if (!select || !icon || !title || !text) return;

    const badge = select.value;
    const meta = getBadgeMeta(badge);
    icon.textContent = meta.emoji || '🏀';
    title.textContent = meta.title || badge;
    text.textContent = meta.description || 'Insignia especial del registro de hoopers.';
}

function updateAdminSelects() {
    const userOptions = buildUserOptions();

    ['admin-user-select', 'admin-edit-user-select', 'admin-badge-user', 'admin-delete-select', 'tournament-add-user'].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerHTML = userOptions
            ? userOptions
            : '<option disabled>— Sin hoopers —</option>';
    });

    // Selects de Enfrentamiento: ganador/perdedor con todos los hoopers.
    ['admin-match-winner', 'admin-match-loser'].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const all = loadUsers().map((u) => `<option value="${escapeHtml(u.username)}">${escapeHtml(u.username)}</option>`).join('');
        el.innerHTML = all || '<option disabled>— Sin hoopers —</option>';
    });

    updateBadgePreview();
}


/* ---------- Render: Visibilidad ---------- */

function showAdminPanel() {
    const adminPanel = document.getElementById('admin-panel');
    if (!adminPanel) return;
    adminPanel.classList.toggle('hidden', !isAdmin());
}

function toggleAuthViews() {
    const current      = getCurrentUser();
    const authPanel    = document.querySelector('.auth-panel');
    const profilePanel = document.getElementById('user-profile');
    if (!authPanel || !profilePanel) return;

    if (current) {
        authPanel.classList.add('hidden');
        profilePanel.classList.remove('hidden');
    } else {
        authPanel.classList.remove('hidden');
        profilePanel.classList.add('hidden');
    }
}


/* ---------- Handlers: Auth ---------- */

async function handleRegister(event) {
    event.preventDefault();
    const form = event.target;

    const username  = document.getElementById('register-username').value.trim();
    const password  = document.getElementById('register-password').value;
    const city      = document.getElementById('register-city').value.trim();
    const photoFile = document.getElementById('register-photo').files[0];

    if (!validUsername(username)) {
        showFeedback(`El usuario debe tener al menos ${MIN_USERNAME_LEN} caracteres y sin espacios.`, 'error');
        return;
    }
    if (!validPassword(password)) {
        showFeedback(`La contraseña debe tener al menos ${MIN_PASSWORD_LEN} caracteres.`, 'error');
        return;
    }

    const users = loadUsers();
    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
        showFeedback('Ese usuario ya existe.', 'error');
        return;
    }

    let photo = '';
    if (photoFile) {
        try { photo = await getCompressedPhoto(photoFile); }
        catch (err) { showFeedback(err.message || 'No se pudo procesar la foto.', 'error'); return; }
    }

    users.push({
        id: Date.now(), username, password, city, photo,
        wins: 0, losses: 0, uniqueGames: 0, tournaments: 0, matches: 0,
        rep: REP_BASE, streak: 0,
        joinedAt: new Date().toISOString(), badges: []
    });
    saveUsers(users);
    setCurrentUser(username);

    form.reset();
    showFeedback(`Bienvenido, ${username}.`, 'ok');
    updateAllViews();
}

function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    if (!username || !password) return;

    if (username === DEFAULT_ADMIN && password === DEFAULT_ADMIN_PASSWORD) {
        setCurrentUser(DEFAULT_ADMIN);
        document.getElementById('login-form').reset();
        showFeedback('Sesión de administración iniciada.', 'ok');
        updateAllViews();
        return;
    }

    const users = loadUsers();
    const found = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
    if (!found) { showFeedback('No existe ese participante.', 'error'); return; }
    if (!found.password || found.password !== password) {
        showFeedback('Contraseña incorrecta.', 'error');
        return;
    }

    setCurrentUser(found.username);
    document.getElementById('login-form').reset();
    showFeedback(`Hola de nuevo, ${found.username}.`, 'ok');
    updateAllViews();
}

function handleLogout() {
    clearCurrentUser();
    showFeedback('Sesión cerrada.', 'ok');
    updateAllViews();
}


/* ---------- Handlers: Admin usuarios ---------- */

async function handleAdminCreate(event) {
    event.preventDefault();
    const form = event.target;

    const username  = document.getElementById('admin-create-username').value.trim();
    const password  = document.getElementById('admin-create-password').value;
    const city      = document.getElementById('admin-create-city').value.trim();
    const photoFile = document.getElementById('admin-create-photo').files[0];

    if (!validUsername(username)) {
        showFeedback(`El usuario debe tener al menos ${MIN_USERNAME_LEN} caracteres y sin espacios.`, 'error');
        return;
    }
    if (!validPassword(password)) {
        showFeedback(`La contraseña debe tener al menos ${MIN_PASSWORD_LEN} caracteres.`, 'error');
        return;
    }

    const users = loadUsers();
    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
        showFeedback('Ese usuario ya existe.', 'error');
        return;
    }

    let photo = '';
    if (photoFile) {
        try { photo = await getCompressedPhoto(photoFile); }
        catch (err) { showFeedback(err.message || 'No se pudo procesar la foto.', 'error'); return; }
    }

    users.push({
        id: Date.now(), username, password, city, photo,
        wins: 0, losses: 0, uniqueGames: 0, tournaments: 0, matches: 0,
        rep: REP_BASE, streak: 0,
        joinedAt: new Date().toISOString(), badges: []
    });
    saveUsers(users);

    form.reset();
    showFeedback(`${username} añadido al registro.`, 'ok');
    updateAllViews();
}

function handleAdminStats(event) {
    event.preventDefault();

    const username    = document.getElementById('admin-user-select').value;
    const wins        = Math.max(0, Number(document.getElementById('admin-wins').value || 0));
    const uniqueGames = Math.max(0, Number(document.getElementById('admin-unique-games').value || 0));
    const tournaments = Math.max(0, Number(document.getElementById('admin-tournaments').value || 0));
    const matches     = Math.max(0, Number(document.getElementById('admin-matches').value || 0));

    if (!username) { showFeedback('Selecciona un hooper.', 'error'); return; }

    const users = loadUsers();
    const target = users.find((u) => u.username === username);
    if (!target) return;

    target.wins        = wins;
    target.uniqueGames = uniqueGames;
    target.tournaments = tournaments;
    target.matches     = matches;
    // REP nunca se edita a mano: se deriva de W + JU + Insignias.
    target.rep = computeRep(target);
    saveUsers(users);

    showFeedback(`Stats de ${username} actualizadas. REP recalculada: ${target.rep}.`, 'ok');
    updateAllViews();
}

// Registrar Enfrentamiento: aplica W + (opcional) JU a ganador y perdedor.
// La REP se recalcula automáticamente vía applyMatch().
function handleAdminMatch(event) {
    event.preventDefault();
    if (!isAdmin()) return;

    const winnerName = document.getElementById('admin-match-winner').value;
    const loserName  = document.getElementById('admin-match-loser').value;

    if (!winnerName || !loserName) {
        showFeedback('Selecciona ganador y perdedor.', 'error'); return;
    }
    if (winnerName === loserName) {
        showFeedback('Ganador y perdedor deben ser distintos.', 'error'); return;
    }

    const users = loadUsers();
    const winner = users.find((u) => u.username === winnerName);
    const loser  = users.find((u) => u.username === loserName);
    if (!winner || !loser) return;

    // Juego Único (JU): partidos salvajes, independiente del marcador.
    const winnerUnique = document.getElementById('admin-match-unique-winner')?.checked || false;
    const loserUnique  = document.getElementById('admin-match-unique-loser')?.checked  || false;

    const repWBefore = winner.rep;
    const repLBefore = loser.rep;
    applyMatch(winner, loser, { winnerUnique, loserUnique });
    const deltaW = winner.rep - repWBefore;
    const deltaL = loser.rep  - repLBefore;

    // Insignia especial: si el perdedor era Leo → ROMPE-ÍDOLOS.
    if (loserName === DEFAULT_ADMIN && !winner.badges.includes('ROMPE-ÍDOLOS')) {
        winner.badges.push('ROMPE-ÍDOLOS');
        winner.rep = computeRep(winner); // la nueva insignia sube la REP
    }

    saveUsers(users);

    // Reset de los toggles de JU.
    document.getElementById('admin-match-unique-winner').checked = false;
    document.getElementById('admin-match-unique-loser').checked  = false;

    const fmt = (n) => (n >= 0 ? `+${n}` : `${n}`);
    showFeedback(`Enfrentamiento registrado. ${winnerName} ${fmt(Math.round(deltaW))} REP · ${loserName} ${fmt(Math.round(deltaL))} REP.`, 'ok');
    updateAllViews();
}

// Otorga o revoca una insignia. Tras cualquier cambio se recalcula
// la REP de forma automática (las insignias aportan +50 REP cada una).
function handleBadge(action) {
    const username = document.getElementById('admin-badge-user').value;
    const badge    = document.getElementById('admin-badge-select').value;
    if (!username) { showFeedback('Selecciona un hooper.', 'error'); return; }

    const users = loadUsers();
    const target = users.find((u) => u.username === username);
    if (!target) return;

    if (!Array.isArray(target.badges)) target.badges = [];

    if (action === 'grant') {
        if (!target.badges.includes(badge)) {
            target.badges.push(badge);
            target.rep = computeRep(target);
            saveUsers(users);
            showFeedback(`Insignia «${badge}» otorgada a ${username}. (+${getBadgeRepValue(badge)} REP)`, 'ok');
        } else {
            showFeedback(`${username} ya tiene esa insignia.`, 'error');
        }
    } else { // revoke
        const before = target.badges.length;
        target.badges = target.badges.filter((b) => b !== badge);
        if (target.badges.length !== before) {
            target.rep = computeRep(target);
            saveUsers(users);
            showFeedback(`Insignia «${badge}» revocada a ${username}. (REP recalculada)`, 'ok');
        } else {
            showFeedback(`${username} no tenía esa insignia.`, 'error');
        }
    }
    updateAllViews();
}


/* ---------- Handlers: Edición y borrado de usuarios ---------- */

// Carga los datos del usuario elegido en el formulario de edición.
function loadEditUser() {
    const select = document.getElementById('admin-edit-user-select');
    if (!select) return;

    const username = select.value;
    if (!username) return;

    const users = loadUsers();
    const target = users.find((u) => u.username === username);
    if (!target) return;

    document.getElementById('admin-edit-city').value     = target.city || '';
    document.getElementById('admin-edit-password').value = '';
    document.getElementById('admin-edit-photo-current').innerHTML = target.photo
        ? `<img class="profile-photo" src="${target.photo}" alt="Foto actual de ${escapeHtml(username)}" />`
        : `<div class="admin-edit-photo-empty">Sin foto</div>`;
}

async function handleAdminEdit(event) {
    event.preventDefault();

    const username = document.getElementById('admin-edit-user-select').value;
    const city     = document.getElementById('admin-edit-city').value.trim();
    const password = document.getElementById('admin-edit-password').value;
    const photoFile = document.getElementById('admin-edit-photo').files[0];

    if (!username) { showFeedback('Selecciona un hooper.', 'error'); return; }

    const users = loadUsers();
    const target = users.find((u) => u.username === username);
    if (!target) return;

    target.city = city;

    if (password) {
        if (!validPassword(password)) {
            showFeedback(`La nueva contraseña debe tener al menos ${MIN_PASSWORD_LEN} caracteres.`, 'error');
            return;
        }
        target.password = password;
    }

    if (photoFile) {
        try { target.photo = await getCompressedPhoto(photoFile); }
        catch (err) { showFeedback(err.message || 'No se pudo procesar la foto.', 'error'); return; }
    }

    saveUsers(users);
    showFeedback(`Perfil de ${username} actualizado.`, 'ok');
    updateAllViews();
    loadEditUser();
}

function handleAdminDelete(event) {
    event.preventDefault();
    const username = document.getElementById('admin-delete-select').value;
    if (!username) { showFeedback('Selecciona un hooper.', 'error'); return; }

    if (username === DEFAULT_ADMIN) {
        showFeedback('El administrador no puede eliminarse.', 'error');
        return;
    }

    const confirm = window.confirm(`¿Eliminar definitivamente a «${username}» del registro?`);
    if (!confirm) return;

    const users = loadUsers().filter((u) => u.username !== username);
    saveUsers(users);

    // Limpieza: quitarlo de cualquier torneo.
    const events = loadEvents();
    events.forEach((ev) => {
        ev.participants = ev.participants.filter((p) => p !== username);
        if (ev.winner === username) ev.winner = null;
    });
    saveEvents(events);

    showFeedback(`${username} eliminado del registro.`, 'ok');
    updateAllViews();
}


/* ---------- Handlers: Torneos ---------- */

function handleCreateTournament(event) {
    event.preventDefault();
    if (!isAdmin()) return;

    const name = document.getElementById('tournament-name').value.trim();
    if (!name) { showFeedback('El torneo necesita un nombre.', 'error'); return; }

    const events = loadEvents();
    events.push({
        id: Date.now(),
        name,
        status: 'open',
        winner: null,
        participants: [],
        createdAt: new Date().toISOString(),
        closedAt: null
    });
    saveEvents(events);

    event.target.reset();
    showFeedback(`Torneo «${name}» creado.`, 'ok');
    updateAllViews();
}

function loadTournamentSelects() {
    const events = loadEvents();
    const openEvents = events.filter((e) => e.status === 'open');
    const opts = openEvents.length
        ? openEvents.map((e) => `<option value="${e.id}">${escapeHtml(e.name)}</option>`).join('')
        : '<option disabled value="">— Sin torneos abiertos —</option>';

    const addSel   = document.getElementById('tournament-add-select');
    const closeSel = document.getElementById('tournament-close-select');
    if (addSel)   addSel.innerHTML = opts;
    if (closeSel) closeSel.innerHTML = opts;

    // Select de participantes para "designar campeón" (torneos abiertos).
    const partSel = document.getElementById('tournament-close-participant');
    if (partSel) {
        const closeId = document.getElementById('tournament-close-select').value;
        const ev = events.find((e) => String(e.id) === String(closeId));
        const parts = (ev && ev.participants.length) ? ev.participants : [];
        partSel.innerHTML = parts.length
            ? parts.map((p) => `<option value="${escapeHtml(p)}">${escapeHtml(p)}</option>`).join('')
            : '<option disabled value="">— Sin participantes —</option>';
    }
}

function handleAddParticipant() {
    if (!isAdmin()) return;
    const tournamentId = document.getElementById('tournament-add-select').value;
    const username     = document.getElementById('tournament-add-user').value;
    if (!tournamentId || !username) { showFeedback('Selecciona torneo y hooper.', 'error'); return; }

    const events = loadEvents();
    const ev = events.find((e) => String(e.id) === String(tournamentId));
    if (!ev) return;
    if (ev.status !== 'open') { showFeedback('Ese torneo ya está cerrado.', 'error'); return; }

    if (!ev.participants.includes(username)) {
        ev.participants.push(username);
        saveEvents(events);
        showFeedback(`${username} inscrito en «${ev.name}».`, 'ok');
    } else {
        showFeedback(`${username} ya estaba inscrito.`, 'error');
    }
    updateAllViews();
}

function handleCloseTournament(event) {
    event.preventDefault();
    if (!isAdmin()) return;

    const tournamentId = document.getElementById('tournament-close-select').value;
    const winner       = document.getElementById('tournament-close-participant').value;
    if (!tournamentId) { showFeedback('Selecciona un torneo.', 'error'); return; }

    const events = loadEvents();
    const ev = events.find((e) => String(e.id) === String(tournamentId));
    if (!ev) return;
    if (ev.status !== 'open') { showFeedback('Ese torneo ya está cerrado.', 'error'); return; }

    ev.status   = 'closed';
    ev.winner   = winner || null;
    ev.closedAt = new Date().toISOString();

    // Sumar 1 torneo jugado a cada participante; insignia de campeón.
    const users = loadUsers();
    ev.participants.forEach((name) => {
        const u = users.find((x) => x.username === name);
        if (u) u.tournaments = (u.tournaments || 0) + 1;
    });
    if (winner) {
        const w = users.find((x) => x.username === winner);
        if (w) {
            if (!w.badges.includes('DUEÑO DE LA PISTA')) w.badges.push('DUEÑO DE LA PISTA');
            if (!w.badges.includes('CAMPEÓN DE TORNEO')) w.badges.push('CAMPEÓN DE TORNEO');
        }
    }
    // REP recalculada (por si alguien ganó la insignia de campeón).
    recomputeAllRep(users);

    saveUsers(users);
    saveEvents(events);
    showFeedback(`«${ev.name}» cerrado${winner ? `. Campeón: ${winner}` : ''}.`, 'ok');
    updateAllViews();
}


/* ---------- Modal de perfil (placa de metal) ---------- */

function openProfileModal(username) {
    const users = loadUsers();
    const user = users.find((u) => u.username === username);
    if (!user) return;

    const dialog = document.getElementById('profile-modal');
    if (!dialog) return;

    const photo = user.photo || getDefaultAvatar();
    const tier  = tierOfUser(user, users);   // tier por posición, no por REP

    document.getElementById('profile-modal-photo').src = photo;
    document.getElementById('profile-modal-photo').alt = `Foto de ${user.username}`;
    document.getElementById('profile-modal-name').textContent  = user.username;
    document.getElementById('profile-modal-city').textContent  = user.city || 'Ubicación desconocida';
    document.getElementById('profile-modal-rep').textContent    = user.rep || 0;
    document.getElementById('profile-modal-streak').textContent = user.streak || 0;
    document.getElementById('profile-modal-wins').textContent   = user.wins || 0;
    document.getElementById('profile-modal-unique').textContent = user.uniqueGames || 0;

    const tierEl = document.getElementById('profile-modal-tier');
    tierEl.textContent = `${tier.label} · ${user.rep || 0} REP`;
    tierEl.className = `profile-modal-tier ${tier.cls}`;

    // Insignias octogonales físicas (medallas de metal fundido).
    const badgesWrap = document.getElementById('profile-modal-badges');
    const detailEl = document.getElementById('profile-modal-badge-detail');
    if (user.badges && user.badges.length) {
        badgesWrap.innerHTML = user.badges.map((b) => {
            const meta = getBadgeMeta(b);
            return `
                <button type="button" class="street-badge ${meta.cls}" data-badge="${escapeHtml(b)}" title="${escapeHtml(meta.title || b)}">
                    <span class="street-badge-emoji">${escapeHtml(meta.emoji || '·')}</span>
                    <span class="street-badge-label">${escapeHtml(meta.title || b)}</span>
                </button>`;
        }).join('');
        if (detailEl) {
            detailEl.innerHTML = '<span class="badge-detail-hint">Pulsa una insignia para ver su significado.</span>';
        }
        badgesWrap.querySelectorAll('.street-badge').forEach((button) => {
            button.addEventListener('click', () => {
                const badge = button.dataset.badge;
                const meta = getBadgeMeta(badge);
                if (detailEl) {
                    detailEl.innerHTML = `<strong>${escapeHtml(meta.title || badge)}</strong><span>${escapeHtml(meta.description || 'Insignia especial del registro de hoopers.')}</span>`;
                }
            });
        });
    } else {
        badgesWrap.innerHTML = '<span class="profile-badges-empty">Sin insignias todavía.</span>';
        if (detailEl) detailEl.innerHTML = '<span class="badge-detail-hint">Sin insignias todavía.</span>';
    }

    if (typeof dialog.showModal === 'function') {
        if (dialog.open) dialog.close();
        dialog.showModal();
    } else {
        dialog.setAttribute('open', '');
    }
}

function closeProfileModal() {
    const dialog = document.getElementById('profile-modal');
    if (!dialog) return;
    if (dialog.open) dialog.close();
}


/* ---------- Orquestación ---------- */

function updateAllViews() {
    updateAdminSelects();
    loadEditUser();
    loadTournamentSelects();
    updateRanking();
    renderTournaments();
    renderProfile();
    showAdminPanel();
    toggleAuthViews();
}

function initBackgroundMotion() {
    const root = document.documentElement;
    if (!root) return;

    const updateMotion = (x, y) => {
        root.style.setProperty('--bg-shift-x', `${x}px`);
        root.style.setProperty('--bg-shift-y', `${y}px`);
    };

    window.addEventListener('pointermove', (event) => {
        const x = (event.clientX / window.innerWidth - 0.5) * 10;
        const y = (event.clientY / window.innerHeight - 0.5) * 8;
        updateMotion(x, y);
    });

    window.addEventListener('pointerleave', () => updateMotion(0, 0));
    window.addEventListener('blur', () => updateMotion(0, 0));
}

function init() {
    initBackgroundMotion();

    // Auth
    document.getElementById('register-form')   ?.addEventListener('submit', handleRegister);
    document.getElementById('login-form')      ?.addEventListener('submit', handleLogin);
    document.getElementById('logout-btn')      ?.addEventListener('click', handleLogout);

    // Admin usuarios
    document.getElementById('admin-create-form')?.addEventListener('submit', handleAdminCreate);
    document.getElementById('admin-stats-form') ?.addEventListener('submit', handleAdminStats);
    document.getElementById('admin-edit-form')  ?.addEventListener('submit', handleAdminEdit);
    document.getElementById('admin-delete-form')?.addEventListener('submit', handleAdminDelete);
    document.getElementById('admin-match-form') ?.addEventListener('submit', handleAdminMatch);

    // Insignias: otorgar / revocar
    document.getElementById('admin-badge-grant') ?.addEventListener('click', () => handleBadge('grant'));
    document.getElementById('admin-badge-revoke')?.addEventListener('click', () => handleBadge('revoke'));

    document.getElementById('admin-edit-user-select')?.addEventListener('change', loadEditUser);
    document.getElementById('admin-badge-select')?.addEventListener('change', updateBadgePreview);
    document.getElementById('tournament-close-select')?.addEventListener('change', loadTournamentSelects);

    // Torneos
    document.getElementById('tournament-create-form')?.addEventListener('submit', handleCreateTournament);
    document.getElementById('tournament-add-btn')     ?.addEventListener('click', handleAddParticipant);
    document.getElementById('tournament-close-form')  ?.addEventListener('submit', handleCloseTournament);

    // Modal: cerrar
    document.getElementById('profile-modal-close')?.addEventListener('click', closeProfileModal);
    const modal = document.getElementById('profile-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            // Click sobre el backdrop (no sobre la placa) cierra el modal.
            if (e.target === modal) closeProfileModal();
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeProfileModal();
    });

    // Inicializar almacenes
    loadUsers();      // fuerza seed + admin + migración
    if (!localStorage.getItem(EVENTS_KEY)) saveEvents([]);
    updateAllViews();
}

init();
