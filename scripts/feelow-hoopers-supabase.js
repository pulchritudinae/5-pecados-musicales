// =========================================================
// FEELOW HOOPERS v4 — Correcciones finales
// =========================================================
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://olcakitusgghaiphdtgh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sY2FraXR1c2dnaGFpcGhkdGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwMzg3MjgsImV4cCI6MjEwMTYxNDcyOH0.Iud3mLFAn6xzrcxuQlNYKG6TtkYLnPvxJ_iIuKyzSck';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const PHOTO_TARGET_PX = 256;
const STREAK_FIRE = 3;

// =========================================================
// INSIGNIAS: SVG de línea monocroma (estilo unificado)
// =========================================================
const BADGE_SVG = {
    'CIMIENTOS': `<svg viewBox="0 0 24 24"><path d="M3 7h18v13H3z M3 11.5h18 M3 16h18 M9 7v4.5 M15 11.5v4.5 M9 16v4"/></svg>`,
    'SANGRE NUEVA': `<svg viewBox="0 0 24 24"><path d="M12 3c3.5 4.6 6 8 6 11a6 6 0 0 1-12 0c0-3 2.5-6.4 6-11z M8.5 14.5h2l1-2 1.5 3 1-1.5h1.5"/></svg>`,
    'DUEÑO DE LA PISTA': `<svg viewBox="0 0 24 24"><path d="M4 17l1.2-8 4 3.5L12 6l2.8 6.5 4-3.5L20 17z M4 20h16"/></svg>`,
    'ROMPE-ÍDOLOS': `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M9 5.5l2.5 4.5-2 3 3.5 6"/></svg>`,
    'LEYENDA': `<svg viewBox="0 0 24 24"><path d="M9.5 11h5v9h-5z M12 11V9 M12 3c1.6 2 2 3.6 0 5.4C10 6.6 10.4 5 12 3z M7 20h10"/></svg>`,
    '1V1 INCOMBATIBLE': `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 4v16 M4.8 8.5c2.2 2 12.2 2 14.4 0 M4.8 15.5c2.2-2 12.2-2 14.4 0"/></svg>`,
    'CLUTCH': `<svg viewBox="0 0 24 24"><path d="M6 3h12 M6 21h12 M7.5 3c0 4.5 3.5 5.5 4.5 7 1-1.5 4.5-2.5 4.5-7 M7.5 21c0-4.5 3.5-5.5 4.5-7 1 1.5 4.5 2.5 4.5 7"/></svg>`,
    'RACHA DE FUEGO': `<svg viewBox="0 0 24 24"><path d="M12 3c1 3.5 4.5 5 4.5 9a4.5 4.5 0 0 1-9 0c0-2.2 1.2-4 2.3-5.6.5 1.2 1.4 1.8 1.4 1.8C11.4 6.5 11.6 4.8 12 3z M12 13c-.8 1-1.2 1.8-1.2 2.6a1.2 1.2 0 0 0 2.4 0c0-.8-.4-1.6-1.2-2.6z"/></svg>`,
    'CAMPEÓN DE TORNEO': `<svg viewBox="0 0 24 24"><path d="M8 4h8v5a4 4 0 0 1-8 0z M8 5H4.5c0 3.2 1.6 4.8 3.5 5 M16 5h3.5c0 3.2-1.6 4.8-3.5 5 M12 13v3 M9 20h6 M10 16h4l.8 4H9.2z"/></svg>`,
    'MVP DE LA CALLE': `<svg viewBox="0 0 24 24"><path d="M12 3l2.7 5.8 6.3.9-4.6 4.3 1.2 6.2-5.6-3.1-5.6 3.1 1.2-6.2L3 9.7l6.3-.9z"/></svg>`
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

// Glifos monocromos para el ticker (sin emojis)
const GLYPH = {
    crown: '<svg class="tick-glyph" viewBox="0 0 24 24"><path d="M4 17l1.2-8 4 3.5L12 6l2.8 6.5 4-3.5L20 17z M4 20h16"/></svg>',
    flame: '<svg class="tick-glyph" viewBox="0 0 24 24"><path d="M12 3c1 3.5 4.5 5 4.5 9a4.5 4.5 0 0 1-9 0c0-2.2 1.2-4 2.3-5.6.5 1.2 1.4 1.8 1.4 1.8C11.4 6.5 11.6 4.8 12 3z"/></svg>',
    ball:  '<svg class="tick-glyph" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 4v16 M4 12h16"/></svg>',
    candle:'<svg class="tick-glyph" viewBox="0 0 24 24"><path d="M9.5 11h5v9h-5z M12 3c1.6 2 2 3.6 0 5.4C10 6.6 10.4 5 12 3z"/></svg>',
    star:  '<svg class="tick-glyph" viewBox="0 0 24 24"><path d="M12 3l2.7 5.8 6.3.9-4.6 4.3 1.2 6.2-5.6-3.1-5.6 3.1 1.2-6.2L3 9.7l6.3-.9z"/></svg>'
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

// =========================================================
// UTILIDADES
// =========================================================
function escapeHtml(v) {
    return String(v ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function getBadgeMeta(b) { return BADGE_META[b] || { rep: 0, title: b, description: 'Insignia especial de la calle.' }; }
function getBadgeSvg(b) { return BADGE_SVG[b] || '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/></svg>'; }
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
    return `<img class="${cls}" src="${p}" alt="${escapeHtml(u.username)}" loading="lazy" />`;
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

// =========================================================
// FOTOS EN COLOR: fuerza estilo inline (gana a cualquier CSS)
// =========================================================
function forceColorPhotos() {
    document.querySelectorAll('img').forEach(img => {
        img.style.filter = 'none';
        img.style.webkitFilter = 'none';
    });
}

// =========================================================
// FOTOS: compresión y subida
// =========================================================
async function getCompressedPhoto(file) {
    if (!file) return '';
    if (!file.type.startsWith('image/')) throw new Error('El archivo no es una imagen válida.');
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
                res(c.toDataURL('image/jpeg', 0.82));
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
function setupPhotoPreview(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    if (!input || !preview) return;
    input.addEventListener('change', () => {
        const file = input.files[0];
        if (!file) { preview.innerHTML = ''; preview.classList.remove('has-image'); return; }
        preview.innerHTML = `<img src="${URL.createObjectURL(file)}" alt="Preview" />`;
        preview.classList.add('has-image');
    });
}

// =========================================================
// FEEDBACK
// =========================================================
let feedbackTimer = null;
function showFeedback(msg, type = 'ok') {
    const el = document.getElementById('feedback');
    if (!el) return window.alert(msg);
    el.textContent = msg;
    el.className = `feelow-feedback is-visible ${type}`;
    if (feedbackTimer) clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => el.classList.remove('is-visible'), 4200);
}

// =========================================================
// AUTH
// =========================================================
async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase.from('hoopers').select('*').eq('id', user.id).single();
    return profile;
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
    event.target.reset();
    updateAllViews();
}
async function handleLogout() {
    await supabase.auth.signOut();
    showFeedback('Sesión cerrada.', 'ok');
    updateAllViews();
}
async function handleEditSelf(event) {
    event.preventDefault();
    const me = await getCurrentUser();
    if (!me) return showFeedback('No hay sesión activa.', 'error');
    const updateData = { city: document.getElementById('edit-self-city').value.trim() };
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
    if (password) {
        if (password.length < 4) return showFeedback('La nueva contraseña necesita 4+ caracteres.', 'error');
        const { error: pwErr } = await supabase.auth.updateUser({ password });
        if (pwErr) return showFeedback('Error de contraseña: ' + pwErr.message, 'error');
    }
    showFeedback('Perfil actualizado.', 'ok');
    document.getElementById('edit-self-password').value = '';
    const pv = document.getElementById('edit-self-photo-preview');
    if (pv) { pv.innerHTML = ''; pv.classList.remove('has-image'); }
    document.getElementById('edit-self-photo').value = '';
    updateAllViews();
}

// =========================================================
// RANKING + SPOTLIGHT + TICKER
// =========================================================
let lastRepMap = {};
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
        const pos = index + 1;
        const label = pos < 10 ? `0${pos}` : String(pos);
        const tier = tierByPosition(pos);
        const row = document.createElement('tr');
        row.className = `ranking-row ${tier.cls}`;
        row.dataset.userId = user.id;
        row.innerHTML = `
            <td><span class="rank-position">${label}</span></td>
            <td><div class="rank-photo-cell">${getPhotoElement(user, 'ranking-photo')}<span class="rank-name">${escapeHtml(user.username)}</span></div></td>
            <td>${user.wins}</td>
            <td>${user.unique_games || 0}</td>
            <td>${user.matches || 0}</td>
            <td>${user.losses || 0}</td>
            <td><span class="score-cell" data-user-id="${user.id}">${user.rep || 0}</span></td>
            <td>${streakLabel(user.streak || 0)}</td>`;
        row.addEventListener('click', () => openProfileModal(user.id));
        tbody.appendChild(row);
        if (lastRepMap[user.id] !== undefined && lastRepMap[user.id] !== (user.rep || 0)) {
            const cell = row.querySelector('.score-cell');
            if (cell) {
                animateNumber(cell, lastRepMap[user.id], user.rep || 0);
                cell.classList.add('glowing');
                setTimeout(() => cell.classList.remove('glowing'), 2000);
            }
        }
        lastRepMap[user.id] = user.rep || 0;
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
    if (photo) photo.src = top.avatar_url || getDefaultAvatar();
    if (name) name.textContent = top.username;
    if (rep) rep.textContent = `${top.rep || 0} REP`;
    forceColorPhotos();
}
function updateTicker(users) {
    const track = document.getElementById('tickerTrack');
    if (!track || !users || !users.length) return;
    const items = [];
    const medals = [GLYPH.crown, GLYPH.star, GLYPH.ball];
    users.slice(0, 3).forEach((u, i) => items.push(`${medals[i]} <b>${escapeHtml(u.username)}</b>&nbsp;domina con ${u.rep || 0} REP`));
    users.filter(u => u.streak >= STREAK_FIRE).slice(0, 2).forEach(u => items.push(`${GLYPH.flame} <b>${escapeHtml(u.username)}</b>&nbsp;encadena ${u.streak} victorias`));
    const active = [...users].sort((a, b) => (b.matches || 0) - (a.matches || 0))[0];
    if (active && active.matches > 0) items.push(`${GLYPH.ball} <b>${escapeHtml(active.username)}</b>&nbsp;es el más activo: ${active.matches} partidos`);
    users.filter(u => u.badges && u.badges.includes('LEYENDA')).slice(0, 1).forEach(u => items.push(`${GLYPH.candle} <b>${escapeHtml(u.username)}</b>&nbsp;ostenta el título de LEYENDA`));
    if (!items.length) items.push(`${GLYPH.ball} Bienvenido al registro oficial de Feelow Hoopers`);
    const half = items.map(i => `<span class="ticker-item">${i}</span>`).join('');
    track.innerHTML = half + half;
}

// =========================================================
// PERFIL
// =========================================================
async function renderProfile() {
    const pv = document.getElementById('profile-view');
    if (!pv) return;
    const user = await getCurrentUser();
    if (!user) { pv.innerHTML = '<p class="is-empty">No has iniciado sesión.</p>'; return; }
    const { data: all } = await supabase.from('hoopers').select('id, rep').order('rep', { ascending: false });
    const pos = (all || []).findIndex(u => u.id === user.id) + 1;
    const tier = tierByPosition(pos || 999);
    const badgesHtml = (user.badges && user.badges.length)
        ? user.badges.map(b => { const m = getBadgeMeta(b); return `<button type="button" class="profile-badge-chip" data-badge="${escapeHtml(b)}" title="${escapeHtml(m.title || b)}">${getBadgeSvg(b)}</button>`; }).join('')
        : '<span class="is-empty">Sin insignias</span>';
    pv.innerHTML = `
        <div class="profile-card">${getPhotoElement(user, 'profile-photo')}<div>
            <h3>${escapeHtml(user.username)}</h3>
            <p>${user.city ? escapeHtml(user.city) : 'Sin ciudad'}</p>
            <p class="profile-rep-line"><strong>${user.rep || 0}</strong> REP · <span class="profile-tier-tag ${tier.cls}">${tier.label}</span></p>
        </div></div>
        <div class="profile-stats">
            <div><span>Torneos</span><strong>${user.tournaments || 0}</strong></div>
            <div><span>Partidos</span><strong>${user.matches || 0}</strong></div>
            <div><span>Victorias</span><strong>${user.wins}</strong></div>
            <div><span>Juego Único</span><strong>${user.unique_games || 0}</strong></div>
        </div>
        <div class="profile-badges">${badgesHtml}</div>`;
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

// =========================================================
// TORNEOS
// =========================================================
async function renderTournaments() {
    const list = document.getElementById('tournaments-list');
    if (!list) return;
    const { data } = await supabase.from('tournaments').select(`*,winner:hoopers!tournaments_winner_id_fkey(username),participants:tournament_participants(hooper:hoopers!tournament_participants_hooper_id_fkey(username))`).order('created_at', { ascending: false });
    list.innerHTML = '';
    if (!data || !data.length) { list.innerHTML = `<div class="tournament-empty">La cancha espera su primer torneo.</div>`; return; }
    data.forEach(ev => {
        const card = document.createElement('article');
        card.className = `tournament-card is-${ev.status}`;
        const parts = (ev.participants || []).map(p => p.hooper?.username).filter(Boolean).join(', ') || 'Sin participantes';
        card.innerHTML = `<header class="tournament-head"><div><span class="tournament-status ${ev.status}">${ev.status === 'open' ? 'En curso' : 'Cerrado'}</span><h3>${escapeHtml(ev.name)}</h3><p class="tournament-date">Iniciado · ${formatDate(ev.created_at)}</p>${ev.closed_at ? `<p class="tournament-date">Cerrado · ${formatDate(ev.closed_at)}</p>` : ''}</div>${ev.winner ? `<div class="tournament-winner">Campeón<div class="tournament-winner-name">${escapeHtml(ev.winner.username)}</div></div>` : ''}</header><div class="tournament-participants">${parts}</div>`;
        list.appendChild(card);
    });
}

// =========================================================
// MODAL PLACA (insignias solo icono, texto en bloque inferior)
// =========================================================
async function openProfileModal(userId) {
    const { data: user } = await supabase.from('hoopers').select('*').eq('id', userId).single();
    if (!user) return;
    const { data: all } = await supabase.from('hoopers').select('id, rep').order('rep', { ascending: false });
    const pos = (all || []).findIndex(u => u.id === user.id) + 1;
    const tier = tierByPosition(pos || 999);
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
    if (typeof dialog.showModal === 'function') { if (dialog.open) dialog.close(); dialog.showModal(); }
    else dialog.setAttribute('open', '');
}
function closeProfileModal() {
    const d = document.getElementById('profile-modal');
    if (d && d.open) d.close();
}

// =========================================================
// ADMIN
// =========================================================
async function showAdminPanel() {
    const ap = document.getElementById('admin-panel');
    if (!ap) return;
    const user = await getCurrentUser();
    const isAdm = user && user.role === 'admin';
    ap.classList.toggle('hidden', !isAdm);
    if (isAdm) updateAdminSelects();
}
async function updateAdminSelects() {
    const { data: users } = await supabase.from('hoopers').select('id, username').order('username');
    if (!users) return;
    const opts = users.map(u => `<option value="${u.id}">${escapeHtml(u.username)}</option>`).join('');
    ['admin-user-select','admin-edit-user-select','admin-badge-user','admin-delete-select','tournament-add-user','admin-match-winner','admin-match-loser'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = opts || '<option disabled>— Sin hoopers —</option>';
    });
    await loadTournamentSelects();
    updateBadgePreview();
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
async function handleAdminStats(event) {
    event.preventDefault();
    const uid = document.getElementById('admin-user-select').value;
    if (!uid) return showFeedback('Selecciona un hooper.', 'error');
    const { error } = await supabase.from('hoopers').update({
        wins: Math.max(0, Number(document.getElementById('admin-wins').value || 0)),
        unique_games: Math.max(0, Number(document.getElementById('admin-unique-games').value || 0)),
        tournaments: Math.max(0, Number(document.getElementById('admin-tournaments').value || 0)),
        matches: Math.max(0, Number(document.getElementById('admin-matches').value || 0))
    }).eq('id', uid);
    if (error) return showFeedback('Error: ' + error.message, 'error');
    showFeedback('Stats actualizadas.', 'ok');
    updateAllViews();
}
async function handleAdminMatch(event) {
    event.preventDefault();
    const w = document.getElementById('admin-match-winner').value;
    const l = document.getElementById('admin-match-loser').value;
    if (!w || !l) return showFeedback('Selecciona ganador y perdedor.', 'error');
    if (w === l) return showFeedback('Deben ser distintos.', 'error');
    const { error } = await supabase.from('matches').insert({
        winner_id: w, loser_id: l,
        winner_unique: document.getElementById('admin-match-unique-winner')?.checked || false,
        loser_unique: document.getElementById('admin-match-unique-loser')?.checked || false
    });
    if (error) return showFeedback('Error: ' + error.message, 'error');
    document.getElementById('admin-match-unique-winner').checked = false;
    document.getElementById('admin-match-unique-loser').checked = false;
    showFeedback('Partido registrado. La calle toma nota.', 'ok');
    updateAllViews();
}
async function handleBadge(action) {
    const uid = document.getElementById('admin-badge-user').value;
    const badge = document.getElementById('admin-badge-select').value;
    if (!uid) return showFeedback('Selecciona un hooper.', 'error');
    const { data: user } = await supabase.from('hoopers').select('badges').eq('id', uid).single();
    if (!user) return;
    let nb = user.badges || [];
    if (action === 'grant') { if (nb.includes(badge)) return showFeedback('Ya tiene esa insignia.', 'error'); nb.push(badge); }
    else { const b = nb.length; nb = nb.filter(x => x !== badge); if (nb.length === b) return showFeedback('No tenía esa insignia.', 'error'); }
    const { error } = await supabase.from('hoopers').update({ badges: nb }).eq('id', uid);
    if (error) return showFeedback('Error: ' + error.message, 'error');
    showFeedback(`Insignia ${action === 'grant' ? 'otorgada' : 'revocada'}.`, 'ok');
    updateAllViews();
}
async function handleAdminEdit(event) {
    event.preventDefault();
    const uid = document.getElementById('admin-edit-user-select').value;
    if (!uid) return showFeedback('Selecciona un hooper.', 'error');
    const updateData = { city: document.getElementById('admin-edit-city').value.trim() };
    const photoFile = document.getElementById('admin-edit-photo').files[0];
    if (photoFile) {
        try {
            const { data: u } = await supabase.from('hoopers').select('username').eq('id', uid).single();
            const compressed = await getCompressedPhoto(photoFile);
            updateData.avatar_url = await uploadAvatar(u.username, compressed);
        } catch (err) { return showFeedback(err.message, 'error'); }
    }
    const { error } = await supabase.from('hoopers').update(updateData).eq('id', uid);
    if (error) return showFeedback('Error: ' + error.message, 'error');
    showFeedback('Perfil actualizado.', 'ok');
    const pv = document.getElementById('admin-edit-photo-preview');
    if (pv) { pv.innerHTML = ''; pv.classList.remove('has-image'); }
    updateAllViews();
}
async function handleAdminDelete(event) {
    event.preventDefault();
    const uid = document.getElementById('admin-delete-select').value;
    if (!uid) return showFeedback('Selecciona un hooper.', 'error');
    const me = await getCurrentUser();
    if (uid === me.id) return showFeedback('No puedes eliminarte a ti mismo.', 'error');
    if (!window.confirm('¿Eliminar definitivamente del registro?')) return;
    const { error } = await supabase.from('hoopers').delete().eq('id', uid);
    if (error) return showFeedback('Error: ' + error.message, 'error');
    showFeedback('Usuario eliminado.', 'ok');
    updateAllViews();
}
async function loadTournamentSelects() {
    const { data } = await supabase.from('tournaments').select('id, name').eq('status', 'open').order('created_at', { ascending: false });
    const opts = data && data.length ? data.map(t => `<option value="${t.id}">${escapeHtml(t.name)}</option>`).join('') : '<option disabled value="">— Sin torneos —</option>';
    const a = document.getElementById('tournament-add-select');
    const c = document.getElementById('tournament-close-select');
    if (a) a.innerHTML = opts;
    if (c) c.innerHTML = opts;
}
async function loadTournamentParticipants() {
    const tid = document.getElementById('tournament-close-select').value;
    const sel = document.getElementById('tournament-close-participant');
    if (!sel) return;
    if (!tid) { sel.innerHTML = '<option disabled value="">— Elige torneo —</option>'; return; }
    const { data } = await supabase.from('tournament_participants').select('hooper:hoopers(id, username)').eq('tournament_id', tid);
    sel.innerHTML = data && data.length ? data.map(p => `<option value="${p.hooper.id}">${escapeHtml(p.hooper.username)}</option>`).join('') : '<option disabled value="">— Sin participantes —</option>';
}
async function handleCreateTournament(event) {
    event.preventDefault();
    const n = document.getElementById('tournament-name').value.trim();
    if (!n) return showFeedback('Falta el nombre del torneo.', 'error');
    const { error } = await supabase.from('tournaments').insert({ name: n, status: 'open' });
    if (error) return showFeedback('Error: ' + error.message, 'error');
    event.target.reset();
    showFeedback(`Torneo «${n}» abierto.`, 'ok');
    updateAllViews();
}
async function handleAddParticipant() {
    const t = document.getElementById('tournament-add-select').value;
    const h = document.getElementById('tournament-add-user').value;
    if (!t || !h) return showFeedback('Selecciona torneo y hooper.', 'error');
    const { error } = await supabase.from('tournament_participants').insert({ tournament_id: t, hooper_id: h });
    if (error) return showFeedback(error.code === '23505' ? 'Ya estaba inscrito.' : 'Error: ' + error.message, 'error');
    showFeedback('Hooper inscrito.', 'ok');
    updateAllViews();
}
async function handleCloseTournament(event) {
    event.preventDefault();
    const t = document.getElementById('tournament-close-select').value;
    const w = document.getElementById('tournament-close-participant').value;
    if (!t) return showFeedback('Selecciona un torneo.', 'error');
    const { error } = await supabase.from('tournaments').update({ status: 'closed', winner_id: w || null, closed_at: new Date().toISOString() }).eq('id', t);
    if (error) return showFeedback('Error: ' + error.message, 'error');
    if (w) {
        const { data: winner } = await supabase.from('hoopers').select('badges').eq('id', w).single();
        if (winner) {
            const nb = [...(winner.badges || [])];
            if (!nb.includes('DUEÑO DE LA PISTA')) nb.push('DUEÑO DE LA PISTA');
            if (!nb.includes('CAMPEÓN DE TORNEO')) nb.push('CAMPEÓN DE TORNEO');
            await supabase.from('hoopers').update({ badges: nb }).eq('id', w);
        }
    }
    showFeedback('Torneo cerrado. Corona entregada.', 'ok');
    updateAllViews();
}

// =========================================================
// VISIBILIDAD
// =========================================================
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
    await updateRanking();
    await renderTournaments();
    await renderProfile();
    await showAdminPanel();
    await toggleAuthViews();
}
async function loadEditUser() {
    const sel = document.getElementById('admin-edit-user-select');
    if (!sel) return;
    const uid = sel.value;
    if (!uid) return;
    const { data: u } = await supabase.from('hoopers').select('*').eq('id', uid).single();
    if (!u) return;
    document.getElementById('admin-edit-city').value = u.city || '';
    document.getElementById('admin-edit-photo-current').innerHTML = u.avatar_url
        ? `<img class="profile-photo" src="${u.avatar_url}" alt="${escapeHtml(u.username)}" />`
        : `<div class="admin-edit-photo-empty">Sin foto</div>`;
    forceColorPhotos();
}

// =========================================================
// MÚSICA (con manejo de errores y feedback visual)
// =========================================================
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
    if (audio.muted) { iconSound.style.display = 'none'; iconMuted.style.display = 'block'; }
    
    // Feedback visual si el MP3 no carga
    audio.addEventListener('error', () => {
        const err = document.createElement('span');
        err.className = 'music-error';
        err.textContent = '♪ MP3 no encontrado';
        player.appendChild(err);
        setTimeout(() => err.remove(), 5000);
    });
    
    toggle.addEventListener('click', () => {
        if (audio.paused) {
            audio.play().then(() => {
                iconPlay.style.display = 'none';
                iconPause.style.display = 'block';
            }).catch(err => {
                console.log('No se pudo reproducir:', err);
                const errEl = document.createElement('span');
                errEl.className = 'music-error';
                errEl.textContent = '♪ Error de reproducción';
                player.appendChild(errEl);
                setTimeout(() => errEl.remove(), 3000);
            });
        } else {
            audio.pause();
            iconPlay.style.display = 'block';
            iconPause.style.display = 'none';
        }
    });
    
    mute.addEventListener('click', () => {
        audio.muted = !audio.muted;
        localStorage.setItem('feelow_music_muted', audio.muted);
        iconSound.style.display = audio.muted ? 'none' : 'block';
        iconMuted.style.display = audio.muted ? 'block' : 'none';
    });
    
    audio.addEventListener('timeupdate', () => {
        if (audio.duration) progress.style.width = (audio.currentTime / audio.duration * 100) + '%';
    });
    
    audio.addEventListener('play', () => {
        iconPlay.style.display = 'none';
        iconPause.style.display = 'block';
    });
    
    audio.addEventListener('pause', () => {
        iconPlay.style.display = 'block';
        iconPause.style.display = 'none';
    });
}

// =========================================================
// CURSOR GRIS (lógica de la web 5PM, versión Leo)
// =========================================================
function initCursor() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const core = document.querySelector('.fh-cursor-core');
    const ring = document.querySelector('.fh-cursor-ring');
    if (!core || !ring) return;
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my, rx = mx, ry = my;
    window.addEventListener('pointermove', e => {
        mx = e.clientX; my = e.clientY;
        const el = document.elementFromPoint(mx, my);
        const interactive = el && el.closest('a, button, select, input, label, .ranking-row, .street-badge, .profile-badge-chip, .info-tooltip');
        ring.classList.toggle('is-active', !!interactive);
    }, { passive: true });
    (function loop() {
        cx += (mx - cx) * 0.35; cy += (my - cy) * 0.35;
        rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
        core.style.left = cx + 'px'; core.style.top = cy + 'px';
        ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
        requestAnimationFrame(loop);
    })();
}

