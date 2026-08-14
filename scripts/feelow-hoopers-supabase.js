// =========================================================
// FEELOW HOOPERS - Versión Supabase (Base de datos real)
// =========================================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Configuración de Supabase
const SUPABASE_URL = 'https://olcakitusgghaiphdtgh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sY2FraXR1c2dnaGFpcGhkdGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwMzg3MjgsImV4cCI6MjEwMTYxNDcyOH0.Iud3mLFAn6xzrcxuQlNYKG6TtkYLnPvxJ_iIuKyzSck';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const PHOTO_TARGET_PX = 256;
const STREAK_FIRE = 3;

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

const TIERS = {
    kings:    { label: 'The Kings',    cls: 'tier-kings',    accent: '#c28a35' },
    hustlers: { label: 'The Hustlers', cls: 'tier-hustlers', accent: '#d8d8d8' },
    asphalt:  { label: 'The Asphalt',  cls: 'tier-asphalt',  accent: '#a7a7a2' },
};

function tierByPosition(position) {
    if (position <= 3)  return TIERS.kings;
    if (position <= 50) return TIERS.hustlers;
    return TIERS.asphalt;
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
}

function getBadgeMeta(badge) {
    return BADGE_META[badge] || { emoji: '·', cls: 'badge-custom', title: badge, description: 'Insignia especial para quien deja marca en la pista.' };
}

function formatDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
}

function streakLabel(streak) {
    if (!streak || streak === 0) return '<span class="streak-cold">—</span>';
    if (streak >= STREAK_FIRE) return `<span class="streak-hot">💨 x${streak}</span>`;
    if (streak <= -STREAK_FIRE) return `<span class="streak-cold">❄️ x${Math.abs(streak)}</span>`;
    return `<span class="streak-warm">${streak}</span>`;
}

function getDefaultAvatar() {
    const svg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#111111"/><circle cx="50" cy="50" r="38" fill="none" stroke="#3a3a3a" stroke-width="2"/><path d="M 12 50 Q 50 68 88 50" fill="none" stroke="#3a3a3a" stroke-width="2"/><path d="M 50 12 Q 32 50 50 88" fill="none" stroke="#3a3a3a" stroke-width="2"/></svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function getPhotoElement(user, className) {
    const photo = user.avatar_url || getDefaultAvatar();
    return `<img class="${className}" src="${photo}" alt="${escapeHtml(user.username)}" loading="lazy" />`;
}

async function getCompressedPhoto(file) {
    if (!file) return '';
    if (!file.type.startsWith('image/')) throw new Error('El archivo no es una imagen válida.');
    const dataUrl = await readAsDataUrl(file);
    try { return await downscale(dataUrl); }
    catch { return dataUrl; }
}

function readAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
        reader.readAsDataURL(file);
    });
}

function downscale(dataUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const scale = Math.min(1, PHOTO_TARGET_PX / Math.max(img.width, img.height));
            const w = Math.max(1, Math.round(img.width * scale));
            const h = Math.max(1, Math.round(img.height * scale));
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = () => reject(new Error('La imagen está corrupta.'));
        img.src = dataUrl;
    });
}

function dataUrlToBlob(dataUrl) {
    const parts = dataUrl.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const u8arr = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; ++i) u8arr[i] = raw.charCodeAt(i);
    return new Blob([u8arr], { type: contentType });
}

let feedbackTimer = null;
function showFeedback(message, type = 'ok') {
    const el = document.getElementById('feedback');
    if (!el) { window.alert(message); return; }
    el.textContent = message;
    el.className = `feelow-feedback is-visible ${type}`;
    if (feedbackTimer) clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => { el.classList.remove('is-visible'); }, 4200);
}

async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase.from('hoopers').select('*').eq('id', user.id).single();
    return profile;
}

