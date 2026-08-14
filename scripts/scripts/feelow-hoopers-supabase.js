// =========================================================
// FEELOW HOOPERS - Versión Supabase (Base de datos real)
// =========================================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Configuración de Supabase (REEMPLAZA CON TUS CREDENCIALES)
const SUPABASE_URL = 'https://olcakitusgghaiphdtgh.supabase.co/rest/v1/';
const SUPABASE_ANON_KEY = 'sb_publishable_UMAQd1Zry4pbp2wHSFxNwA_MBjD9N2z';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =========================================================
// CONSTANTES Y CONFIGURACIÓN
// =========================================================

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

// =========================================================
// UTILIDADES
// =========================================================

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
    const photo = user.avatar_url || getDefaultAvatar();
    return `<img class="${className}" src="${photo}" alt="${escapeHtml(user.username)}" loading="lazy" />`;
}

// =========================================================
// COMPRESIÓN DE FOTOS
// =========================================================

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
        img.onerror = () => reject(new Error('La imagen está corrupta o no se pudo procesar.'));
        img.src = dataUrl;
    });
}

// =========================================================
// FEEDBACK
// =========================================================

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

// =========================================================
// AUTENTICACIÓN
// =========================================================

async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data: profile } = await supabase
        .from('hoopers')
        .select('*')
        .eq('id', user.id)
        .single();
    
    return profile;
}

async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const email = document.getElementById('register-email').value.trim();
    const city = document.getElementById('register-city').value.trim();
    const photoFile = document.getElementById('register-photo').files[0];

    if (username.length < 3) {
        showFeedback('El usuario debe tener al menos 3 caracteres.', 'error');
        return;
    }
    if (password.length < 4) {
        showFeedback('La contraseña debe tener al menos 4 caracteres.', 'error');
        return;
    }
    if (!email || !email.includes('@')) {
        showFeedback('Email inválido.', 'error');
        return;
    }

    let avatarUrl = null;
    if (photoFile) {
        try {
            const compressed = await getCompressedPhoto(photoFile);
            avatarUrl = await uploadAvatar(username, compressed);
        } catch (err) {
            showFeedback(err.message || 'No se pudo procesar la foto.', 'error');
            return;
        }
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                username: username,
                avatar_url: avatarUrl,
                city: city
            }
        }
    });

    if (error) {
        showFeedback('Error: ' + error.message, 'error');
        return;
    }

    showFeedback(`Bienvenido, ${username}. Verifica tu email para activar la cuenta.`, 'ok');
    event.target.reset();
    updateAllViews();
}

async function uploadAvatar(username, dataUrl) {
    const fileName = `${username}-${Date.now()}.jpg`;
    const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, dataUrlToBlob(dataUrl), {
            contentType: 'image/jpeg',
            upsert: false
        });

    if (error) throw new Error('No se pudo subir la foto.');

    const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

    return urlData.publicUrl;
}

function dataUrlToBlob(dataUrl) {
    const parts = dataUrl.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const u8arr = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; ++i) {
        u8arr[i] = raw.charCodeAt(i);
    }
    return new Blob([u8arr], { type: contentType });
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        showFeedback('Email y contraseña requeridos.', 'error');
        return;
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        showFeedback('Credenciales incorrectas.', 'error');
        return;
    }

    showFeedback('Sesión iniciada correctamente.', 'ok');
    event.target.reset();
    updateAllViews();
}

async function handleLogout() {
    await supabase.auth.signOut();
    showFeedback('Sesión cerrada.', 'ok');
    updateAllViews();
}

// =========================================================
// RANKING
// =========================================================

