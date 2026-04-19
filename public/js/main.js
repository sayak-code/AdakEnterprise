// ─── API Base ─────────────────────────────────────────────────────────────────
const API = '/api';

async function apiFetch(url, options = {}) {
  try {
    const res = await fetch(url, options);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  } catch (err) {
    console.error('[API Error]', url, err);
    throw err;
  }
}

// ─── Page Loader ──────────────────────────────────────────────────────────────
window.addEventListener('load', () => {
  const loader = document.getElementById('pageLoader');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 400);
  }
});

// ─── Toast Notifications ──────────────────────────────────────────────────────
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

// ─── Sticky Header ────────────────────────────────────────────────────────────
const header = document.querySelector('.header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  });
}

// ─── Mobile Menu ──────────────────────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileOverlay = document.getElementById('mobileOverlay');
const mobileClose = document.getElementById('mobileMenuClose');

function openMobileMenu() {
  mobileMenu?.classList.add('open');
  mobileOverlay?.classList.add('open');
  hamburger?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeMobileMenu() {
  mobileMenu?.classList.remove('open');
  mobileOverlay?.classList.remove('open');
  hamburger?.classList.remove('open');
  document.body.style.overflow = '';
}
hamburger?.addEventListener('click', openMobileMenu);
mobileClose?.addEventListener('click', closeMobileMenu);
mobileOverlay?.addEventListener('click', closeMobileMenu);

// ─── Active Nav Link ──────────────────────────────────────────────────────────
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

// ─── Load Shop Info ───────────────────────────────────────────────────────────
async function loadShopInfo() {
  try {
    const info = await apiFetch(`${API}/shopinfo`);
    // Inject into all [data-shopinfo] elements
    document.querySelectorAll('[data-shopinfo]').forEach(el => {
      const key = el.dataset.shopinfo;
      if (info[key] !== undefined) {
        if (el.tagName === 'A' && key === 'phone') {
          el.href = `tel:${info[key]}`;
          el.textContent = info[key];
        } else if (el.tagName === 'A' && key === 'whatsapp') {
          el.href = `https://wa.me/${info[key]}`;
        } else if (el.tagName === 'A' && key === 'email') {
          el.href = `mailto:${info[key]}`;
          el.textContent = info[key];
        } else {
          el.textContent = info[key];
        }
      }
    });
    // WhatsApp float button
    const waFloat = document.getElementById('waFloatBtn');
    if (waFloat && info.whatsapp) {
      waFloat.href = `https://wa.me/${info.whatsapp}?text=Hello%2C%20I%20need%20assistance%20from%20Adak%20Enterprise.`;
    }
    // WhatsApp chat button
    document.querySelectorAll('.wa-chat-btn').forEach(btn => {
      if (info.whatsapp) btn.href = `https://wa.me/${info.whatsapp}?text=Hello%2C%20I%20need%20assistance.`;
    });
    // Header/footer phone
    document.querySelectorAll('.shop-phone').forEach(el => { el.textContent = info.phone || ''; });
    document.querySelectorAll('.shop-address').forEach(el => {
      el.textContent = `${info.address_line1 || ''}, ${info.address_line2 || ''}`;
    });
    // Office hours
    document.querySelectorAll('.shop-hours').forEach(el => { el.textContent = info.office_hours || ''; });
    // Store globally
    window._shopInfo = info;
  } catch (e) {
    console.warn('Could not load shop info', e);
  }
}

// ─── Load Services ────────────────────────────────────────────────────────────
async function loadServices(containerId, limit = null) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--gray)"><i class="fas fa-spinner fa-spin fa-2x"></i></div>`;
  try {
    let services = await apiFetch(`${API}/services`);
    if (limit) services = services.slice(0, limit);

    if (!services.length) {
      container.innerHTML = `<p style="color:var(--gray);text-align:center">No services found.</p>`;
      return;
    }

    const lang = I18n.current;
    container.innerHTML = services.map(s => renderServiceCard(s, lang)).join('');
  } catch (e) {
    container.innerHTML = `<p style="color:var(--danger);text-align:center">Failed to load services.</p>`;
  }
}

function renderServiceCard(s, lang = 'en') {
  const name = lang === 'bn' ? s.name_bn : s.name_en;
  const altName = lang === 'bn' ? s.name_en : s.name_bn;
  const desc = lang === 'bn' ? (s.description_bn || s.description_en) : (s.description_en || '');
  return `
    <div class="service-card fade-in">
      <div class="service-cat-badge">${s.category || 'General'}</div>
      <div class="service-icon"><i class="${s.icon || 'fas fa-file-alt'}"></i></div>
      <h3>${name}</h3>
      <div class="service-name-bn">${altName}</div>
      <p class="service-desc">${desc}</p>
      <span class="service-price"><i class="fas fa-tag"></i>${s.price}</span>
    </div>`;
}