async function uploadAvatar(username, dataUrl) {
    const fileName = `${username}-${Date.now()}.jpg`;
    const { data, error } = await supabase.storage.from('avatars').upload(fileName, dataUrlToBlob(dataUrl), { contentType: 'image/jpeg', upsert: false });
    if (error) throw new Error('No se pudo subir la foto.');
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(data.path);
    return urlData.publicUrl;
}

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

    let avatarUrl = null;
    if (photoFile) {
        try {
            const compressed = await getCompressedPhoto(photoFile);
            avatarUrl = await uploadAvatar(username, compressed);
        } catch (err) { return showFeedback(err.message, 'error'); }
    }

    const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { username, avatar_url: avatarUrl, city } }
    });
    if (error) return showFeedback('Error: ' + error.message, 'error');
    showFeedback(`Bienvenido, ${username}.`, 'ok');
    event.target.reset();
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
    event.target.reset();
    updateAllViews();
}

async function handleLogout() {
    await supabase.auth.signOut();
    showFeedback('Sesión cerrada.', 'ok');
    updateAllViews();
}

async function updateRanking() {
    const { data: users, error } = await supabase.from('hoopers').select('*').order('rep', { ascending: false }).limit(50);
    const tbody = document.getElementById('ranking-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (error || !users || !users.length) {
        tbody.innerHTML = `<tr><td colspan="8" class="ranking-empty">Aún no hay hoopers registrados</td></tr>`;
        return;
    }
    users.forEach((user, index) => {
        const position = index + 1;
        const positionLabel = position < 10 ? `0${position}` : String(position);
        const tier = tierByPosition(position);
        const row = document.createElement('tr');
        row.classList.add('ranking-row', tier.cls);
        row.dataset.userId = user.id;
        row.innerHTML = `
            <td><span class="rank-position">${positionLabel}</span></td>
            <td><div class="rank-photo-cell">${getPhotoElement(user, 'ranking-photo')}<span class="rank-name">${escapeHtml(user.username)}</span></div></td>
            <td>${user.wins}</td>
            <td class="ju-cell">${user.unique_games || 0}</td>
            <td>${user.matches || 0}</td>
            <td>${user.losses || 0}</td>
            <td><span class="score-cell">${user.rep || 0}</span></td>
            <td class="streak-cell">${streakLabel(user.streak || 0)}</td>`;
        row.addEventListener('click', () => openProfileModal(user.id));
        tbody.appendChild(row);
    });
}

async function renderProfile() {
    const profileView = document.getElementById('profile-view');
    if (!profileView) return;
    const user = await getCurrentUser();
    if (!user) { profileView.innerHTML = '<p class="is-empty">No has iniciado sesión.</p>'; return; }
    const { data: allUsers } = await supabase.from('hoopers').select('id, rep').order('rep', { ascending: false });
    const position = (allUsers || []).findIndex(u => u.id === user.id) + 1;
    const tier = tierByPosition(position || 999);
    const badgesHtml = (user.badges && user.badges.length)
        ? user.badges.map((b) => { const meta = getBadgeMeta(b); return `<button type="button" class="profile-badge-chip ${meta.cls}" data-badge="${escapeHtml(b)}"><span class="profile-badge-emoji">${escapeHtml(meta.emoji)}</span><span class="profile-badge-label">${escapeHtml(meta.title || b)}</span></button>`; }).join('')
        : '<span class="is-empty">Sin insignias</span>';
    profileView.innerHTML = `
        <div class="profile-card">${getPhotoElement(user, 'profile-photo')}<div><h3>${escapeHtml(user.username)}</h3><p>${user.city ? escapeHtml(user.city) : 'Sin ciudad'}</p><p class="profile-rep-line"><strong>${user.rep || 0}</strong> REP · <span class="profile-tier-tag ${tier.cls}">${tier.label}</span></p></div></div>
        <div class="profile-stats"><div><span>Torneos</span><strong>${user.tournaments || 0}</strong></div><div><span>Partidos</span><strong>${user.matches || 0}</strong></div><div><span>Victorias</span><strong>${user.wins}</strong></div><div><span>Juego Único</span><strong>${user.unique_games || 0}</strong></div></div>
        <div class="profile-badges">${badgesHtml}</div>`;
}

