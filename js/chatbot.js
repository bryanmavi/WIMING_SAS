/* =========================================================
   chatbot.js
   Simulación de Agente IA (mock) — FAQ técnico WIMING SAS
   - Base de conocimiento por intenciones (keywords)
   - Quick replies dinámicas
   - Efecto "typing" para simular respuesta
   ========================================================= */

(function () {
  'use strict';

  /* ---------- Base de conocimiento ---------- */
  const KB = [
    {
      id: 'tipos',
      keywords: ['tipo', 'tipos', 'clases', 'modelos', 'qué tableros', 'que tableros'],
      label: '¿Qué tipos de tableros fabrican?',
      answer:
        'En WIMING SAS fabricamos:\n' +
        '• Celdas de media tensión (hasta 17.5 kV)\n' +
        '• Tableros generales de baja tensión (TGBT)\n' +
        '• Tableros de control y medida\n' +
        '• Transferencias automáticas (ATS)\n' +
        '• Bancos de condensadores\n' +
        '• Diseños especiales a la medida\n\n' +
        '¿Te interesa alguno en particular?'
    },
    {
      id: 'normas',
      keywords: ['norma', 'normas', 'retie', 'iec', 'ntc', 'certificación', 'certificacion', 'cumple'],
      label: '¿Qué normas cumplen?',
      answer:
        'Todos nuestros tableros cumplen con:\n' +
        '• RETIE — Reglamento Técnico de Instalaciones Eléctricas (Colombia)\n' +
        '• IEC 61439-1/2 — Conjuntos de aparamenta de BT\n' +
        '• IEC 62271-200 — Aparamenta de MT\n' +
        '• NTC 2050 — Código Eléctrico Colombiano\n\n' +
        'Entregamos dictámenes RETIE y memorias de cálculo.'
    },
    {
      id: 'mantenimiento',
      keywords: ['mantenimiento', 'mantener', 'preventivo', 'correctivo', 'termografía', 'termografia', 'pruebas'],
      label: 'Servicios de mantenimiento',
      answer:
        'Ofrecemos mantenimiento preventivo y correctivo:\n' +
        '• Inspección visual y termográfica\n' +
        '• Pruebas de aislamiento (megger)\n' +
        '• Ajuste y limpieza de conexiones\n' +
        '• Verificación de protecciones\n' +
        '• Reportes técnicos certificados\n\n' +
        'Frecuencia recomendada: anual o semestral según criticidad.'
    },
    {
      id: 'cotizacion',
      keywords: ['cotiz', 'precio', 'costo', 'valor', 'cuánto', 'cuanto', 'presupuesto'],
      label: 'Solicitar cotización',
      answer:
        'Para cotizar necesitamos:\n' +
        '1. Tensión nominal (BT / MT)\n' +
        '2. Corriente nominal del barraje\n' +
        '3. Diagrama unifilar o esquema\n' +
        '4. Tipo de instalación (interior / exterior)\n' +
        '5. Ciudad de entrega\n\n' +
        'Puedes compartir esta información mediante el formulario de contacto.'
    },
    {
      id: 'tiempo',
      keywords: ['tiempo', 'demora', 'entrega', 'plazo', 'cuándo', 'cuando', 'fabricación', 'fabricacion'],
      label: 'Tiempos de entrega',
      answer:
        'Los tiempos típicos de fabricación son:\n' +
        '• Tableros estándar BT: 3 a 4 semanas\n' +
        '• Celdas de media tensión: 6 a 8 semanas\n' +
        '• Diseños especiales: según alcance\n\n' +
        'Estos plazos se confirman al recibir la orden de compra y aprobación de planos.'
    },
    {
      id: 'garantia',
      keywords: ['garantía', 'garantia', 'respaldo', 'soporte'],
      label: 'Garantía',
      answer:
        'Brindamos:\n' +
        '• Garantía de fabricación: 24 meses\n' +
        '• Garantía de componentes: según fabricante (ABB, Schneider, Siemens, etc.)\n' +
        '• Soporte técnico telefónico permanente\n' +
        '• Visita técnica gratuita en caso de falla de fábrica.'
    },
    {
      id: 'cobertura',
      keywords: ['cobertura', 'ciudad', 'ciudades', 'región', 'region', 'envío', 'envio', 'nacional'],
      label: 'Cobertura geográfica',
      answer:
        'Atendemos toda Colombia. Tenemos operación directa en Bogotá, Medellín, Cali, Barranquilla y Bucaramanga, y entregamos en cualquier ciudad mediante operadores logísticos especializados.'
    },
    {
      id: 'contacto',
      keywords: ['contacto', 'teléfono', 'telefono', 'correo', 'email', 'dirección', 'direccion', 'hablar', 'asesor'],
      label: 'Hablar con un asesor',
      answer: 'Completa el formulario de contacto para comunicarte con WIMING SAS.'
    }
  ];

  const GREETINGS = ['hola', 'buenos', 'buenas', 'hey', 'saludos'];
  const FAREWELLS = ['gracias', 'chao', 'adios', 'adiós', 'bye'];
  const QUOTE_STORAGE_KEY = 'wm_quote_draft';
  const START_QUOTE = { id: 'startQuote', label: 'Solicitar cotización paso a paso' };
  const DIRECT_WHATSAPP_MESSAGE = 'Hola, WIMING SAS. Me gustaría solicitar una cotización para uno de sus productos. ¿Me pueden asesorar?';
  const QUOTE_STEPS = [
    {
      key: 'product',
      question: '¿Qué necesita?',
      options: ['Celda MT', 'Tablero BT', 'Control y medida', 'Transferencia automática', 'Banco de condensadores', 'A la medida', 'No sé aún']
    },
    {
      key: 'project',
      question: '¿Qué tipo de proyecto es?',
      options: ['Nuevo', 'Ampliación', 'Mantenimiento', 'Repuestos']
    },
    {
      key: 'sector',
      question: '¿En qué sector?',
      options: ['Industrial', 'Comercial', 'Minería', 'Oil & gas', 'Constructora', 'Otro']
    },
    {
      key: 'urgency',
      question: '¿Cuál es la urgencia?',
      options: ['Inmediata', 'Este mes', 'Estoy cotizando']
    }
  ];
  const QUOTE_PRODUCTS = QUOTE_STEPS[0].options;
  const COLOMBIAN_MOBILE = /^3\d{9}$/;

  function emitAnalytics(eventName, detail) {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  }

  function normalizedWhatsAppNumber() {
    return WM_CONFIG.WHATSAPP_NUMBER.replace(/\D/g, '');
  }

  function isColombianMobile(value) {
    if (!/^[+\d\s().-]+$/.test(value)) return false;
    const digits = value.replace(/\D/g, '');
    const nationalNumber = digits.startsWith('57') && digits.length === 12
      ? digits.slice(2)
      : digits;
    return COLOMBIAN_MOBILE.test(nationalNumber);
  }

  function loadQuoteDraft() {
    try {
      const stored = JSON.parse(sessionStorage.getItem(QUOTE_STORAGE_KEY));
      if (!stored || !Number.isInteger(stored.step) || !stored.answers || typeof stored.answers !== 'object') {
        try {
          sessionStorage.removeItem(QUOTE_STORAGE_KEY);
        } catch {
          // Ignore unavailable storage; no draft is loaded into memory.
        }
        return { step: 0, answers: {}, consentAccepted: false };
      }
      const consentAccepted = stored.consentAccepted === true;
      const answers = {};
      const limits = { product: 80, project: 40, sector: 40, urgency: 40, city: 80, name: 100, company: 120, phone: 20 };
      Object.entries(limits).forEach(([key, limit]) => {
        const isPersonal = ['city', 'name', 'company', 'phone'].includes(key);
        if (typeof stored.answers[key] === 'string' && (!isPersonal || consentAccepted)) {
          answers[key] = WM_SECURITY.cleanText(stored.answers[key], limit);
        }
      });
      const step = !consentAccepted && stored.step > 4
        ? 4
        : Math.max(0, Math.min(stored.step, 6));
      const draft = { step, answers, consentAccepted };
      if (!consentAccepted) {
        try {
          sessionStorage.setItem(QUOTE_STORAGE_KEY, JSON.stringify(draft));
        } catch {
          // Keep the sanitized in-memory draft if browser storage is unavailable.
        }
      }
      return draft;
    } catch {
      try {
        sessionStorage.removeItem(QUOTE_STORAGE_KEY);
      } catch {
        // Ignore unavailable storage; no draft is loaded into memory.
      }
      return { step: 0, answers: {}, consentAccepted: false };
    }
  }

  function appendHoneypot(form) {
    const wrapper = document.createElement('div');
    wrapper.className = 'form-honeypot';
    wrapper.setAttribute('aria-hidden', 'true');
    const label = document.createElement('label');
    label.textContent = 'Deja este campo vacío';
    const input = document.createElement('input');
    input.type = 'text';
    input.name = 'website';
    input.tabIndex = -1;
    input.autocomplete = 'off';
    label.appendChild(input);
    wrapper.appendChild(label);
    form.appendChild(wrapper);
    return input;
  }

  function appendDataConsent(form, id, checked, onChange) {
    const wrapper = document.createElement('div');
    wrapper.className = 'quote-consent';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = id;
    checkbox.required = true;
    checkbox.checked = checked;
    const label = document.createElement('label');
    label.htmlFor = id;
    label.textContent = 'Autorizo el tratamiento de mis datos para gestionar esta solicitud.';
    const link = document.createElement('a');
    link.href = 'politica-tratamiento.html';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Leer la Política de Tratamiento de Datos Personales (Ley 1581 de 2012)';
    checkbox.addEventListener('change', () => onChange(checkbox.checked));
    wrapper.append(checkbox, label, link);
    form.appendChild(wrapper);
    return checkbox;
  }

  /* ---------- Render del widget ---------- */
  function renderWidget() {
    const root = document.getElementById('chatbot-root');
    if (!root) return;
    root.innerHTML = `
      <button class="chatbot-toggle" id="cb-toggle" aria-label="Abrir opciones de contacto" aria-controls="cb-launcher-menu" aria-expanded="false">
        <i class="bi bi-chat-dots-fill"></i>
      </button>
      <div class="chatbot-launcher-menu" id="cb-launcher-menu" aria-label="Opciones de contacto" hidden>
        <button type="button" id="cb-assistant"><i class="bi bi-chat-dots" aria-hidden="true"></i>Chatear con el asistente</button>
        <a id="cb-direct-whatsapp" href="#" target="_blank" rel="noopener noreferrer" hidden><i class="bi bi-whatsapp" aria-hidden="true"></i>Ir directo a WhatsApp</a>
      </div>
      <div class="chatbot-window" id="cb-window" role="dialog" aria-label="Asistente IA WIMING">
        <div class="chatbot-header">
          <div class="avatar"><i class="bi bi-robot"></i></div>
          <div>
            <h6>Asistente WIMING</h6>
            <small>Información y cotizaciones</small>
          </div>
          <button class="quote-start-button" id="cb-start-quote" type="button">Cotizar</button>
          <button class="new-conversation-button" id="cb-new-conversation" type="button" aria-label="Nueva conversación" title="Nueva conversación">
            <i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i>
          </button>
          <button class="close-btn" id="cb-close" aria-label="Cerrar">&times;</button>
        </div>
        <div class="chatbot-body" id="cb-body" aria-live="polite" aria-relevant="additions"></div>
        <div class="quick-replies" id="cb-quick"></div>
        <form class="chatbot-input" id="cb-form">
          <input type="text" id="cb-input" aria-label="Escribe tu pregunta" placeholder="Escribe tu pregunta..." autocomplete="off" maxlength="240" />
          <button type="submit" aria-label="Enviar"><i class="bi bi-send-fill"></i></button>
        </form>
      </div>
    `;
  }

  /* ---------- Lógica del chat ---------- */
  const Chat = {
    body: null,
    quick: null,
    input: null,
    inputForm: null,
    launcherMenu: null,
    mode: 'faq',

    init() {
      this.body = document.getElementById('cb-body');
      this.quick = document.getElementById('cb-quick');
      this.input = document.getElementById('cb-input');
      this.inputForm = document.getElementById('cb-form');
      this.launcherMenu = document.getElementById('cb-launcher-menu');

      const directWhatsApp = document.getElementById('cb-direct-whatsapp');
      const number = normalizedWhatsAppNumber();
      if (/^57\d{10}$/.test(number)) {
        directWhatsApp.href = `https://wa.me/${number}?text=${encodeURIComponent(DIRECT_WHATSAPP_MESSAGE)}`;
        directWhatsApp.hidden = false;
      }
      directWhatsApp.addEventListener('click', () => {
        emitAnalytics('wiming:chat-send-click', { channel: 'whatsapp_direct' });
      });

      document.getElementById('cb-toggle').addEventListener('click', () => this.toggleMenu());
      document.getElementById('cb-assistant').addEventListener('click', () => {
        this.toggleMenu(false);
        this.input.disabled = false;
        this.toggle(true);
        emitAnalytics('wiming:chat-start', { flow: 'faq' });
      });
      document.getElementById('cb-close').addEventListener('click', () => this.toggle(false));
      document.getElementById('cb-new-conversation').addEventListener('click', (event) => {
        this.requestConversationReset(event.currentTarget);
      });
      document.getElementById('cb-start-quote').addEventListener('click', () => QuoteWizard.start());
      this.inputForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = WM_SECURITY.cleanText(this.input.value, 240);
        if (!text) return;
        if (this.mode === 'quote') QuoteWizard.acceptCity(text);
        else this.sendUser(text);
        this.input.value = '';
      });
      this.input.addEventListener('input', () => {
        if (this.mode === 'quote' && QuoteWizard.state.step === 4) {
          this.input.value = WM_SECURITY.cleanText(this.input.value, 80);
          if (!QuoteWizard.state.consentAccepted) return;
          QuoteWizard.state.answers.city = this.input.value;
          QuoteWizard.save();
        }
      });

      this.greet();
    },

    toggle(force) {
      const w = document.getElementById('cb-window');
      const shouldOpen = force === undefined ? !w.classList.contains('open') : force;
      w.classList.toggle('open', shouldOpen);
      if (shouldOpen && !this.inputForm.hidden) this.input.focus();
    },

    requestConversationReset(trigger) {
      const backdrop = document.createElement('div');
      backdrop.className = 'chat-reset-backdrop';
      const dialog = document.createElement('div');
      dialog.className = 'chat-reset-dialog';
      dialog.setAttribute('role', 'alertdialog');
      dialog.setAttribute('aria-modal', 'true');
      dialog.setAttribute('aria-labelledby', 'chat-reset-title');
      dialog.setAttribute('aria-describedby', 'chat-reset-description');

      const title = document.createElement('h2');
      title.id = 'chat-reset-title';
      title.textContent = 'Nueva conversación';
      const description = document.createElement('p');
      description.id = 'chat-reset-description';
      description.textContent = 'Se borrarán tus respuestas. ¿Empezar de nuevo?';
      const actions = document.createElement('div');
      actions.className = 'chat-reset-actions';
      const cancel = document.createElement('button');
      cancel.type = 'button';
      cancel.className = 'btn btn-outline-secondary';
      cancel.textContent = 'Cancelar';
      const accept = document.createElement('button');
      accept.type = 'button';
      accept.className = 'btn btn-danger';
      accept.textContent = 'Aceptar';
      actions.append(cancel, accept);
      dialog.append(title, description, actions);
      backdrop.appendChild(dialog);

      const closeDialog = () => {
        backdrop.remove();
        if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus();
      };
      cancel.addEventListener('click', closeDialog);
      accept.addEventListener('click', () => {
        backdrop.remove();
        this.resetConversation();
      });
      dialog.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          closeDialog();
          return;
        }
        if (event.key === 'Tab' && event.shiftKey && document.activeElement === cancel) {
          event.preventDefault();
          accept.focus();
        } else if (event.key === 'Tab' && !event.shiftKey && document.activeElement === accept) {
          event.preventDefault();
          cancel.focus();
        }
      });

      document.body.appendChild(backdrop);
      cancel.focus();
    },

    resetConversation() {
      try {
        sessionStorage.removeItem(QUOTE_STORAGE_KEY);
      } catch {
        // Reset the in-memory conversation even when browser storage is unavailable.
      }
      QuoteWizard.state = { step: 0, answers: {}, consentAccepted: false };
      this.mode = 'faq';
      this.body.replaceChildren();
      this.quick.replaceChildren();
      this.quick.hidden = false;
      this.body.removeAttribute('aria-label');
      this.inputForm.hidden = false;
      this.input.disabled = false;
      this.input.value = '';
      this.input.placeholder = 'Escribe tu pregunta...';
      this.input.setAttribute('aria-label', 'Escribe tu pregunta');
      this.greet();
      this.toggle(true);
      emitAnalytics('wiming:chat-reset', { flow: 'quote' });
    },

    toggleMenu(force) {
      const shouldOpen = force === undefined ? this.launcherMenu.hidden : force;
      this.launcherMenu.hidden = !shouldOpen;
      document.getElementById('cb-toggle').setAttribute('aria-expanded', String(shouldOpen));
    },

    greet() {
      this.addBot(
        '¡Hola! 👋 Soy el asistente virtual de WIMING SAS.\n' +
        'Puedo ayudarte con información técnica sobre nuestros tableros eléctricos.\n\n' +
        '¿Sobre qué tema quieres saber?'
      );
      this.renderQuickReplies([START_QUOTE, ...KB.slice(0, 3)]);
    },

    addMessage(text, sender) {
      const msg = document.createElement('div');
      msg.className = `chat-msg ${sender}`;
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      bubble.textContent = text;
      msg.appendChild(bubble);
      this.body.appendChild(msg);
      this.body.scrollTop = this.body.scrollHeight;
    },

    addBot(text) { this.addMessage(text, 'bot'); },
    addUser(text) { this.addMessage(text, 'user'); },

    showTyping() {
      const msg = document.createElement('div');
      msg.className = 'chat-msg bot typing';
      msg.id = 'cb-typing';
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      for (let index = 0; index < 3; index += 1) {
        const dot = document.createElement('span');
        dot.className = 'dot';
        bubble.appendChild(dot);
      }
      msg.appendChild(bubble);
      this.body.appendChild(msg);
      this.body.scrollTop = this.body.scrollHeight;
    },

    hideTyping() {
      const t = document.getElementById('cb-typing');
      if (t) t.remove();
    },

    renderQuickReplies(items) {
      this.quick.replaceChildren();
      items.forEach((it) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = it.label;
        btn.addEventListener('click', () => {
          if (it.id === START_QUOTE.id) QuoteWizard.start();
          else this.sendUser(it.label, it);
        });
        this.quick.appendChild(btn);
      });
    },

    sendUser(text, matchedIntent) {
      this.mode = 'faq';
      this.inputForm.hidden = false;
      this.quick.hidden = false;
      this.body.removeAttribute('aria-label');
      this.addUser(text);
      this.showTyping();
      const intent = matchedIntent || this.match(text);
      const delay = 600 + Math.random() * 700;
      setTimeout(() => {
        this.hideTyping();
        this.respond(intent, text);
      }, delay);
    },

    match(text) {
      const t = text.toLowerCase();
      let best = null;
      let bestScore = 0;
      KB.forEach((intent) => {
        const score = intent.keywords.reduce(
          (acc, kw) => (t.includes(kw) ? acc + 1 : acc),
          0
        );
        if (score > bestScore) { bestScore = score; best = intent; }
      });
      return best;
    },

    respond(intent, originalText) {
      const t = (originalText || '').toLowerCase();

      if (!intent && GREETINGS.some((g) => t.includes(g))) {
        this.addBot('¡Hola! 😊 ¿En qué puedo ayudarte hoy?');
        this.renderQuickReplies([START_QUOTE, ...KB.slice(0, 3)]);
        return;
      }

      if (!intent && FAREWELLS.some((g) => t.includes(g))) {
        this.addBot('¡Gracias por contactarnos! Que tengas un excelente día. ⚡');
        this.renderQuickReplies([START_QUOTE, ...KB.slice(0, 3)]);
        return;
      }

      if (!intent) {
        this.addBot(
          'No estoy seguro de haber entendido. 🤔\n' +
          'Puedo ayudarte con los siguientes temas:'
        );
        this.renderQuickReplies([START_QUOTE, ...KB]);
        return;
      }

      this.addBot(intent.answer);
      // Sugerir otras opciones relacionadas
      const others = KB.filter((k) => k.id !== intent.id).slice(0, 3);
      this.renderQuickReplies([START_QUOTE, ...others]);
    },

  };

  const QuoteWizard = {
    state: loadQuoteDraft(),

    save() {
      try {
        if (!this.state.consentAccepted) {
          delete this.state.answers.city;
          delete this.state.answers.name;
          delete this.state.answers.company;
          delete this.state.answers.phone;
        }
        sessionStorage.setItem(QUOTE_STORAGE_KEY, JSON.stringify(this.state));
      } catch {
        this.setStatus('No se pudo guardar el progreso en esta sesión.');
      }
    },

    revokeConsent() {
      this.state = { step: 0, answers: {}, consentAccepted: false };
      try {
        sessionStorage.removeItem(QUOTE_STORAGE_KEY);
      } catch {
        this.setStatus('No se pudo borrar el borrador de esta sesión.');
      }
      Chat.body.replaceChildren();
      Chat.quick.replaceChildren();
      Chat.addBot('Se retiró la autorización y se borró el borrador de esta sesión. Puedes iniciar una nueva solicitud.');
      this.renderStep();
    },

    start() {
      Chat.mode = 'quote';
      Chat.toggleMenu(false);
      Chat.toggle(true);
      Chat.body.replaceChildren();
      Chat.quick.replaceChildren();
      if (this.state.step > 0) Chat.addBot('Retomamos tu solicitud. Puedes revisar y editar tus respuestas al final.');
      else Chat.addBot('Te haré seis preguntas para preparar tu solicitud.');
      emitAnalytics('wiming:chat-start', { flow: 'quote' });
      this.renderStep();
    },

    renderStep() {
      Chat.body.setAttribute('aria-label', 'Flujo de solicitud de cotización');
      Chat.quick.replaceChildren();

      if (this.state.step < QUOTE_STEPS.length) {
        Chat.inputForm.hidden = true;
        const step = QUOTE_STEPS[this.state.step];
        Chat.addBot(`${this.state.step + 1} de 6 · ${step.question}`);
        step.options.forEach((option) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.textContent = option;
          button.addEventListener('click', () => this.choose(step.key, option));
          Chat.quick.appendChild(button);
        });
        Chat.quick.hidden = false;
        return;
      }

      if (this.state.step === 4) {
        Chat.addBot('5 de 6 · ¿En qué ciudad se realizará el proyecto?');
        Chat.inputForm.hidden = false;
        Chat.quick.hidden = true;
        Chat.input.value = this.state.answers.city || '';
        Chat.input.placeholder = 'Escribe la ciudad';
        Chat.input.setAttribute('aria-label', 'Ciudad del proyecto');
        Chat.input.disabled = !this.state.consentAccepted;
        if (!this.state.consentAccepted) {
          appendDataConsent(Chat.body, 'quote-city-consent', false, (accepted) => {
            if (!accepted) {
              this.revokeConsent();
              return;
            }
            this.state.consentAccepted = true;
            this.save();
            Chat.input.disabled = false;
            Chat.input.focus();
          });
        } else {
          Chat.input.focus();
        }
        return;
      }

      Chat.inputForm.hidden = true;
      Chat.quick.hidden = true;
      if (this.state.step === 5) {
        Chat.addBot('6 de 6 · Comparte tu nombre, empresa y teléfono celular colombiano.');
        this.renderContactFields();
        return;
      }

      Chat.addBot('Revisa y edita el resumen antes de abrir WhatsApp.');
      this.renderSummary();
    },

    choose(key, value) {
      Chat.addUser(value);
      this.state.answers[key] = value;
      this.state.step += 1;
      this.save();
      emitAnalytics('wiming:chat-step-completed', { step: this.state.step, field: key });
      this.renderStep();
    },

    acceptCity(value) {
      if (!this.state.consentAccepted) {
        this.setStatus('Autoriza el tratamiento de datos antes de ingresar la ciudad.');
        return;
      }
      const city = WM_SECURITY.cleanText(value, 80);
      if (city.length < 2 || city.length > 80) {
        this.setStatus('Escribe una ciudad válida (de 2 a 80 caracteres).');
        return;
      }
      this.state.answers.city = city;
      this.state.step = 5;
      this.save();
      emitAnalytics('wiming:chat-step-completed', { step: 5, field: 'city' });
      Chat.addUser(city);
      Chat.input.value = '';
      Chat.inputForm.hidden = true;
      this.renderStep();
    },

    renderContactFields() {
      const form = document.createElement('form');
      form.className = 'quote-contact-form';
      form.noValidate = true;
      const honeypot = appendHoneypot(form);
      appendDataConsent(form, 'quote-contact-consent', this.state.consentAccepted, (accepted) => {
        if (!accepted) {
          this.revokeConsent();
          return;
        }
        this.state.consentAccepted = true;
        form.querySelectorAll('[data-private-field]').forEach((input) => { input.disabled = false; });
        this.save();
        form.elements.name.focus();
      });
      const fields = [
        ['name', 'Nombre', 'text', 'name', 100],
        ['company', 'Empresa', 'text', 'organization', 120],
        ['phone', 'Teléfono celular', 'tel', 'tel', 20]
      ];

      fields.forEach(([key, labelText, type, autocomplete, maxLength]) => {
        const label = document.createElement('label');
        label.className = 'quote-field';
        label.textContent = labelText;
        const input = document.createElement('input');
        input.type = type;
        input.name = key;
        input.autocomplete = autocomplete;
        input.maxLength = maxLength;
        input.required = true;
        input.disabled = !this.state.consentAccepted;
        input.dataset.privateField = 'true';
        input.value = this.state.answers[key] || '';
        if (key === 'phone') input.placeholder = '300 123 4567 o +57 300 123 4567';
        input.addEventListener('input', () => {
          input.value = WM_SECURITY.cleanText(input.value, maxLength);
          if (!this.state.consentAccepted) return;
          this.state.answers[key] = input.value;
          this.save();
        });
        label.appendChild(input);
        form.appendChild(label);
      });

      const status = document.createElement('p');
      status.className = 'quote-status';
      status.setAttribute('role', 'status');
      form.appendChild(status);

      const submit = document.createElement('button');
      submit.type = 'submit';
      submit.className = 'btn btn-danger';
      submit.textContent = 'Ver resumen';
      form.appendChild(submit);

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (honeypot.value.trim()) return;
        const inputs = [...form.querySelectorAll('input')];
        inputs.filter((input) => input.type !== 'checkbox').forEach((input) => {
          input.value = WM_SECURITY.cleanText(input.value, input.maxLength > 0 ? input.maxLength : 1000);
        });
        if (!form.reportValidity()) return;
        if (!isColombianMobile(form.elements.phone.value)) {
          status.textContent = 'Ingresa un celular colombiano válido, por ejemplo 300 123 4567.';
          form.elements.phone.focus();
          return;
        }
        fields.forEach(([key]) => { this.state.answers[key] = form.elements[key].value; });
        this.state.step = 6;
        this.save();
        emitAnalytics('wiming:chat-step-completed', { step: 6, field: 'contact' });
        this.renderStep();
      });

      Chat.body.appendChild(form);
      form.elements.name.focus();
      Chat.body.scrollTop = Chat.body.scrollHeight;
    },

    renderSummary() {
      const form = document.createElement('form');
      form.className = 'quote-summary-form';
      form.noValidate = true;
      const honeypot = appendHoneypot(form);
      appendDataConsent(form, 'quote-summary-consent', this.state.consentAccepted, (accepted) => {
        if (!accepted) {
          this.revokeConsent();
          return;
        }
        this.state.consentAccepted = true;
        form.querySelectorAll('[data-private-field]').forEach((input) => { input.disabled = false; });
        this.save();
      });

      const selectField = (key, labelText, options) => {
        const label = document.createElement('label');
        label.className = 'quote-field';
        label.textContent = labelText;
        const select = document.createElement('select');
        select.name = key;
        select.required = true;
        options.forEach((value) => {
          const option = document.createElement('option');
          option.value = value;
          option.textContent = value;
          select.appendChild(option);
        });
        select.value = this.state.answers[key] || options[0];
        select.addEventListener('change', () => {
          this.state.answers[key] = select.value;
          this.save();
        });
        label.appendChild(select);
        form.appendChild(label);
      };

      const inputField = (key, labelText, type, autocomplete) => {
        const label = document.createElement('label');
        label.className = 'quote-field';
        label.textContent = labelText;
        const input = document.createElement('input');
        input.type = type;
        input.name = key;
        input.autocomplete = autocomplete;
        input.maxLength = key === 'city' ? 80 : key === 'name' ? 100 : key === 'company' ? 120 : 20;
        input.required = true;
        input.disabled = !this.state.consentAccepted;
        input.dataset.privateField = 'true';
        input.value = this.state.answers[key] || '';
        input.addEventListener('input', () => {
          input.value = WM_SECURITY.cleanText(input.value, input.maxLength);
          if (!this.state.consentAccepted) return;
          this.state.answers[key] = input.value;
          this.save();
        });
        label.appendChild(input);
        form.appendChild(label);
      };

      selectField('product', 'Producto', QUOTE_PRODUCTS);
      selectField('project', 'Tipo de proyecto', QUOTE_STEPS[1].options);
      selectField('sector', 'Sector', QUOTE_STEPS[2].options);
      selectField('urgency', 'Urgencia', QUOTE_STEPS[3].options);
      inputField('city', 'Ciudad', 'text', 'address-level2');
      inputField('name', 'Nombre', 'text', 'name');
      inputField('company', 'Empresa', 'text', 'organization');
      inputField('phone', 'Teléfono celular', 'tel', 'tel');

      const status = document.createElement('p');
      status.className = 'quote-status';
      status.setAttribute('role', 'status');
      form.appendChild(status);

      const actions = document.createElement('div');
      actions.className = 'quote-summary-actions';
      const update = document.createElement('button');
      update.type = 'submit';
      update.className = 'btn btn-outline-danger';
      update.textContent = 'Guardar cambios';
      actions.appendChild(update);

      const send = document.createElement('button');
      send.type = 'button';
      send.className = 'btn btn-success';
      send.textContent = 'Enviar mi solicitud por WhatsApp';
      actions.appendChild(send);

      const reset = document.createElement('button');
      reset.type = 'button';
      reset.className = 'btn btn-outline-secondary';
      reset.textContent = 'Nueva conversación';
      reset.addEventListener('click', () => Chat.requestConversationReset(reset));
      actions.appendChild(reset);
      form.appendChild(actions);

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (honeypot.value.trim()) return;
        status.textContent = 'Cambios guardados en esta sesión.';
        this.save();
      });

      send.addEventListener('click', () => {
        if (honeypot.value.trim()) return;
        const inputs = [...form.querySelectorAll('input:not([type="checkbox"])')];
        inputs.forEach((input) => {
          input.value = WM_SECURITY.cleanText(input.value, input.maxLength > 0 ? input.maxLength : 1000);
        });
        if (!form.reportValidity()) return;
        if (!isColombianMobile(form.elements.phone.value)) {
          status.textContent = 'Ingresa un celular colombiano válido, por ejemplo 300 123 4567.';
          form.elements.phone.focus();
          return;
        }

        const number = normalizedWhatsAppNumber();
        if (!/^57\d{10}$/.test(number)) {
          status.textContent = 'WhatsApp no está configurado correctamente. Contacta a WIMING SAS por otro canal.';
          return;
        }
        if (!WM_SECURITY.allowSubmission('quote-whatsapp')) {
          status.textContent = 'Se alcanzó el límite de envíos de esta sesión. Intenta de nuevo más tarde.';
          return;
        }

        ['city', 'name', 'company', 'phone'].forEach((key) => {
          this.state.answers[key] = form.elements[key].value;
        });
        this.save();
        const answers = this.state.answers;
        const message = `Hola WIMING SAS, solicité una cotización desde la web.\nProducto: ${answers.product} | Proyecto: ${answers.project} | Sector: ${answers.sector} | Urgencia: ${answers.urgency} | Ciudad: ${answers.city}\nNombre: ${answers.name} | Empresa: ${answers.company} | Tel: ${answers.phone}`;
        const whatsappUrl = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
        emitAnalytics('wiming:chat-send-click', { channel: 'whatsapp' });
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        Chat.addBot('Listo, tu solicitud quedó preparada.');
        const anotherQuote = document.createElement('button');
        anotherQuote.type = 'button';
        anotherQuote.textContent = 'Hacer otra cotización';
        anotherQuote.addEventListener('click', () => Chat.requestConversationReset(anotherQuote));
        Chat.quick.replaceChildren(anotherQuote);
        Chat.quick.hidden = false;
      });

      Chat.body.appendChild(form);
      Chat.body.scrollTop = Chat.body.scrollHeight;
    },

    setStatus(message) {
      const status = document.createElement('p');
      status.className = 'quote-status';
      status.setAttribute('role', 'alert');
      status.textContent = message;
      Chat.body.appendChild(status);
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    renderWidget();
    Chat.init();
  });
})();