async function updateRanking() {
    const { data: users, error } = await supabase
        .from('hoopers')
        .select('*')
        .order('rep', { ascending: false })
        .limit(50);

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
            <td class="ju-cell">${user.unique_games || 0}</td>
            <td>${user.matches || 0}</td>
            <td>${user.losses || 0}</td>
            <td><span class="score-cell">${user.rep || 0}</span></td>
            <td class="streak-cell">${streakLabel(user.streak || 0)}</td>
        `;

        row.addEventListener('click', () => openProfileModal(user.id));
        tbody.appendChild(row);
    });
}

// =========================================================
// PERFIL
// =========================================================

async function renderProfile() {
    const profileView = document.getElementById('profile-view');
    if (!profileView) return;

    const user = await getCurrentUser();
    if (!user) {
        profileView.innerHTML = '<p class="is-empty">No has iniciado sesión.</p>';
        return;
    }

    const { data: allUsers } = await supabase
        .from('hoopers')
        .select('id, rep')
        .order('rep', { ascending: false });
    
    const position = allUsers.findIndex(u => u.id === user.id) + 1;
    const tier = tierByPosition(position || 999);

    const badgesHtml = (user.badges && user.badges.length)
        ? user.badges.map((b) => {
            const meta = getBadgeMeta(b);
            return `<button type="button" class="profile-badge-chip ${meta.cls}" data-badge="${escapeHtml(b)}" title="${escapeHtml(meta.title || b)}">
                <span class="profile-badge-emoji">${escapeHtml(meta.emoji || '·')}</span>
                <span class="profile-badge-label">${escapeHtml(meta.title || b)}</span>
            </button>`;
        }).join('')
        : '<span class="is-empty">Sin insignias</span>';

    profileView.innerHTML = `
        <div class="profile-card">
            ${getPhotoElement(user, 'profile-photo')}
            <div>
                <h3>${escapeHtml(user.username)}</h3>
                <p>${user.city ? escapeHtml(user.city) : 'Ubicación desconocida'}</p>
                <p>Registro · ${formatDate(user.created_at)}</p>
                <p class="profile-rep-line"><strong>${user.rep || 0}</strong> REP · <span class="profile-tier-tag ${tier.cls}">${tier.label}</span></p>
            </div>
        </div>
        <div class="profile-stats">
            <div><span>Torneos</span><strong>${user.tournaments || 0}</strong></div>
            <div><span>Partidos</span><strong>${user.matches || 0}</strong></div>
            <div><span>Victorias</span><strong>${user.wins}</strong></div>
            <div><span>Juego Único</span><strong>${user.unique_games || 0}</strong></div>
        </div>
        <div class="profile-badges">${badgesHtml}</div>
        <div id="profile-badge-detail" class="badge-detail-card">Pulsa una insignia para ver su significado.</div>
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

// =========================================================
// TORNEOS
// =========================================================

async function renderTournaments() {
    const list = document.getElementById('tournaments-list');
    if (!list) return;

    const { data: tournaments } = await supabase
        .from('tournaments')
        .select(`
            *,
            winner:hoopers!tournaments_winner_id_fkey(username),
            participants:tournament_participants(
                hooper:hoopers!tournament_participants_hooper_id_fkey(username)
            )
        `)
        .order('created_at', { ascending: false });

    list.innerHTML = '';

    if (!tournaments || !tournaments.length) {
        list.innerHTML = `<div class="tournament-empty">No hay torneos registrados todavía.</div>`;
        return;
    }

    tournaments.forEach((ev) => {
        const card = document.createElement('article');
        card.className = `tournament-card is-${ev.status}`;
        
        const participantsList = ev.participants.map(p => p.hooper.username).join(', ') || 'Sin participantes';
        
        card.innerHTML = `
            <header class="tournament-head">
                <div>
                    <span class="tournament-status ${ev.status}">${ev.status === 'open' ? 'En curso' : 'Cerrado'}</span>
                    <h3>${escapeHtml(ev.name)}</h3>
                    <p class="tournament-date">Iniciado · ${formatDate(ev.created_at)}</p>
                    ${ev.closed_at ? `<p class="tournament-date">Cerrado · ${formatDate(ev.closed_at)}</p>` : ''}
                </div>
                ${ev.winner ? `<div class="tournament-winner">Campeón<div class="tournament-winner-name">${escapeHtml(ev.winner.username)}</div></div>` : ''}
            </header>
            <div class="tournament-participants">
                ${participantsList}
            </div>
        `;
        list.appendChild(card);
    });
}

// =========================================================
// MODAL DE PERFIL
// =========================================================

async function openProfileModal(userId) {
    const { data: user } = await supabase
        .from('hoopers')
        .select('*')
        .eq('id', userId)
        .single();

    if (!user) return;

    const { data: allUsers } = await supabase
        .from('hoopers')
        .select('id, rep')
        .order('rep', { ascending: false });
    
    const position = allUsers.findIndex(u => u.id === user.id) + 1;
    const tier = tierByPosition(position || 999);

    const dialog = document.getElementById('profile-modal');
    if (!dialog) return;

    const photo = user.avatar_url || getDefaultAvatar();

    document.getElementById('profile-modal-photo').src = photo;
    document.getElementById('profile-modal-photo').alt = `Foto de ${user.username}`;
    document.getElementById('profile-modal-name').textContent = user.username;
    document.getElementById('profile-modal-city').textContent = user.city || 'Ubicación desconocida';
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

// =========================================================
// PANEL DE ADMINISTRACIÓN
// =========================================================

async function showAdminPanel() {
    const adminPanel = document.getElementById('admin-panel');
    if (!adminPanel) return;

    const user = await getCurrentUser();
    const isAdmin = user && user.role === 'admin';
    adminPanel.classList.toggle('hidden', !isAdmin);

    if (isAdmin) {
        updateAdminSelects();
    }
}

async function updateAdminSelects() {
    const { data: users } = await supabase
        .from('hoopers')
        .select('id, username')
        .order('username');

    if (!users) return;

    const userOptions = users.map(u => `<option value="${u.id}">${escapeHtml(u.username)}</option>`).join('');

    ['admin-user-select', 'admin-edit-user-select', 'admin-badge-user', 'admin-delete-select', 'tournament-add-user'].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerHTML = userOptions || '<option disabled>— Sin hoopers —</option>';
    });

    ['admin-match-winner', 'admin-match-loser'].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerHTML = userOptions || '<option disabled>— Sin hoopers —</option>';
    });

    await loadTournamentSelects();
    updateBadgePreview();
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

