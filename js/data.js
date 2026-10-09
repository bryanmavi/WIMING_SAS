/* =========================================================
   data.js
   Datos centralizados de servicios y productos.
   Modificar aquí para actualizar el sitio sin tocar HTML.
   ========================================================= */

window.WM_DATA = {
  servicios: [
    {
      icono: 'bi-cpu',
      titulo: 'Diseño de tableros',
      descripcion: 'Ingeniería personalizada según las necesidades de su subestación, cumpliendo RETIE e IEC 61439.'
    },
    {
      icono: 'bi-gear-wide-connected',
      titulo: 'Fabricación',
      descripcion: 'Producción nacional con materiales certificados y procesos de control de calidad rigurosos.'
    },
    {
      icono: 'bi-truck',
      titulo: 'Distribución',
      descripcion: 'Entrega oportuna a nivel nacional con logística especializada para equipos eléctricos.'
    },
    {
      icono: 'bi-tools',
      titulo: 'Mantenimiento',
      descripcion: 'Servicios preventivos y correctivos, termografía y pruebas eléctricas en sitio.'
    },
    {
      icono: 'bi-shield-check',
      titulo: 'Asesoría normativa',
      descripcion: 'Acompañamiento para cumplir RETIE, NTC 2050 e IEC en todos sus proyectos.'
    },
    {
      icono: 'bi-lightning-charge',
      titulo: 'Puesta en servicio',
      descripcion: 'Montaje, energización y pruebas de funcionamiento con personal certificado.'
    }
  ],

  productos: [
    {
      img: 'assets/img/celda-media-tension.webp',
      placeholder: 'assets/img/celda-media-tension-placeholder.svg',
      alt: 'Celda metálica de media tensión para subestación eléctrica',
      width: 600,
      height: 400,
      tag: 'Media tensión',
      titulo: 'Celda metálica MT 17.5 kV',
      descripcion: 'Solución de media tensión definida según las condiciones y requisitos de cada subestación.',
      especificaciones: [
        ['Tensión nominal', 'Por definir según el proyecto'],
        ['Corriente nominal', 'Por definir según el proyecto'],
        ['Nivel de cortocircuito', 'Por definir según el proyecto']
      ]
    },
    {
      img: 'assets/img/tablero-baja-tension.webp',
      placeholder: 'assets/img/tablero-baja-tension-placeholder.svg',
      alt: 'Tablero general de baja tensión para distribución eléctrica',
      width: 600,
      height: 400,
      tag: 'Baja tensión',
      titulo: 'Tablero general BT',
      descripcion: 'Distribución de baja tensión configurada según las cargas y condiciones de instalación.',
      especificaciones: [
        ['Tensión nominal', 'Por definir según el proyecto'],
        ['Corriente del barraje', 'Por definir según el proyecto'],
        ['Capacidad de cortocircuito', 'Por definir según el proyecto']
      ]
    },
    {
      img: 'assets/img/tablero-control-medida.webp',
      placeholder: 'assets/img/tablero-control-medida-placeholder.svg',
      alt: 'Tablero eléctrico de control y medida para subestación',
      width: 600,
      height: 400,
      tag: 'Control',
      titulo: 'Tablero de control y medida',
      descripcion: 'Integración de control y medición definida según las señales y equipos requeridos.',
      especificaciones: [
        ['Señales de control', 'Por definir según el proyecto'],
        ['Instrumentos de medida', 'Por definir según el proyecto'],
        ['Integración requerida', 'Por definir según el proyecto']
      ]
    },
    {
      img: 'assets/img/tablero-transferencia-automatica.webp',
      placeholder: 'assets/img/tablero-transferencia-automatica-placeholder.svg',
      alt: 'Tablero de transferencia automática entre red y planta eléctrica',
      width: 600,
      height: 400,
      tag: 'Transferencia',
      titulo: 'Tablero de transferencia automática',
      descripcion: 'Transferencia entre fuentes configurada de acuerdo con los requisitos de la instalación.',
      especificaciones: [
        ['Fuentes de alimentación', 'Por definir según el proyecto'],
        ['Corriente nominal', 'Por definir según el proyecto'],
        ['Modo de control', 'Por definir según el proyecto']
      ]
    },
    {
      img: 'assets/img/banco-condensadores.webp',
      placeholder: 'assets/img/banco-condensadores-placeholder.svg',
      alt: 'Banco de condensadores para compensación de energía reactiva',
      width: 600,
      height: 400,
      tag: 'Compensación',
      titulo: 'Banco de condensadores',
      descripcion: 'Compensación de energía reactiva dimensionada según las condiciones de la instalación.',
      especificaciones: [
        ['Potencia reactiva', 'Por definir según el proyecto'],
        ['Tensión nominal', 'Por definir según el proyecto'],
        ['Etapas de compensación', 'Por definir según el proyecto']
      ]
    },
    {
      img: 'assets/img/tablero-a-la-medida.webp',
      placeholder: 'assets/img/tablero-a-la-medida-placeholder.svg',
      alt: 'Tablero eléctrico diseñado a la medida para una aplicación industrial',
      width: 600,
      height: 400,
      tag: 'Especiales',
      titulo: 'Tableros a la medida',
      descripcion: 'Diseño particular para aplicaciones y condiciones de operación específicas.',
      especificaciones: [
        ['Aplicación', 'Por definir según el proyecto'],
        ['Tensión y corriente', 'Por definir según el proyecto'],
        ['Condiciones de instalación', 'Por definir según el proyecto']
      ]
    }
  ]
};
