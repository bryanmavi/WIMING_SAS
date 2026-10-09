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
        <h5 class="fw-bold">${s.titulo}</h5>
        <p class="text-muted mb-0">${s.descripcion}</p>
      </div>
    </div>
  `;

  const productCardTemplate = (p) => `
    <div class="col-md-6 col-lg-4">
      <div class="card product-card h-100 shadow-sm border-0">
           <img src="${p.img}" alt="${p.alt}" width="${p.width}" height="${p.height}"
             loading="lazy" onerror="this.onerror=null;this.src='${p.placeholder}'" />
        <div class="card-body">
          <span class="badge-tag mb-2 d-inline-block">${p.tag}</span>
          <h5 class="fw-bold mt-2">${p.titulo}</h5>
          <p class="text-muted small mb-3">${p.descripcion}</p>
          <a href="#contacto" class="btn btn-sm btn-outline-danger">Solicitar cotización</a>
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
        feedback.innerHTML =
          '<div class="alert alert-warning py-2 mb-0">Por favor completa los campos requeridos.</div>';
        return;
      }
      // Mock: simulamos envío
      feedback.innerHTML =
        '<div class="alert alert-success py-2 mb-0">¡Gracias! Tu mensaje fue enviado. Te contactaremos pronto.</div>';
      form.reset();
      form.classList.remove('was-validated');
      setTimeout(() => (feedback.innerHTML = ''), 5000);
    });
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
    setupContactForm();
  });

  // Header/footer llegan después por fetch
  document.addEventListener('includes:loaded', () => {
    setupScrollSpy();
    setYear();
    applyCompanyConfig();
  });
})();