// =========================================================
// HANDLERS DE ADMINISTRACIÓN
// =========================================================

async function handleAdminStats(event) {
    event.preventDefault();

    const userId = document.getElementById('admin-user-select').value;
    const wins = Math.max(0, Number(document.getElementById('admin-wins').value || 0));
    const uniqueGames = Math.max(0, Number(document.getElementById('admin-unique-games').value || 0));
    const tournaments = Math.max(0, Number(document.getElementById('admin-tournaments').value || 0));
    const matches = Math.max(0, Number(document.getElementById('admin-matches').value || 0));

    if (!userId) { showFeedback('Selecciona un hooper.', 'error'); return; }

    const { error } = await supabase
        .from('hoopers')
        .update({ wins, unique_games: uniqueGames, tournaments, matches })
        .eq('id', userId);

    if (error) {
        showFeedback('Error: ' + error.message, 'error');
        return;
    }

    showFeedback('Stats actualizadas. REP recalculada automáticamente.', 'ok');
    updateAllViews();
}

async function handleAdminMatch(event) {
    event.preventDefault();

    const winnerId = document.getElementById('admin-match-winner').value;
    const loserId = document.getElementById('admin-match-loser').value;
    const winnerUnique = document.getElementById('admin-match-unique-winner')?.checked || false;
    const loserUnique = document.getElementById('admin-match-unique-loser')?.checked || false;

    if (!winnerId || !loserId) {
        showFeedback('Selecciona ganador y perdedor.', 'error'); return;
    }
    if (winnerId === loserId) {
        showFeedback('Ganador y perdedor deben ser distintos.', 'error'); return;
    }

    const { error } = await supabase
        .from('matches')
        .insert({
            winner_id: winnerId,
            loser_id: loserId,
            winner_unique: winnerUnique,
            loser_unique: loserUnique
        });

    if (error) {
        showFeedback('Error: ' + error.message, 'error');
        return;
    }

    document.getElementById('admin-match-unique-winner').checked = false;
    document.getElementById('admin-match-unique-loser').checked = false;

    showFeedback('Enfrentamiento registrado. Stats y REP actualizadas.', 'ok');
    updateAllViews();
}