async function renderTournaments() {
    const list = document.getElementById('tournaments-list');
    if (!list) return;
    const { data: tournaments } = await supabase.from('tournaments').select(`*,winner:hoopers!tournaments_winner_id_fkey(username),participants:tournament_participants(hooper:hoopers!tournament_participants_hooper_id_fkey(username))`).order('created_at', { ascending: false });
    list.innerHTML = '';
    if (!tournaments || !tournaments.length) { list.innerHTML = `<div class="tournament-empty">No hay torneos todavía.</div>`; return; }
    tournaments.forEach((ev) => {
        const card = document.createElement('article');
        card.className = `tournament-card is-${ev.status}`;
        const parts = (ev.participants || []).map(p => p.hooper?.username).filter(Boolean).join(', ') || 'Sin participantes';
        card.innerHTML = `<header class="tournament-head"><div><span class="tournament-status ${ev.status}">${ev.status === 'open' ? 'En curso' : 'Cerrado'}</span><h3>${escapeHtml(ev.name)}</h3></div>${ev.winner ? `<div class="tournament-winner">Campeón<div class="tournament-winner-name">${escapeHtml(ev.winner.username)}</div></div>` : ''}</header><div class="tournament-participants">${parts}</div>`;
        list.appendChild(card);
    });
}

async function openProfileModal(userId) {
    const { data: user } = await supabase.from('hoopers').select('*').eq('id', userId).single();
    if (!user) return;
    const { data: allUsers } = await supabase.from('hoopers').select('id, rep').order('rep', { ascending: false });
    const position = (allUsers || []).findIndex(u => u.id === user.id) + 1;
    const tier = tierByPosition(position || 999);
    const dialog = document.getElementById('profile-modal');
    if (!dialog) return;
    document.getElementById('profile-modal-photo').src = user.avatar_url || getDefaultAvatar();
    document.getElementById('profile-modal-name').textContent = user.username;
    document.getElementById('profile-modal-city').textContent = user.city || '—';
    document.getElementById('profile-modal-rep').textContent = user.rep || 0;
    document.getElementById('profile-modal-streak').textContent = user.streak || 0;
    document.getElementById('profile-modal-wins').textContent = user.wins || 0;
    document.getElementById('profile-modal-unique').textContent = user.unique_games || 0;
    const tierEl = document.getElementById('profile-modal-tier');
    tierEl.textContent = `${tier.label} · ${user.rep || 0} REP`;
    tierEl.className = `profile-modal-tier ${tier.cls}`;
    const badgesWrap = document.getElementById('profile-modal-badges');
    const detailEl = document.getElementById('profile-modal-badge-detail');
    if (user.badges && user.badges.length) {
        badgesWrap.innerHTML = user.badges.map((b) => { const meta = getBadgeMeta(b); return `<button type="button" class="street-badge ${meta.cls}" data-badge="${escapeHtml(b)}"><span class="street-badge-emoji">${escapeHtml(meta.emoji)}</span><span class="street-badge-label">${escapeHtml(meta.title || b)}</span></button>`; }).join('');
        if (detailEl) detailEl.innerHTML = '<span class="badge-detail-hint">Pulsa una insignia.</span>';
        badgesWrap.querySelectorAll('.street-badge').forEach((button) => {
            button.addEventListener('click', () => {
                const meta = getBadgeMeta(button.dataset.badge);
                if (detailEl) detailEl.innerHTML = `<strong>${escapeHtml(meta.title)}</strong><span>${escapeHtml(meta.description)}</span>`;
            });
        });
    } else {
        badgesWrap.innerHTML = '<span class="profile-badges-empty">Sin insignias.</span>';
        if (detailEl) detailEl.innerHTML = '';
    }
    if (typeof dialog.showModal === 'function') { if (dialog.open) dialog.close(); dialog.showModal(); }
    else dialog.setAttribute('open', '');
}

