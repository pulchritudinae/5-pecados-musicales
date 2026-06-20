const STORAGE_KEY = 'feelow-hoopers-users';
const DEFAULT_ADMIN = 'LeoFeelow';
const DEFAULT_ADMIN_PASSWORD = 'pecadomusical';

function loadUsers() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        const seed = [
            { id: 1, username: 'Leo', city: 'Madrid', photo: '', wins: 12, losses: 4, joinedAt: '2026-06-01', badges: ['Primer Hooper', 'Campeón del torneo'] },
            { id: 2, username: 'Rook', city: 'Barcelona', photo: '', wins: 9, losses: 7, joinedAt: '2026-06-02', badges: ['Participante fundador'] }
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
        return seed;
    }
    return JSON.parse(raw);
}

function saveUsers(users) { localStorage.setItem(STORAGE_KEY, JSON.stringify(users)); }
function getCurrentUser() { return localStorage.getItem('feelow-hoopers-current-user'); }
function setCurrentUser(username) { localStorage.setItem('feelow-hoopers-current-user', username); }
function clearCurrentUser() { localStorage.removeItem('feelow-hoopers-current-user'); }

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
}

function getPhotoData(file) {
    return new Promise((resolve) => {
        if (!file) { resolve(''); return; }
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
    });
}

function scoreForUser(user) { return user.wins * 3 - user.losses; }

function sortUsers(users) {
    return [...users].sort((a, b) => {
        const scoreDiff = scoreForUser(b) - scoreForUser(a);
        if (scoreDiff !== 0) return scoreDiff;
        return a.username.localeCompare(b.username);
    });
}

