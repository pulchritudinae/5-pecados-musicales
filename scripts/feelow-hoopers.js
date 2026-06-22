/* =========================================================
   FEELOW HOOPERS — Registro de jugadores (Leo Feelow · 5PM)
   ---------------------------------------------------------
   Mini-aplicación de frontend puro (localStorage).
   No es una plataforma deportiva: es un archivo urbano
   permanente de quienes han participado en los retos y
   torneos asociados a Leo Feelow dentro del universo 5PM.

   NOTA DE SEGURIDAD
   Las contraseñas se guardan en localStorage del navegador
   porque no hay backend. Esto NO es autenticación real:
   sirve para que cada hooper gestione su acceso informal,
   pero cualquiera con acceso al dispositivo podría leerlas.
   Cuando exista backend, mover a un endpoint con hash.

   MODELO DE DATOS
   ----------------------------------------------------------------
   users: [{
     id, username, password, city, photo,
     wins, losses, tournaments, matches,
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


/* ---------- Persistencia ---------- */

function loadUsers() {
    let raw = localStorage.getItem(STORAGE_KEY);
    let users;

    if (!raw) {
        // Seed inicial. El admin canónico se garantiza en ensureAdminUser().
        users = [
            { id: 2, username: 'Rook', password: 'rook1234', city: 'Barcelona', photo: '', wins: 9, losses: 7, tournaments: 2, matches: 16, joinedAt: '2026-06-02', badges: ['Participante fundador'] }
        ];
    } else {
        try { users = JSON.parse(raw); }
        catch { users = []; }
    }

    users = migrateUsers(users);
    ensureAdminUser(users);
    saveUsers(users);
    return users;
}

// Rellena campos nuevos en usuarios antiguos para no perder datos.
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
        if (typeof u.losses      !== 'number') u.losses      = 0;
        if (!Array.isArray(u.badges)) u.badges = [];
        if (typeof u.photo   !== 'string') u.photo   = '';
        if (typeof u.city    !== 'string') u.city    = '';
        if (typeof u.joinedAt !== 'string') u.joinedAt = new Date().toISOString();
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
            wins: 12, losses: 4, tournaments: 3, matches: 16,
            joinedAt: '2026-06-01',
            badges: ['Primer Hooper', 'Campeón del torneo', 'Participante fundador']
        });
    } else {
        // Refuerza credenciales por si una versión vieja las vació.
        users[idx].password = DEFAULT_ADMIN_PASSWORD;
    }
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


/* ---------- Utilidades ---------- */

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (ch) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
    ));
}

function formatDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
}

function scoreForUser(user) {
    // 3 puntos por victoria, −1 por derrota.
    return user.wins * 3 - user.losses;
}

function sortUsers(users) {
    return [...users].sort((a, b) => {
        const diff = scoreForUser(b) - scoreForUser(a);
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


/* ---------- Render: Ranking ---------- */

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
        const isTop = position === 1;

        const row = document.createElement('tr');
        if (isTop) row.classList.add('is-top');
        row.innerHTML = `
            <td><span class="rank-position">${positionLabel}</span></td>
            <td>
                <div class="rank-photo-cell">
                    ${getPhotoElement(user, 'ranking-photo')}
                    <span class="rank-name">${escapeHtml(user.username)}</span>
                </div>
            </td>
            <td>${user.wins}</td>
            <td class="muted-cell">${user.losses}</td>
            <td class="muted-cell">${user.tournaments || 0}</td>
            <td><span class="score-cell">${scoreForUser(user)}</span></td>
        `;
        tbody.appendChild(row);
    });
}


/* ---------- Render: Perfil ---------- */

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

    const badgesHtml = (user.badges && user.badges.length)
        ? user.badges.map((b) => `<span>${escapeHtml(b)}</span>`).join('')
        : '<span class="is-empty">Sin insignias</span>';

    profileView.innerHTML = `
        <div class="profile-card">
            ${getPhotoElement(user, 'profile-photo')}
            <div>
                <h3>${escapeHtml(user.username)}</h3>
                <p>${user.city ? escapeHtml(user.city) : 'Ubicación desconocida'}</p>
                <p>Registro · ${formatDate(user.joinedAt)}</p>
            </div>
        </div>
        <div class="profile-stats">
            <div><span>Torneos</span><strong>${user.tournaments || 0}</strong></div>
            <div><span>Partidos</span><strong>${user.matches || 0}</strong></div>
            <div><span>Victorias</span><strong>${user.wins}</strong></div>
            <div><span>Derrotas</span><strong>${user.losses}</strong></div>
        </div>
        <div class="profile-badges">${badgesHtml}</div>
    `;
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