function closeProfileModal() {
    const dialog = document.getElementById('profile-modal');
    if (dialog && dialog.open) dialog.close();
}

async function showAdminPanel() {
    const adminPanel = document.getElementById('admin-panel');
    if (!adminPanel) return;
    const user = await getCurrentUser();
    const isAdmin = user && user.role === 'admin';
    adminPanel.classList.toggle('hidden', !isAdmin);
    if (isAdmin) updateAdminSelects();
}

async function updateAdminSelects() {
    const { data: users } = await supabase.from('hoopers').select('id, username').order('username');
    if (!users) return;
    const userOptions = users.map(u => `<option value="${u.id}">${escapeHtml(u.username)}</option>`).join('');
    ['admin-user-select','admin-edit-user-select','admin-badge-user','admin-delete-select','tournament-add-user','admin-match-winner','admin-match-loser'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = userOptions || '<option disabled>— Sin hoopers —</option>';
    });
    await loadTournamentSelects();
    updateBadgePreview();
}

function updateBadgePreview() {
    const select = document.getElementById('admin-badge-select');
    if (!select) return;
    const meta = getBadgeMeta(select.value);
    const icon = document.getElementById('admin-badge-preview-icon');
    const title = document.getElementById('admin-badge-preview-title');
    const text = document.getElementById('admin-badge-preview-text');
    if (icon) icon.textContent = meta.emoji || '🏀';
    if (title) title.textContent = meta.title || select.value;
    if (text) text.textContent = meta.description || '';
}

async function handleAdminStats(event) {
    event.preventDefault();
    const userId = document.getElementById('admin-user-select').value;
    if (!userId) return showFeedback('Selecciona un hooper.', 'error');
    const { error } = await supabase.from('hoopers').update({
        wins: Math.max(0, Number(document.getElementById('admin-wins').value || 0)),
        unique_games: Math.max(0, Number(document.getElementById('admin-unique-games').value || 0)),
        tournaments: Math.max(0, Number(document.getElementById('admin-tournaments').value || 0)),
        matches: Math.max(0, Number(document.getElementById('admin-matches').value || 0))
    }).eq('id', userId);
    if (error) return showFeedback('Error: ' + error.message, 'error');
    showFeedback('Stats actualizadas.', 'ok');
    updateAllViews();
}

async function handleAdminMatch(event) {
    event.preventDefault();
    const winnerId = document.getElementById('admin-match-winner').value;
    const loserId = document.getElementById('admin-match-loser').value;
    if (!winnerId || !loserId) return showFeedback('Selecciona ganador y perdedor.', 'error');
    if (winnerId === loserId) return showFeedback('Deben ser distintos.', 'error');
    const { error } = await supabase.from('matches').insert({
        winner_id: winnerId, loser_id: loserId,
        winner_unique: document.getElementById('admin-match-unique-winner')?.checked || false,
        loser_unique: document.getElementById('admin-match-unique-loser')?.checked || false
    });
    if (error) return showFeedback('Error: ' + error.message, 'error');
    document.getElementById('admin-match-unique-winner').checked = false;
    document.getElementById('admin-match-unique-loser').checked = false;
    showFeedback('Partido registrado.', 'ok');
    updateAllViews();
}

async function handleBadge(action) {
    const userId = document.getElementById('admin-badge-user').value;
    const badge = document.getElementById('admin-badge-select').value;
    if (!userId) return showFeedback('Selecciona un hooper.', 'error');
    const { data: user } = await supabase.from('hoopers').select('badges').eq('id', userId).single();
    if (!user) return;
    let newBadges = user.badges || [];
    if (action === 'grant') { if (newBadges.includes(badge)) return showFeedback('Ya tiene esa insignia.', 'error'); newBadges.push(badge); }
    else { const b = newBadges.length; newBadges = newBadges.filter(x => x !== badge); if (newBadges.length === b) return showFeedback('No tenía esa insignia.', 'error'); }
    const { error } = await supabase.from('hoopers').update({ badges: newBadges }).eq('id', userId);
    if (error) return showFeedback('Error: ' + error.message, 'error');
    showFeedback(`Insignia ${action === 'grant' ? 'otorgada' : 'revocada'}.`, 'ok');
    updateAllViews();
}