// Re-render services on language change
document.addEventListener('langChanged', ({ detail: { lang } }) => {
  document.querySelectorAll('.service-card').forEach(card => {
    // Trigger reload
  });
  // Re-load services if on services or home page
  if (document.getElementById('servicesGrid')) loadServices('servicesGrid');
  if (document.getElementById('homeServicesGrid')) loadServices('homeServicesGrid', 6);
});

// ─── Contact Form ─────────────────────────────────────────────────────────────
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('[type="submit"]');
    const origText = btn.textContent;
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${I18n.t('form_sending')}`;

    // Since we don't have an email backend, show success after small delay
    await new Promise(r => setTimeout(r, 1000));
    showToast(I18n.t('form_success'), 'success');
    contactForm.reset();
    btn.disabled = false;
    btn.textContent = origText;
  });
}

// ─── Service Filter (services page) ──────────────────────────────────────────
function initServiceFilter() {
  const filterBar = document.getElementById('filterBar');
  if (!filterBar) return;

  filterBar.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.cat;
    document.querySelectorAll('.service-card').forEach(card => {
      const cardCat = card.querySelector('.service-cat-badge')?.textContent;
      card.style.display = (!cat || cat === 'all' || cardCat === cat) ? 'block' : 'none';
    });
  });
}

// ─── Content Integration & Banners ──────────────────────────────────────────────
async function loadContentIntegration() {
  try {
    const content = await apiFetch(`${API}/content`);
    
    // Notice Banner
    const notice = I18n.current === 'bn' ? content.home_notice_en?.bn : content.home_notice_en?.en;
    const banner = document.getElementById('noticeBanner');
    if (banner && notice) {
      banner.querySelector('.notice-text').textContent = notice;
      banner.classList.add('visible');
    }

    // Logo Update
    if (content.site_logo && content.site_logo.en) {
      const logoUrl = content.site_logo.en;
      document.querySelectorAll('.logo-icon').forEach(iconDiv => {
        iconDiv.innerHTML = `<img src="${logoUrl}" style="width:100%;height:100%;object-fit:contain;border-radius:inherit;" alt="Logo" />`;
        // Remove background color inside logo if image is present
        iconDiv.style.background = 'transparent';
        iconDiv.style.boxShadow = 'none';
      });
    }

  } catch (e) { console.warn('Could not load site content', e); }
}

async function loadHeroBanners() {
  const heroSection = document.querySelector('.hero');
  if (!heroSection) return; // Only exists on index.html

  try {
    const banners = await apiFetch(`${API}/content/banners`);
    if (!banners || banners.length === 0) return;

    // We have banners! Let's create a background slider element behind the hero content.
    const sliderWrap = document.createElement('div');
    sliderWrap.className = 'hero-bg-slider';
    sliderWrap.style.position = 'absolute';
    sliderWrap.style.inset = '0';
    sliderWrap.style.zIndex = '0'; // Place behind hero content (z-index: 2) but over CSS background
    sliderWrap.style.overflow = 'hidden';
    
    // Prepend to hero
    heroSection.style.position = 'relative'; 
    heroSection.insertBefore(sliderWrap, heroSection.firstChild);

    banners.forEach((b, index) => {
      const slide = document.createElement('div');
      slide.style.position = 'absolute';
      slide.style.inset = '0';
      slide.style.background = `linear-gradient(rgba(10, 15, 30, 0.75), rgba(10, 15, 30, 0.85)), url('${b.image_url}') center/cover no-repeat`;
      slide.style.opacity = index === 0 ? '1' : '0';
      slide.style.transition = 'opacity 1s ease-in-out';
      sliderWrap.appendChild(slide);
    });

    if (banners.length > 1) {
      let currentSlide = 0;
      const slides = sliderWrap.children;
      setInterval(() => {
        slides[currentSlide].style.opacity = '0';
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].style.opacity = '1';
      }, 5000); // Change image every 5 seconds
    }
  } catch (e) {
    console.warn('Could not load banners', e);
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  I18n.init();
  await loadShopInfo();
  await loadContentIntegration();
  await loadHeroBanners();

  if (document.getElementById('homeServicesGrid')) {
    await loadServices('homeServicesGrid', 6);
    initServiceFilter();
  }
  if (document.getElementById('servicesGrid')) {
    await loadServices('servicesGrid');
    initServiceFilter();
    buildCategoryFilter();
  }
});

async function buildCategoryFilter() {
  const filterBar = document.getElementById('filterBar');
  if (!filterBar) return;
  try {
    const cats = await apiFetch(`${API}/services/categories`);
    filterBar.innerHTML = `<button class="filter-btn active" data-cat="all" data-i18n="cat_all">${I18n.t('cat_all')}</button>`;
    cats.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.dataset.cat = cat;
      btn.textContent = cat;
      filterBar.appendChild(btn);
    });
    initServiceFilter();
  } catch (e) { /* ignore */ }
}