function updateAdminSelects() {
    const userOptions = buildUserOptions();

    ['admin-user-select', 'admin-result-user', 'admin-edit-user-select', 'admin-badge-user', 'admin-delete-select', 'tournament-add-user'].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerHTML = userOptions
            ? userOptions
            : '<option disabled>— Sin hoopers —</option>';
    });
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
        wins: 0, losses: 0, tournaments: 0, matches: 0,
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
        wins: 0, losses: 0, tournaments: 0, matches: 0,
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
    const losses      = Math.max(0, Number(document.getElementById('admin-losses').value || 0));
    const tournaments = Math.max(0, Number(document.getElementById('admin-tournaments').value || 0));
    const matches     = Math.max(0, Number(document.getElementById('admin-matches').value || 0));

    if (!username) { showFeedback('Selecciona un hooper.', 'error'); return; }

    const users = loadUsers();
    const target = users.find((u) => u.username === username);
    if (!target) return;

    target.wins = wins;
    target.losses = losses;
    target.tournaments = tournaments;
    target.matches = matches;
    saveUsers(users);

    showFeedback(`Stats de ${username} actualizadas.`, 'ok');
    updateAllViews();
}

function handleResult(type) {
    const username = document.getElementById('admin-result-user').value;
    if (!username) { showFeedback('Selecciona un hooper.', 'error'); return; }

    const users = loadUsers();
    const target = users.find((u) => u.username === username);
    if (!target) return;

    if (type === 'win')  target.wins   += 1;
    else                 target.losses += 1;
    target.matches = (target.matches || 0) + 1;

    saveUsers(users);
    showFeedback(`Resultado registrado para ${username}.`, 'ok');
    updateAllViews();
}

function handleBadges(event) {
    event.preventDefault();
    const username = document.getElementById('admin-badge-user').value;
    const badge    = document.getElementById('admin-badge-select').value;
    if (!username) { showFeedback('Selecciona un hooper.', 'error'); return; }

    const users = loadUsers();
    const target = users.find((u) => u.username === username);
    if (!target) return;

    if (!Array.isArray(target.badges)) target.badges = [];
    if (!target.badges.includes(badge)) {
        target.badges.push(badge);
        saveUsers(users);
        showFeedback(`Insignia «${badge}» otorgada a ${username}.`, 'ok');
    } else {
        showFeedback(`${username} ya tiene esa insignia.`, 'error');
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

    // Sumar 1 torneo jugado a cada participante, +1 victoria al campeón.
    const users = loadUsers();
    ev.participants.forEach((name) => {
        const u = users.find((x) => x.username === name);
        if (u) u.tournaments = (u.tournaments || 0) + 1;
    });
    if (winner) {
        const w = users.find((x) => x.username === winner);
        if (w) {
            w.wins = (w.wins || 0) + 1;
            w.matches = (w.matches || 0) + 1;
            if (!w.badges.includes('Campeón del torneo')) w.badges.push('Campeón del torneo');
        }
    }

    saveUsers(users);
    saveEvents(events);
    showFeedback(`«${ev.name}» cerrado${winner ? `. Campeón: ${winner}` : ''}.`, 'ok');
    updateAllViews();
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

function init() {
    // Auth
    document.getElementById('register-form')   ?.addEventListener('submit', handleRegister);
    document.getElementById('login-form')      ?.addEventListener('submit', handleLogin);
    document.getElementById('logout-btn')      ?.addEventListener('click', handleLogout);

    // Admin usuarios
    document.getElementById('admin-create-form')?.addEventListener('submit', handleAdminCreate);
    document.getElementById('admin-stats-form') ?.addEventListener('submit', handleAdminStats);
    document.getElementById('admin-edit-form')  ?.addEventListener('submit', handleAdminEdit);
    document.getElementById('admin-delete-form')?.addEventListener('submit', handleAdminDelete);
    document.getElementById('admin-badges-form')?.addEventListener('submit', handleBadges);

    document.getElementById('admin-win-btn')  ?.addEventListener('click', () => handleResult('win'));
    document.getElementById('admin-loss-btn') ?.addEventListener('click', () => handleResult('loss'));

    document.getElementById('admin-edit-user-select')?.addEventListener('change', loadEditUser);
    document.getElementById('tournament-close-select')?.addEventListener('change', loadTournamentSelects);

    // Torneos
    document.getElementById('tournament-create-form')?.addEventListener('submit', handleCreateTournament);
    document.getElementById('tournament-add-btn')     ?.addEventListener('click', handleAddParticipant);
    document.getElementById('tournament-close-form')  ?.addEventListener('submit', handleCloseTournament);

    // Inicializar almacenes
    loadUsers();      // fuerza seed + admin + migración
    if (!localStorage.getItem(EVENTS_KEY)) saveEvents([]);

    updateAllViews();
}

init();
