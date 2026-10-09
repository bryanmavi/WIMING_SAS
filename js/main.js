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
           loading="lazy" decoding="async" data-fallback="${p.placeholder}" />
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
    const submitButton = form.querySelector('button[type="submit"]');
    const actions = document.getElementById('contact-actions');
    const phoneInput = form.elements.telefono;
    const phoneError = document.createElement('div');
    phoneError.id = 'contact-phone-error';
    phoneError.className = 'invalid-feedback';
    phoneError.setAttribute('role', 'alert');
    phoneError.setAttribute('aria-live', 'polite');
    phoneInput.insertAdjacentElement('afterend', phoneError);
    const describedBy = phoneInput.getAttribute('aria-describedby');
    phoneInput.setAttribute('aria-describedby', [describedBy, phoneError.id].filter(Boolean).join(' '));
    let prepared = false;

    function validatePhone(showError = true) {
      const rawPhone = WM_SECURITY.cleanText(phoneInput.value, 20);
      const digits = rawPhone.replace(/\D/g, '');
      const nationalNumber = digits.startsWith('57') && digits.length === 12
        ? digits.slice(2)
        : digits;
      const validPhone = rawPhone.length > 0 && /^[+\d\s().-]+$/.test(rawPhone)
        && /^(?:3\d{9}|60\d{8})$/.test(nationalNumber);
      const message = 'El teléfono es obligatorio. Ingresa un celular colombiano de 10 dígitos que empiece por 3 o un fijo de 10 dígitos que empiece por 60. Puedes incluir +57 y espacios o guiones.';
      phoneInput.setCustomValidity(validPhone ? '' : message);
      phoneInput.classList.toggle('is-invalid', showError && !validPhone);
      phoneInput.setAttribute('aria-invalid', String(showError && !validPhone));
      phoneError.textContent = showError && !validPhone ? message : '';
      return validPhone;
    }

    phoneInput.addEventListener('input', () => validatePhone());

    function resetPreparedActions() {
      if (!prepared) return;
      prepared = false;
      actions.replaceChildren();
      actions.hidden = true;
      submitButton.type = 'submit';
      submitButton.textContent = 'Revisar solicitud';
      submitButton.onclick = null;
      form.classList.remove('was-validated');
      feedback.className = 'mt-3';
      feedback.textContent = '';
    }

    form.addEventListener('input', resetPreparedActions);
    form.addEventListener('change', resetPreparedActions);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const honeypot = form.elements.website;
      if (honeypot && honeypot.value.trim()) return;

      form.querySelectorAll('input:not([type="checkbox"]):not([type="hidden"]), textarea').forEach((field) => {
        field.value = WM_SECURITY.cleanText(field.value, Number(field.maxLength) > 0 ? Number(field.maxLength) : 1000);
      });

      validatePhone();
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        feedback.className = 'mt-3 alert alert-warning py-2 mb-0';
        feedback.textContent = 'Revisa los campos obligatorios, acepta la política de datos y verifica el formato del correo.';
        return;
      }

      if (!WM_SECURITY.allowSubmission('contact-form')) {
        feedback.className = 'mt-3 alert alert-warning py-2 mb-0';
        feedback.textContent = 'Se alcanzó el límite de revisiones. Intenta de nuevo más tarde.';
        return;
      }

      const whatsappNumber = WM_CONFIG.WHATSAPP_NUMBER.replace(/\D/g, '');
      const whatsappAvailable = /^57\d{10}$/.test(whatsappNumber);
      const email = WM_CONFIG.EMAIL.trim();
      const emailAvailable = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!whatsappAvailable && !emailAvailable) {
        feedback.className = 'mt-3 alert alert-warning py-2 mb-0';
        feedback.textContent = 'No hay un canal de envío configurado. Contacta directamente con WIMING SAS.';
        return;
      }

      const product = WM_SECURITY.cleanText(form.elements.producto.value, 80);
      const requirements = WM_SECURITY.cleanText(form.elements.mensaje.value, 1000) || 'Sin requisitos adicionales';
      const name = WM_SECURITY.cleanText(form.elements.nombre.value, 100);
      const company = WM_SECURITY.cleanText(form.elements.empresa.value, 120) || 'No indicada';
      const contactEmail = WM_SECURITY.cleanText(form.elements.email.value, 254);
      const contactPhone = WM_SECURITY.cleanText(form.elements.telefono.value, 20) || 'No indicado';
      const message = `Hola WIMING SAS, solicité una cotización desde la web.\nProducto: ${product}\nRequisitos: ${requirements}\nNombre: ${name} | Empresa: ${company} | Correo: ${contactEmail} | Tel: ${contactPhone}`;
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = whatsappAvailable ? `https://wa.me/${whatsappNumber}?text=${encodedMessage}` : '';
      const subject = encodeURIComponent(`Solicitud de cotización desde la web - ${product}`);
      const mailtoUrl = emailAvailable ? `mailto:${email}?subject=${subject}&body=${encodedMessage}` : '';

      prepared = true;
      submitButton.type = 'button';
      submitButton.textContent = whatsappUrl ? 'Enviar por WhatsApp' : 'Enviar por correo';
      submitButton.onclick = () => {
        if (!prepared) return;
        if (whatsappUrl) window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        else window.location.href = mailtoUrl;
      };

      actions.replaceChildren();
      if (whatsappUrl && mailtoUrl) {
        const emailButton = document.createElement('a');
        emailButton.className = 'btn btn-outline-danger';
        emailButton.href = mailtoUrl;
        emailButton.textContent = 'Enviar por correo';
        actions.appendChild(emailButton);
      }
      actions.hidden = !actions.childElementCount;
      feedback.className = 'mt-3 alert alert-success py-2 mb-0';
      feedback.textContent = whatsappUrl
        ? 'Listo. Para que nuestro equipo reciba tu solicitud, pulsa Enviar en WhatsApp.'
        : 'Listo. Para que nuestro equipo reciba tu solicitud, pulsa Enviar en tu aplicación de correo.';
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
