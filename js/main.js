/* =========================================================
   main.js
   - Renderiza servicios y productos desde WM_DATA
   - Navegación activa por scroll
   - Manejo del formulario de contacto (mock)
   - Año actual en footer
   ========================================================= */

(function () {
  'use strict';

  /* ---------- Plantillas reutilizables ---------- */
  const serviceCardTemplate = (s) => `
    <div class="col-md-6 col-lg-4">
      <div class="feature-card p-4">
        <div class="icon-wrap"><i class="bi ${s.icono}"></i></div>
        <h3 class="h5 fw-bold">${s.titulo}</h3>
        <p class="text-muted mb-0">${s.descripcion}</p>
      </div>
    </div>
  `;

  const productCardTemplate = (p) => `
    <div class="col-md-6 col-lg-4">
      <div class="card product-card h-100 shadow-sm border-0">
        <img src="${p.img}" alt="${p.alt}" width="${p.width}" height="${p.height}"
             loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${p.placeholder}'" />
        <div class="card-body">
          <span class="badge-tag mb-2 d-inline-block">${p.tag}</span>
          <h3 class="h5 fw-bold mt-2">${p.titulo}</h3>
          <p class="text-muted small mb-3">${p.descripcion}</p>
          <h4 class="h6 product-specs-heading">Datos técnicos por confirmar</h4>
          <ul class="product-specs">
            ${p.especificaciones.map(([label, value]) => `<li><span>${label}</span><strong>${value}</strong></li>`).join('')}
          </ul>
          <a href="#contacto" class="btn btn-sm btn-outline-danger" data-product="${p.titulo}">Solicitar cotización</a>
        </div>
      </div>
    </div>
  `;

  function renderGrid(selector, items, template) {
    const root = document.querySelector(selector);
    if (!root) return;
    root.innerHTML = items.map(template).join('');
  }

  /* ---------- Navegación activa al hacer scroll ---------- */
  function setupScrollSpy() {
    const links = document.querySelectorAll('.navbar-wm .nav-link');
    const sections = Array.from(links)
      .map((l) => document.querySelector(l.getAttribute('href')))
      .filter(Boolean);

    function onScroll() {
      const pos = window.scrollY + 120;
      let current = sections[0]?.id;
      sections.forEach((sec) => {
        if (sec.offsetTop <= pos) current = sec.id;
      });
      links.forEach((l) => {
        l.classList.toggle('active', l.getAttribute('href') === `#${current}`);
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Formulario de contacto (mock) ---------- */
  function setupContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    const feedback = document.getElementById('contact-feedback');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        feedback.className = 'mt-3 alert alert-warning py-2 mb-0';
        feedback.textContent = 'Revisa los campos obligatorios y el formato del correo.';
        return;
      }
      feedback.className = 'mt-3 alert alert-success py-2 mb-0';
      feedback.textContent = 'Solicitud revisada correctamente. Este formulario aún no envía los datos; usa un canal de contacto configurado para hacerla llegar.';
      form.reset();
      form.classList.remove('was-validated');
    });
  }

  function setupProductQuotes() {
    const productField = document.getElementById('contact-product');
    document.querySelectorAll('[data-product]').forEach((button) => {
      button.addEventListener('click', () => {
        if (productField) productField.value = button.dataset.product;
      });
    });
  }

  function setupContactActions() {
    const whatsappNumber = WM_CONFIG.WHATSAPP_NUMBER.replace(/\D/g, '');
    const whatsappLink = document.querySelector('[data-whatsapp-cta]');
    if (whatsappLink && /^57\d{10}$/.test(whatsappNumber)) {
      const message = 'Hola WIMING SAS, quiero información sobre sus tableros eléctricos.';
      whatsappLink.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      whatsappLink.target = '_blank';
      whatsappLink.rel = 'noopener noreferrer';
      whatsappLink.hidden = false;
    }

    document.querySelectorAll('[data-social-link]').forEach((link) => {
      const value = WM_CONFIG[link.dataset.socialLink];
      if (typeof value !== 'string' || !value.trim()) return;
      try {
        const url = new URL(value.trim());
        if (!['https:', 'http:'].includes(url.protocol)) return;
        link.href = url.href;
        link.hidden = false;
      } catch {
        link.hidden = true;
      }
    });

    const footerWhatsApp = document.querySelector('[data-whatsapp-link]');
    if (footerWhatsApp && /^57\d{10}$/.test(whatsappNumber)) {
      footerWhatsApp.href = `https://wa.me/${whatsappNumber}`;
      footerWhatsApp.hidden = false;
    }

    const phone = WM_CONFIG.PHONE.replace(/[^\d+]/g, '');
    const phoneLink = document.querySelector('[data-phone-link]');
    if (phoneLink && phone.replace(/\D/g, '').length >= 7) {
      phoneLink.href = `tel:${phone}`;
      phoneLink.hidden = false;
    }
  }

  /* ---------- Año dinámico ---------- */
  function setYear() {
    const el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }

  function applyCompanyConfig() {
    document.querySelectorAll('[data-config-row]').forEach((row) => {
      const key = row.dataset.configRow;
      const value = WM_CONFIG[key];
      if (value === null || value === undefined || value === '') {
        row.hidden = true;
        return;
      }
      const target = row.querySelector(`[data-config="${key}"]`);
      if (target) target.textContent = `${row.dataset.configPrefix || ''}${value}`;
      row.hidden = false;
    });
  }

  /* ---------- Inicio ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    renderGrid('#services-grid', WM_DATA.servicios, serviceCardTemplate);
    renderGrid('#products-grid', WM_DATA.productos, productCardTemplate);
    setupProductQuotes();
    setupContactForm();
  });

  // Header/footer llegan después por fetch
  document.addEventListener('includes:loaded', () => {
    setupScrollSpy();
    setYear();
    applyCompanyConfig();
    setupContactActions();
  });
})();