async function handleAdminEdit(event) {
    event.preventDefault();
    const userId = document.getElementById('admin-edit-user-select').value;
    if (!userId) return showFeedback('Selecciona un hooper.', 'error');
    const updateData = { city: document.getElementById('admin-edit-city').value.trim() };
    const photoFile = document.getElementById('admin-edit-photo').files[0];
    if (photoFile) {
        try {
            const { data: user } = await supabase.from('hoopers').select('username').eq('id', userId).single();
            const compressed = await getCompressedPhoto(photoFile);
            updateData.avatar_url = await uploadAvatar(user.username, compressed);
        } catch (err) { return showFeedback(err.message, 'error'); }
    }
    const { error } = await supabase.from('hoopers').update(updateData).eq('id', userId);
    if (error) return showFeedback('Error: ' + error.message, 'error');
    showFeedback('Perfil actualizado.', 'ok');
    updateAllViews();
}

async function handleAdminDelete(event) {
    event.preventDefault();
    const userId = document.getElementById('admin-delete-select').value;
    if (!userId) return showFeedback('Selecciona un hooper.', 'error');
    const me = await getCurrentUser();
    if (userId === me.id) return showFeedback('No puedes eliminarte.', 'error');
    if (!window.confirm('¿Eliminar definitivamente?')) return;
    const { error } = await supabase.from('hoopers').delete().eq('id', userId);
    if (error) return showFeedback('Error: ' + error.message, 'error');
    showFeedback('Usuario eliminado.', 'ok');
    updateAllViews();
}

async function loadTournamentSelects() {
    const { data: tournaments } = await supabase.from('tournaments').select('id, name').eq('status', 'open').order('created_at', { ascending: false });
    const opts = tournaments && tournaments.length ? tournaments.map(t => `<option value="${t.id}">${escapeHtml(t.name)}</option>`).join('') : '<option disabled value="">— Sin torneos —</option>';
    const addSel = document.getElementById('tournament-add-select');
    const closeSel = document.getElementById('tournament-close-select');
    if (addSel) addSel.innerHTML = opts;
    if (closeSel) closeSel.innerHTML = opts;
}

async function handleCreateTournament(event) {
    event.preventDefault();
    const name = document.getElementById('tournament-name').value.trim();
    if (!name) return showFeedback('Falta nombre.', 'error');
    const { error } = await supabase.from('tournaments').insert({ name, status: 'open' });
    if (error) return showFeedback('Error: ' + error.message, 'error');
    event.target.reset();
    showFeedback(`Torneo «${name}» creado.`, 'ok');
    updateAllViews();
}

async function handleAddParticipant() {
    const tid = document.getElementById('tournament-add-select').value;
    const hid = document.getElementById('tournament-add-user').value;
    if (!tid || !hid) return showFeedback('Selecciona torneo y hooper.', 'error');
    const { error } = await supabase.from('tournament_participants').insert({ tournament_id: tid, hooper_id: hid });
    if (error) return showFeedback(error.code === '23505' ? 'Ya estaba inscrito.' : 'Error: ' + error.message, 'error');
    showFeedback('Hooper inscrito.', 'ok');
    updateAllViews();
}

