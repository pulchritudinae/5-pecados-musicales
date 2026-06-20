const STORAGE_KEY = 'feelow-hoopers-users';
const ADMIN_KEY = 'feelow-hoopers-admin';
const DEFAULT_ADMIN = 'leo';

const badgeOptions = [
  'Primer Hooper',
  'Campeón del torneo',
  'Participante fundador',
  'Derrotó a Leo',
  'Top 10 histórico'
];

function loadUsers() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seed = [
      {
        id: 1,
        username: 'Leo',
        city: 'Madrid',
        photo: '',
        wins: 12,
        losses: 4,
        joinedAt: '2026-06-01',
        badges: ['Primer Hooper', 'Campeón del torneo']
      },
      {
        id: 2,
        username: 'Rook',
        city: 'Barcelona',
        photo: '',
        wins: 9,
        losses: 7,
        joinedAt: '2026-06-02',
        badges: ['Participante fundador']
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(raw);
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function getCurrentUser() {
  return localStorage.getItem('feelow-hoopers-current-user');
}

function setCurrentUser(username) {
  localStorage.setItem('feelow-hoopers-current-user', username);
}

function clearCurrentUser() {
  localStorage.removeItem('feelow-hoopers-current-user');
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function getPhotoData(file) {
  return new Promise((resolve) => {
    if (!file) {
      resolve('');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

function scoreForUser(user) {
  return user.wins * 3 - user.losses;
}

function sortUsers(users) {
  return [...users].sort((a, b) => {
    const scoreDiff = scoreForUser(b) - scoreForUser(a);
    if (scoreDiff !== 0) return scoreDiff;
    return a.username.localeCompare(b.username);
  });
}

function updateRanking() {
  const users = sortUsers(loadUsers());
  const tbody = document.getElementById('ranking-body');
  tbody.innerHTML = '';

  users.forEach((user, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td><img class="ranking-photo" src="${user.photo || 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=120&q=80'}" alt="${user.username}" /></td>
      <td>${user.username}</td>
      <td>${user.wins}</td>
      <td>${user.losses}</td>
      <td>${scoreForUser(user)}</td>
    `;
    tbody.appendChild(row);
  });
}

function renderProfile() {
  const profileView = document.getElementById('profile-view');
  const currentUser = getCurrentUser();
  if (!currentUser) {
    profileView.innerHTML = '<p class="empty-state">No hay sesión activa.</p>';
    return;
  }

  const users = loadUsers();
  const user = users.find((entry) => entry.username === currentUser);
  if (!user) {
    clearCurrentUser();
    profileView.innerHTML = '<p class="empty-state">Usuario no encontrado.</p>';
    return;
  }

  profileView.innerHTML = `
    <div class="profile-card">
      <img class="profile-photo" src="${user.photo || 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=120&q=80'}" alt="${user.username}" />
      <div>
        <h3>${user.username}</h3>
        <p><strong>Entrada:</strong> ${formatDate(user.joinedAt)}</p>
        <p><strong>Ciudad:</strong> ${user.city || 'Sin ciudad'}</p>
      </div>
    </div>
    <div class="profile-stats">
      <div><span>Torneos jugados</span><strong>0</strong></div>
      <div><span>Partidos jugados</span><strong>${user.wins + user.losses}</strong></div>
      <div><span>Victorias</span><strong>${user.wins}</strong></div>
      <div><span>Derrotas</span><strong>${user.losses}</strong></div>
    </div>
    <div class="profile-badges">
      ${user.badges && user.badges.length ? user.badges.map((badge) => `<span>${badge}</span>`).join('') : '<span>Sin insignias</span>'}
    </div>
  `;
}

function updateAdminSelects() {
  const users = loadUsers();
  const userSelect = document.getElementById('admin-user-select');
  const resultUser = document.getElementById('admin-result-user');
  const badgeUser = document.getElementById('admin-badge-user');

  [userSelect, resultUser, badgeUser].forEach((select) => {
    select.innerHTML = '';
  });

  users.forEach((user) => {
    const option = document.createElement('option');
    option.value = user.username;
    option.textContent = user.username;
    [userSelect, resultUser, badgeUser].forEach((select) => {
      select.appendChild(option.cloneNode(true));
    });
  });
}

function showAdminPanel() {
  const adminPanel = document.getElementById('admin-panel');
  const current = getCurrentUser();
  adminPanel.classList.toggle('hidden', current !== DEFAULT_ADMIN);
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
    id: Date.now(),
    username,
    city,
    photo,
    wins: 0,
    losses: 0,
    joinedAt: new Date().toISOString(),
    badges: []
  };

  users.push(newUser);
  saveUsers(users);
  setCurrentUser(username);
  updateAdminSelects();
  updateRanking();
  renderProfile();
  showAdminPanel();
  event.target.reset();
}

function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  if (!username) return;

  const users = loadUsers();
  const found = users.find((user) => user.username.toLowerCase() === username.toLowerCase());
  if (!found) {
    alert('No existe ese participante.');
    return;
  }

  setCurrentUser(username);
  updateRanking();
  renderProfile();
  showAdminPanel();
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

  const newUser = {
    id: Date.now(),
    username,
    city,
    photo: '',
    wins: 0,
    losses: 0,
    joinedAt: new Date().toISOString(),
    badges: []
  };

  if (photoFile) {
    getPhotoData(photoFile).then((photo) => {
      newUser.photo = photo;
      users.push(newUser);
      saveUsers(users);
      updateAdminSelects();
      updateRanking();
      renderProfile();
      event.target.reset();
    });
    return;
  }

  users.push(newUser);
  saveUsers(users);
  updateAdminSelects();
  updateRanking();
  renderProfile();
  event.target.reset();
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
  updateRanking();
  renderProfile();
}

function handleResult(type) {
  const username = document.getElementById('admin-result-user').value;
  const users = loadUsers();
  const target = users.find((user) => user.username === username);
  if (!target) return;

  if (type === 'win') {
    target.wins += 1;
  } else {
    target.losses += 1;
  }
  saveUsers(users);
  updateRanking();
  if (getCurrentUser() === target.username) {
    renderProfile();
  }
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
  if (getCurrentUser() === target.username) {
    renderProfile();
  }
}

function init() {
  document.getElementById('register-form').addEventListener('submit', handleRegister);
  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('admin-create-form').addEventListener('submit', handleAdminCreate);
  document.getElementById('admin-stats-form').addEventListener('submit', handleAdminStats);
  document.getElementById('admin-win-btn').addEventListener('click', () => handleResult('win'));
  document.getElementById('admin-loss-btn').addEventListener('click', () => handleResult('loss'));
  document.getElementById('admin-badges-form').addEventListener('submit', handleBadges);

  updateAdminSelects();
  updateRanking();
  renderProfile();
  showAdminPanel();
}

init();