// NUEVO AVATAR MINIMALISTA (Balón gris puro)
function getDefaultAvatar() {
    const svg = `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="46" fill="#111111" stroke="#444444" stroke-width="4"/>
            <path d="M 4 50 Q 50 70 96 50" fill="none" stroke="#444444" stroke-width="4"/>
            <path d="M 50 4 Q 30 50 50 96" fill="none" stroke="#444444" stroke-width="4"/>
        </svg>
    `;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function getPhotoElement(user, className) {
    const photo = user.photo || getDefaultAvatar();
    return `<img class="${className}" src="${photo}" alt="${user.username}" />`;
}

function updateRanking() {
    const users = sortUsers(loadUsers());
    const tbody = document.getElementById('ranking-body');
    tbody.innerHTML = '';

    users.forEach((user, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="color: #666;">0${index + 1}</td>
            <td>${getPhotoElement(user, 'ranking-photo')}</td>
            <td style="font-weight: bold;">${user.username}</td>
            <td>${user.wins}</td>
            <td style="color: #666;">${user.losses}</td>
            <td style="color: var(--gold); font-weight: bold;">${scoreForUser(user)}</td>
        `;
        tbody.appendChild(row);
    });
}

function renderProfile() {
    const profileView = document.getElementById('profile-view');
    const currentUser = getCurrentUser();
    
    if (!currentUser) return;

    const users = loadUsers();
    // Permitir al Admin ver un perfil genérico si no está en la DB
    let user = users.find((entry) => entry.username === currentUser);
    
    if (!user && currentUser === DEFAULT_ADMIN) {
        user = { username: 'ADMIN LEO', city: 'System', wins: 99, losses: 0, joinedAt: new Date().toISOString(), badges: ['Admin'] };
    } else if (!user) {
        clearCurrentUser();
        return;
    }

    profileView.innerHTML = `
        <div class="profile-card">
            ${getPhotoElement(user, 'profile-photo')}
            <div>
                <h3>${user.username}</h3>
                <p>Ubicación: ${user.city || 'Desconocida'}</p>
                <p>Registro: ${formatDate(user.joinedAt)}</p>
            </div>
        </div>
        <div class="profile-stats">
            <div><span>Victorias</span><strong>${user.wins}</strong></div>
            <div><span>Derrotas</span><strong>${user.losses}</strong></div>
        </div>
        <div class="profile-badges">
            ${user.badges && user.badges.length ? user.badges.map((badge) => `<span>${badge}</span>`).join('') : '<span style="background:transparent; border:1px dashed #333;">Sin insignias</span>'}
        </div>
    `;
}

function updateAdminSelects() {
    const users = loadUsers();
    const selects = ['admin-user-select', 'admin-result-user', 'admin-badge-user'];
    
    selects.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '';
    });

    users.forEach((user) => {
        const option = document.createElement('option');
        option.value = user.username;
        option.textContent = user.username;
        selects.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.appendChild(option.cloneNode(true));
        });
    });
}

function showAdminPanel() {
    const adminPanel = document.getElementById('admin-panel');
    const current = getCurrentUser();
    if (adminPanel) {
        if (current === DEFAULT_ADMIN) {
            adminPanel.classList.remove('hidden');
        } else {
            adminPanel.classList.add('hidden');
        }
    }
}

function toggleAuthViews() {
    const current = getCurrentUser();
    const authPanel = document.querySelector('.auth-panel');
    const profilePanel = document.getElementById('user-profile');
    
    if (current) {
        authPanel.classList.add('hidden');
        profilePanel.classList.remove('hidden');
    } else {
        authPanel.classList.remove('hidden');
        profilePanel.classList.add('hidden');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('register-username').value.trim();
    const city = document.getElementById('register-city').value.trim();
    const photoFile = document.getElementById('register-photo').files[0];
    if (!username) return;

    const users = loadUsers();
    if (users.some((user) => user.username.toLowerCase() === username.toLowerCase())) {
        alert('Ese usuario ya existe.');
        return;
    }

    const photo = await getPhotoData(photoFile);
    const newUser = {
        id: Date.now(), username, city, photo, wins: 0, losses: 0, joinedAt: new Date().toISOString(), badges: []
    };

    users.push(newUser);
    saveUsers(users);
    setCurrentUser(username);
    
    event.target.reset();
    updateAllViews();
}

function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username) return;

    // LÓGICA ADMINISTRADOR LEO
    if (username === DEFAULT_ADMIN && password === DEFAULT_ADMIN_PASSWORD) {
        setCurrentUser(DEFAULT_ADMIN);
        document.getElementById('login-password').value = '';
        updateAllViews();
        return;
    }

    const users = loadUsers();
    const found = users.find((user) => user.username.toLowerCase() === username.toLowerCase());
    if (!found) {
        alert('No existe ese participante.');
        return;
    }

    setCurrentUser(found.username);
    updateAllViews();
}

function handleAdminCreate(event) {
    event.preventDefault();
    const username = document.getElementById('admin-create-username').value.trim();
    const city = document.getElementById('admin-create-city').value.trim();
    const photoFile = document.getElementById('admin-create-photo').files[0];
    if (!username) return;

    const users = loadUsers();
    if (users.some((user) => user.username.toLowerCase() === username.toLowerCase())) {
        alert('Ese usuario ya existe.');
        return;
    }

    const newUser = { id: Date.now(), username, city, photo: '', wins: 0, losses: 0, joinedAt: new Date().toISOString(), badges: [] };

    if (photoFile) {
        getPhotoData(photoFile).then((photo) => {
            newUser.photo = photo;
            users.push(newUser);
            saveUsers(users);
            event.target.reset();
            updateAllViews();
        });
        return;
    }

    users.push(newUser);
    saveUsers(users);
    event.target.reset();
    updateAllViews();
}

function handleAdminStats(event) {
    event.preventDefault();
    const username = document.getElementById('admin-user-select').value;
    const wins = Number(document.getElementById('admin-wins').value || 0);
    const losses = Number(document.getElementById('admin-losses').value || 0);
    const users = loadUsers();

    const target = users.find((user) => user.username === username);
    if (!target) return;

    target.wins = wins;
    target.losses = losses;
    saveUsers(users);
    updateAllViews();
}

function handleResult(type) {
    const username = document.getElementById('admin-result-user').value;
    const users = loadUsers();
    const target = users.find((user) => user.username === username);
    if (!target) return;

    if (type === 'win') target.wins += 1;
    else target.losses += 1;
    
    saveUsers(users);
    updateAllViews();
}

function handleBadges(event) {
    event.preventDefault();
    const username = document.getElementById('admin-badge-user').value;
    const badge = document.getElementById('admin-badge-select').value;
    const users = loadUsers();
    const target = users.find((user) => user.username === username);
    if (!target) return;

    if (!target.badges) target.badges = [];
    if (!target.badges.includes(badge)) {
        target.badges.push(badge);
    }
    saveUsers(users);
    updateAllViews();
}

function updateAllViews() {
    updateAdminSelects();
    updateRanking();
    renderProfile();
    showAdminPanel();
    toggleAuthViews();
}

function init() {
    // Listeners
    const regForm = document.getElementById('register-form');
    const logForm = document.getElementById('login-form');
    const adminCreate = document.getElementById('admin-create-form');
    const adminStats = document.getElementById('admin-stats-form');
    const winBtn = document.getElementById('admin-win-btn');
    const lossBtn = document.getElementById('admin-loss-btn');
    const badgeForm = document.getElementById('admin-badges-form');

    if (regForm) regForm.addEventListener('submit', handleRegister);
    if (logForm) logForm.addEventListener('submit', handleLogin);
    if (adminCreate) adminCreate.addEventListener('submit', handleAdminCreate);
    if (adminStats) adminStats.addEventListener('submit', handleAdminStats);
    if (winBtn) winBtn.addEventListener('click', () => handleResult('win'));
    if (lossBtn) lossBtn.addEventListener('click', () => handleResult('loss'));
    if (badgeForm) badgeForm.addEventListener('submit', handleBadges);

    // Inicializar UI
    updateAllViews();
}

init();