// =========================================================
// INIT
// =========================================================
function init() {
    setupPhotoPreview('register-photo', 'register-photo-preview');
    setupPhotoPreview('edit-self-photo', 'edit-self-photo-preview');
    setupPhotoPreview('admin-edit-photo', 'admin-edit-photo-preview');

    document.getElementById('register-form')?.addEventListener('submit', handleRegister);
    document.getElementById('login-form')?.addEventListener('submit', handleLogin);
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
    document.getElementById('edit-self-form')?.addEventListener('submit', handleEditSelf);

    document.getElementById('admin-stats-form')?.addEventListener('submit', handleAdminStats);
    document.getElementById('admin-edit-form')?.addEventListener('submit', handleAdminEdit);
    document.getElementById('admin-delete-form')?.addEventListener('submit', handleAdminDelete);
    document.getElementById('admin-match-form')?.addEventListener('submit', handleAdminMatch);
    document.getElementById('admin-badge-grant')?.addEventListener('click', () => handleBadge('grant'));
    document.getElementById('admin-badge-revoke')?.addEventListener('click', () => handleBadge('revoke'));
    document.getElementById('admin-edit-user-select')?.addEventListener('change', loadEditUser);
    document.getElementById('admin-badge-select')?.addEventListener('change', updateBadgePreview);
    document.getElementById('tournament-close-select')?.addEventListener('change', () => { loadTournamentSelects(); loadTournamentParticipants(); });
    document.getElementById('tournament-create-form')?.addEventListener('submit', handleCreateTournament);
    document.getElementById('tournament-add-btn')?.addEventListener('click', handleAddParticipant);
    document.getElementById('tournament-close-form')?.addEventListener('submit', handleCloseTournament);

    document.getElementById('profile-modal-close')?.addEventListener('click', closeProfileModal);
    const modal = document.getElementById('profile-modal');
    if (modal) modal.addEventListener('click', e => { if (e.target === modal) closeProfileModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeProfileModal(); });

    initMusicPlayer();
    initCursor();
    updateAllViews();
}
init();