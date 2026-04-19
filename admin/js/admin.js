// ─── Admin API Helper ─────────────────────────────────────────────────────────
const API = '/api';

function getToken() {
  return sessionStorage.getItem('adminToken');
}

function requireAuth() {
  const token = getToken();
  if (!token) { window.location.href = 'login.html'; return false; }
  return true;
}

async function adminFetch(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };
  options.headers = headers;
  const res = await fetch(url, options);
  if (res.status === 401) { sessionStorage.clear(); window.location.href = 'login.html'; return; }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// For FormData (file upload)
async function adminFetchForm(url, formData, method = 'POST') {
  const token = getToken();
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
  if (res.status === 401) { sessionStorage.clear(); window.location.href = 'login.html'; return; }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ─── Logout ───────────────────────────────────────────────────────────────────
function logout() {
  sessionStorage.clear();
  window.location.href = 'login.html';
}

// ─── Format Date ──────────────────────────────────────────────────────────────
function formatDate(dt) {
  if (!dt) return '–';
  const d = new Date(dt);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

// ─── Format Currency ──────────────────────────────────────────────────────────
function formatCurrency(n) {
  return '₹' + Number(n || 0).toFixed(2).replace(/\.00$/, '');
}

// ─── Modal Helpers ────────────────────────────────────────────────────────────
function openModal(id) {
  document.getElementById(id)?.classList.add('open');
}
function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
}
function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) closeAllModals();
});

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function confirmAction(message) {
  return window.confirm(message);
}

// ─── Page Loader ──────────────────────────────────────────────────────────────
window.addEventListener('load', () => {
  document.getElementById('pageLoader')?.classList.add('hidden');
});

// ─── Sidebar Toggle (mobile) ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Mobile hamburger
  const hamburger = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  hamburger?.addEventListener('click', () => sidebar?.classList.toggle('open'));

  // Username display
  const userEl = document.getElementById('adminUsername');
  if (userEl) userEl.textContent = sessionStorage.getItem('adminUser') || 'Admin';
});

// ─── Pagination Helper ────────────────────────────────────────────────────────
function paginate(items, perPage, page) {
  const start = (page - 1) * perPage;
  return items.slice(start, start + perPage);
}

function renderPagination(total, perPage, currentPage, onPageChange) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return '';
  let html = '<div class="pagination">';
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }
  html += '</div>';
  return html;
}