async function handleBadge(action) {
    const userId = document.getElementById('admin-badge-user').value;
    const badge = document.getElementById('admin-badge-select').value;
    if (!userId) { showFeedback('Selecciona un hooper.', 'error'); return; }

    const { data: user } = await supabase
        .from('hoopers')
        .select('badges')
        .eq('id', userId)
        .single();

    if (!user) return;

    let newBadges = user.badges || [];

    if (action === 'grant') {
        if (!newBadges.includes(badge)) {
            newBadges.push(badge);
        } else {
            showFeedback(`${userId} ya tiene esa insignia.`, 'error');
            return;
        }
    } else {
        const before = newBadges.length;
        newBadges = newBadges.filter(b => b !== badge);
        if (newBadges.length === before) {
            showFeedback('No tenía esa insignia.', 'error');
            return;
        }
    }

    const { error } = await supabase
        .from('hoopers')
        .update({ badges: newBadges })
        .eq('id', userId);

    if (error) {
        showFeedback('Error: ' + error.message, 'error');
        return;
    }

    showFeedback(`Insignia ${action === 'grant' ? 'otorgada' : 'revocada'}. REP recalculada.`, 'ok');
    updateAllViews();
}

async function handleAdminEdit(event) {
    event.preventDefault();

    const userId = document.getElementById('admin-edit-user-select').value;
    const city = document.getElementById('admin-edit-city').value.trim();
    const photoFile = document.getElementById('admin-edit-photo').files[0];

    if (!userId) { showFeedback('Selecciona un hooper.', 'error'); return; }

    let updateData = { city };

    if (photoFile) {
        try {
            const { data: user } = await supabase
                .from('hoopers')
                .select('username')
                .eq('id', userId)
                .single();
            
            const compressed = await getCompressedPhoto(photoFile);
            const avatarUrl = await uploadAvatar(user.username, compressed);
            updateData.avatar_url = avatarUrl;
        } catch (err) {
            showFeedback(err.message || 'No se pudo procesar la foto.', 'error');
            return;
        }
    }

    const { error } = await supabase
        .from('hoopers')
        .update(updateData)
        .eq('id', userId);

    if (error) {
        showFeedback('Error: ' + error.message, 'error');
        return;
    }

    showFeedback('Perfil actualizado.', 'ok');
    updateAllViews();
}

async function handleAdminDelete(event) {
    event.preventDefault();
    const userId = document.getElementById('admin-delete-select').value;
    if (!userId) { showFeedback('Selecciona un hooper.', 'error'); return; }

    const user = await getCurrentUser();
    if (userId === user.id) {
        showFeedback('No puedes eliminar tu propia cuenta.', 'error');
        return;
    }

    const confirm = window.confirm('¿Eliminar definitivamente este usuario?');
    if (!confirm) return;

    const { error } = await supabase
        .from('hoopers')
        .delete()
        .eq('id', userId);

    if (error) {
        showFeedback('Error: ' + error.message, 'error');
        return;
    }

    showFeedback('Usuario eliminado del registro.', 'ok');
    updateAllViews();
}

// =========================================================
// GESTIÓN DE TORNEOS
// =========================================================

async function loadTournamentSelects() {
    const { data: tournaments } = await supabase
        .from('tournaments')
        .select('id, name')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

    const opts = tournaments && tournaments.length
        ? tournaments.map(t => `<option value="${t.id}">${escapeHtml(t.name)}</option>`).join('')
        : '<option disabled value="">— Sin torneos abiertos —</option>';

    const addSel = document.getElementById('tournament-add-select');
    const closeSel = document.getElementById('tournament-close-select');
    if (addSel) addSel.innerHTML = opts;
    if (closeSel) closeSel.innerHTML = opts;
}

async function handleCreateTournament(event) {
    event.preventDefault();

    const name = document.getElementById('tournament-name').value.trim();
    if (!name) { showFeedback('El torneo necesita un nombre.', 'error'); return; }

    const { error } = await supabase
        .from('tournaments')
        .insert({ name, status: 'open' });

    if (error) {
        showFeedback('Error: ' + error.message, 'error');
        return;
    }

    event.target.reset();
    showFeedback(`Torneo «${name}» creado.`, 'ok');
    updateAllViews();
}

async function handleAddParticipant() {
    const tournamentId = document.getElementById('tournament-add-select').value;
    const hooperId = document.getElementById('tournament-add-user').value;
    if (!tournamentId || !hooperId) { showFeedback('Selecciona torneo y hooper.', 'error'); return; }

    const { error } = await supabase
        .from('tournament_participants')
        .insert({ tournament_id: tournamentId, hooper_id: hooperId });

    if (error) {
        if (error.code === '23505') {
            showFeedback('Ya estaba inscrito.', 'error');
        } else {
            showFeedback('Error: ' + error.message, 'error');
        }
        return;
    }

    showFeedback('Hooper inscrito en el torneo.', 'ok');
    updateAllViews();
}