async function handleCloseTournament(event) {
    event.preventDefault();
    const tid = document.getElementById('tournament-close-select').value;
    const wid = document.getElementById('tournament-close-participant').value;
    if (!tid) return showFeedback('Selecciona un torneo.', 'error');
    const { error } = await supabase.from('tournaments').update({ status: 'closed', winner_id: wid || null, closed_at: new Date().toISOString() }).eq('id', tid);
    if (error) return showFeedback('Error: ' + error.message, 'error');
    if (wid) {
        const { data: w } = await supabase.from('hoopers').select('badges').eq('id', wid).single();
        if (w) {
            const nb = [...(w.badges || [])];
            if (!nb.includes('DUEÑO DE LA PISTA')) nb.push('DUEÑO DE LA PISTA');
            if (!nb.includes('CAMPEÓN DE TORNEO')) nb.push('CAMPEÓN DE TORNEO');
            await supabase.from('hoopers').update({ badges: nb }).eq('id', wid);
        }
    }
    showFeedback('Torneo cerrado.', 'ok');
    updateAllViews();
}

async function toggleAuthViews() {
    const user = await getCurrentUser();
    const authPanel = document.querySelector('.auth-panel');
    const profilePanel = document.getElementById('user-profile');
    if (!authPanel || !profilePanel) return;
    if (user) { authPanel.classList.add('hidden'); profilePanel.classList.remove('hidden'); }
    else { authPanel.classList.remove('hidden'); profilePanel.classList.add('hidden'); }
}

async function updateAllViews() {
    await updateRanking();
    await renderTournaments();
    await renderProfile();
    await showAdminPanel();
    await toggleAuthViews();
}

function initBackgroundMotion() {
    const root = document.documentElement;
    if (!root) return;
    const update = (x, y) => { root.style.setProperty('--bg-shift-x', `${x}px`); root.style.setProperty('--bg-shift-y', `${y}px`); };
    window.addEventListener('pointermove', (e) => update((e.clientX / window.innerWidth - 0.5) * 10, (e.clientY / window.innerHeight - 0.5) * 8));
    window.addEventListener('pointerleave', () => update(0, 0));
}

async function loadEditUser() {
    const select = document.getElementById('admin-edit-user-select');
    if (!select) return;
    const userId = select.value;
    if (!userId) return;
    const { data: user } = await supabase.from('hoopers').select('*').eq('id', userId).single();
    if (!user) return;
    document.getElementById('admin-edit-city').value = user.city || '';
    document.getElementById('admin-edit-photo-current').innerHTML = user.avatar_url
        ? `<img class="profile-photo" src="${user.avatar_url}" alt="${escapeHtml(user.username)}" />`
        : `<div class="admin-edit-photo-empty">Sin foto</div>`;
}

function init() {
    initBackgroundMotion();
    document.getElementById('register-form')?.addEventListener('submit', handleRegister);
    document.getElementById('login-form')?.addEventListener('submit', handleLogin);
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
    document.getElementById('admin-stats-form')?.addEventListener('submit', handleAdminStats);
    document.getElementById('admin-edit-form')?.addEventListener('submit', handleAdminEdit);
    document.getElementById('admin-delete-form')?.addEventListener('submit', handleAdminDelete);
    document.getElementById('admin-match-form')?.addEventListener('submit', handleAdminMatch);
    document.getElementById('admin-badge-grant')?.addEventListener('click', () => handleBadge('grant'));
    document.getElementById('admin-badge-revoke')?.addEventListener('click', () => handleBadge('revoke'));
    document.getElementById('admin-edit-user-select')?.addEventListener('change', loadEditUser);
    document.getElementById('admin-badge-select')?.addEventListener('change', updateBadgePreview);
    document.getElementById('tournament-close-select')?.addEventListener('change', loadTournamentSelects);
    document.getElementById('tournament-create-form')?.addEventListener('submit', handleCreateTournament);
    document.getElementById('tournament-add-btn')?.addEventListener('click', handleAddParticipant);
    document.getElementById('tournament-close-form')?.addEventListener('submit', handleCloseTournament);
    document.getElementById('profile-modal-close')?.addEventListener('click', closeProfileModal);
    const modal = document.getElementById('profile-modal');
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeProfileModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeProfileModal(); });
    updateAllViews();
}

init();
