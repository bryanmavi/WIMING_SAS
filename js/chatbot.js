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

  /* ---------- Render del widget ---------- */
  function renderWidget() {
    const root = document.getElementById('chatbot-root');
    if (!root) return;
    root.innerHTML = `
      <button class="chatbot-toggle" id="cb-toggle" aria-label="Abrir asistente">
        <i class="bi bi-chat-dots-fill"></i>
      </button>
      <div class="chatbot-window" id="cb-window" role="dialog" aria-label="Asistente IA WIMING">
        <div class="chatbot-header">
          <div class="avatar"><i class="bi bi-robot"></i></div>
          <div>
            <h6>Asistente WIMING</h6>
            <small>● En línea · Respuestas instantáneas</small>
          </div>
          <button class="close-btn" id="cb-close" aria-label="Cerrar">&times;</button>
        </div>
        <div class="chatbot-body" id="cb-body"></div>
        <div class="quick-replies" id="cb-quick"></div>
        <form class="chatbot-input" id="cb-form">
          <input type="text" id="cb-input" placeholder="Escribe tu pregunta..." autocomplete="off" />
          <button type="submit" aria-label="Enviar"><i class="bi bi-send-fill"></i></button>
        </form>
      </div>
    `;
  }

  /* ---------- Lógica del chat ---------- */
  const Chat = {
    body: null,
    quick: null,

    init() {
      this.body = document.getElementById('cb-body');
      this.quick = document.getElementById('cb-quick');

      document.getElementById('cb-toggle').addEventListener('click', () => this.toggle());
      document.getElementById('cb-close').addEventListener('click', () => this.toggle(false));
      document.getElementById('cb-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('cb-input');
        const text = input.value.trim();
        if (!text) return;
        this.sendUser(text);
        input.value = '';
      });

      this.greet();
    },

    toggle(force) {
      const w = document.getElementById('cb-window');
      const shouldOpen = force === undefined ? !w.classList.contains('open') : force;
      w.classList.toggle('open', shouldOpen);
      if (shouldOpen) document.getElementById('cb-input').focus();
    },

    greet() {
      this.addBot(
        '¡Hola! 👋 Soy el asistente virtual de WIMING SAS.\n' +
        'Puedo ayudarte con información técnica sobre nuestros tableros eléctricos.\n\n' +
        '¿Sobre qué tema quieres saber?'
      );
      this.renderQuickReplies(KB.slice(0, 4));
    },

    addMessage(text, sender) {
      const msg = document.createElement('div');
      msg.className = `chat-msg ${sender}`;
      msg.innerHTML = `<div class="bubble">${this.escape(text)}</div>`;
      this.body.appendChild(msg);
      this.body.scrollTop = this.body.scrollHeight;
    },

    addBot(text) { this.addMessage(text, 'bot'); },
    addUser(text) { this.addMessage(text, 'user'); },

    showTyping() {
      const msg = document.createElement('div');
      msg.className = 'chat-msg bot typing';
      msg.id = 'cb-typing';
      msg.innerHTML = `<div class="bubble"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>`;
      this.body.appendChild(msg);
      this.body.scrollTop = this.body.scrollHeight;
    },

    hideTyping() {
      const t = document.getElementById('cb-typing');
      if (t) t.remove();
    },

    renderQuickReplies(items) {
      this.quick.innerHTML = '';
      items.forEach((it) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = it.label;
        btn.addEventListener('click', () => this.sendUser(it.label, it));
        this.quick.appendChild(btn);
      });
    },

    sendUser(text, matchedIntent) {
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
        this.renderQuickReplies(KB.slice(0, 4));
        return;
      }

      if (!intent && FAREWELLS.some((g) => t.includes(g))) {
        this.addBot('¡Gracias por contactarnos! Que tengas un excelente día. ⚡');
        this.renderQuickReplies(KB.slice(0, 4));
        return;
      }

      if (!intent) {
        this.addBot(
          'No estoy seguro de haber entendido. 🤔\n' +
          'Puedo ayudarte con los siguientes temas:'
        );
        this.renderQuickReplies(KB);
        return;
      }

      this.addBot(intent.answer);
      // Sugerir otras opciones relacionadas
      const others = KB.filter((k) => k.id !== intent.id).slice(0, 3);
      this.renderQuickReplies(others);
    },

    escape(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML.replace(/\n/g, '<br>');
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    renderWidget();
    Chat.init();
  });
})();