async function handleCloseTournament(event) {
    event.preventDefault();

    const tournamentId = document.getElementById('tournament-close-select').value;
    const winnerId = document.getElementById('tournament-close-participant').value;
    if (!tournamentId) { showFeedback('Selecciona un torneo.', 'error'); return; }

    const { error } = await supabase
        .from('tournaments')
        .update({
            status: 'closed',
            winner_id: winnerId || null,
            closed_at: new Date().toISOString()
        })
        .eq('id', tournamentId);

    if (error) {
        showFeedback('Error: ' + error.message, 'error');
        return;
    }

    // Otorgar insignias al campeón
    if (winnerId) {
        const { data: winner } = await supabase
            .from('hoopers')
            .select('badges')
            .eq('id', winnerId)
            .single();

        if (winner) {
            const newBadges = [...(winner.badges || [])];
            if (!newBadges.includes('DUEÑO DE LA PISTA')) newBadges.push('DUEÑO DE LA PISTA');
            if (!newBadges.includes('CAMPEÓN DE TORNEO')) newBadges.push('CAMPEÓN DE TORNEO');

            await supabase
                .from('hoopers')
                .update({ badges: newBadges })
                .eq('id', winnerId);
        }
    }

    showFeedback('Torneo cerrado.', 'ok');
    updateAllViews();
}

// =========================================================
// VISIBILIDAD
// =========================================================

async function toggleAuthViews() {
    const user = await getCurrentUser();
    const authPanel = document.querySelector('.auth-panel');
    const profilePanel = document.getElementById('user-profile');
    if (!authPanel || !profilePanel) return;

    if (user) {
        authPanel.classList.add('hidden');
        profilePanel.classList.remove('hidden');
    } else {
        authPanel.classList.remove('hidden');
        profilePanel.classList.add('hidden');
    }
}

// =========================================================
// ORQUESTACIÓN
// =========================================================

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

async function init() {
    initBackgroundMotion();

    // Auth
    document.getElementById('register-form')?.addEventListener('submit', handleRegister);
    document.getElementById('login-form')?.addEventListener('submit', handleLogin);
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);

    // Admin usuarios
    document.getElementById('admin-stats-form')?.addEventListener('submit', handleAdminStats);
    document.getElementById('admin-edit-form')?.addEventListener('submit', handleAdminEdit);
    document.getElementById('admin-delete-form')?.addEventListener('submit', handleAdminDelete);
    document.getElementById('admin-match-form')?.addEventListener('submit', handleAdminMatch);

    // Insignias
    document.getElementById('admin-badge-grant')?.addEventListener('click', () => handleBadge('grant'));
    document.getElementById('admin-badge-revoke')?.addEventListener('click', () => handleBadge('revoke'));

    document.getElementById('admin-edit-user-select')?.addEventListener('change', loadEditUser);
    document.getElementById('admin-badge-select')?.addEventListener('change', updateBadgePreview);
    document.getElementById('tournament-close-select')?.addEventListener('change', loadTournamentSelects);

    // Torneos
    document.getElementById('tournament-create-form')?.addEventListener('submit', handleCreateTournament);
    document.getElementById('tournament-add-btn')?.addEventListener('click', handleAddParticipant);
    document.getElementById('tournament-close-form')?.addEventListener('submit', handleCloseTournament);

    // Modal
    document.getElementById('profile-modal-close')?.addEventListener('click', closeProfileModal);
    const modal = document.getElementById('profile-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeProfileModal();
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeProfileModal();
    });

    await updateAllViews();
}

async function loadEditUser() {
    const select = document.getElementById('admin-edit-user-select');
    if (!select) return;

    const userId = select.value;
    if (!userId) return;

    const { data: user } = await supabase
        .from('hoopers')
        .select('*')
        .eq('id', userId)
        .single();

    if (!user) return;

    document.getElementById('admin-edit-city').value = user.city || '';
    document.getElementById('admin-edit-photo-current').innerHTML = user.avatar_url
        ? `<img class="profile-photo" src="${user.avatar_url}" alt="Foto actual de ${escapeHtml(user.username)}" />`
        : `<div class="admin-edit-photo-empty">Sin foto</div>`;
}

init();