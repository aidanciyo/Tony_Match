/*
 * Datos del CIFP Tony Gallardo: centro, familias profesionales, ciclos y curiosidades.
 *
 * Fuente: web oficial del centro (oferta educativa, contacto y noticias).
 * Para actualizar la oferta de cada curso basta con editar este archivo.
 *
 * Campos útiles de cada ciclo:
 *   nivel        'basico' | 'medio' | 'superior' | 'ifc'
 *   modalidades  ['presencial'] o ['presencial', 'semipresencial']
 *   turnos       ['mañana' | 'tarde' | 'noche'] — déjalo vacío si no está confirmado
 *                y la app invitará a consultarlo en secretaría.
 */
(function (root, factory) {
  var datos = factory();
  if (typeof module === 'object' && module.exports) module.exports = datos;
  else root.TonyMatch = Object.assign(root.TonyMatch || {}, datos);
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var WEB = 'https://www3.gobiernodecanarias.org/medusa/edublog/cifptonygallardo/';

  var CENTRO = {
    nombre: 'CIFP Tony Gallardo',
    nombreLargo: 'Centro Integrado de Formación Profesional Tony Gallardo',
    telefono: '+34 928 79 62 92',
    telefonoHref: 'tel:+34928796292',
    email: 'secretaria-35015887@gobiernodecanarias.org',
    direccion: 'Ctra. de las Coloradas, 35009 Las Palmas de Gran Canaria',
    barrio: 'La Isleta',
    mapa: 'https://www.google.com/maps/search/?api=1&query=CIFP%20Tony%20Gallardo%2C%20Ctra.%20de%20las%20Coloradas%2C%2035009%20Las%20Palmas%20de%20Gran%20Canaria',
    web: WEB,
    ofertaUrl: WEB + 'oferta-educativa/',
    admisionUrl: 'https://www.gobiernodecanarias.org/educacion/web/estudiantes/admision_alumnado/formacion_profesional/',
    redes: [
      { id: 'instagram', nombre: 'Instagram', usuario: '@cifptonygallardo', url: 'https://www.instagram.com/cifptonygallardo/' },
      { id: 'facebook', nombre: 'Facebook', usuario: 'CIFPTonyGallardo', url: 'https://www.facebook.com/CIFPTonyGallardo/' },
      { id: 'x', nombre: 'X', usuario: '@CIFPTonyGalardo', url: 'https://x.com/CIFPTonyGalardo' },
      { id: 'youtube', nombre: 'YouTube', usuario: '@cifptonygallardo', url: 'https://www.youtube.com/@cifptonygallardo' },
      { id: 'linkedin', nombre: 'LinkedIn', usuario: 'cifp-tony-gallardo', url: 'https://www.linkedin.com/company/cifp-tony-gallardo' }
    ],
    turnos: ['mañana', 'tarde', 'noche'],
    cifras: [
      { valor: '9', texto: 'familias profesionales' },
      { valor: '~700', texto: 'estudiantes' },
      { valor: '64', texto: 'docentes' },
      { valor: '~70 %', texto: 'encuentra trabajo' }
    ],
    historia: [
      { anio: '1994', texto: 'Abre como IES Nueva Isleta – Tony Gallardo, en La Isleta.' },
      { anio: '2016', texto: 'Pasa a llamarse IES Tony Gallardo.' },
      { anio: '2020', texto: 'Pone en marcha el Centro de Enseñanza en Línea de Canarias, pionero en España.' },
      { anio: '2022', texto: 'Se convierte en Centro Integrado de Formación Profesional: todo gira en torno a la FP.' }
    ],
    admision: {
      pasos: [
        { emoji: '📝', titulo: 'Pide plaza en primavera', texto: 'La solicitud para Grado Básico, Medio y Superior se abre en primavera (para el curso 2026/27 fue del 9 al 24 de abril).' },
        { emoji: '📋', titulo: 'Mira las listas', texto: 'Las listas provisionales salen a finales de junio y las definitivas a primeros de julio.' },
        { emoji: '✅', titulo: 'Matricúlate en julio', texto: 'Si tienes plaza, formaliza la matrícula en julio (en 2026, del 2 al 9 de julio).' }
      ],
      ifc: 'Los itinerarios IFC+21 tienen su propio plazo (en 2026 fue del 1 al 10 de junio).'
    }
  };

  var NIVELES = {
    basico: {
      nombre: 'Grado Básico', corto: 'Básico', orden: 1,
      requisito: 'Para jóvenes de 15 a 17 años sin la ESO terminada, con propuesta del equipo docente.'
    },
    medio: {
      nombre: 'Grado Medio', corto: 'Medio', orden: 2,
      requisito: 'Necesitas la ESO, un Grado Básico o aprobar la prueba de acceso (desde los 17 años).'
    },
    superior: {
      nombre: 'Grado Superior', corto: 'Superior', orden: 3,
      requisito: 'Necesitas Bachillerato, un Grado Medio o aprobar la prueba de acceso (desde los 19 años).'
    },
    ifc: {
      nombre: 'IFC+21 · FP Adaptada', corto: 'IFC+21', orden: 0,
      requisito: 'Formación Profesional Adaptada para personas de 21 años o más.'
    }
  };

  var FAMILIAS = [
    {
      id: 'afd',
      nombre: 'Actividades Físicas y Deportivas',
      corto: 'Deporte',
      emoji: '🏄',
      colores: ['#9B1B1F', '#F26A3D'],
      lema: 'Tu energía mueve a los demás',
      bio: 'Soy pura energía: gimnasio, playa, torneos y campamentos. Busco a alguien que disfrute moviéndose y contagiando las ganas de hacer deporte.',
      descripcion: 'Forma a profesionales que enseñan deporte, dinamizan actividades y diseñan entrenamientos para todo tipo de personas.',
      rasgos: ['💪 Energía', '🤸 Movimiento', '📣 Motivar']
    },
    {
      id: 'com',
      nombre: 'Comercio y Marketing',
      corto: 'Comercio',
      emoji: '🛍️',
      colores: ['#8F5310', '#D9A13B'],
      lema: 'Organizas, vendes y conectas',
      bio: 'Me va el movimiento de mercancías, las tiendas y los clientes. Busco a alguien ordenado, con don de gentes y buen ojo para los detalles.',
      descripcion: 'Se ocupa de la venta, la logística y el almacén, la atención al cliente y la promoción de productos.',
      rasgos: ['📦 Orden', '🗣️ Trato con clientes', '📈 Negocio']
    },
    {
      id: 'hot',
      nombre: 'Hostelería y Turismo',
      corto: 'Hostelería',
      emoji: '🍽️',
      colores: ['#7E0F4E', '#D6457A'],
      lema: 'Haces que la gente se sienta como en casa',
      bio: 'Terrazas llenas, cafés perfectos y clientes felices. Busco a alguien con sonrisa, reflejos y ganas de atender.',
      descripcion: 'Abarca la cocina, el servicio en sala y bar, el alojamiento y el turismo: un motor clave en Canarias.',
      rasgos: ['😊 Atención', '⚡ Reflejos', '🌍 Turismo']
    },
    {
      id: 'ina',
      nombre: 'Industrias Alimentarias',
      corto: 'Alimentación',
      emoji: '🥐',
      colores: ['#3E5B36', '#8BA24A'],
      lema: 'Conviertes ingredientes en momentos',
      bio: 'Huelo a pan recién hecho y a bizcocho de domingo. Busco a alguien paciente, cuidadoso y con mucha mano para las masas.',
      descripcion: 'Elabora, conserva y envasa alimentos con calidad y seguridad alimentaria, del obrador artesano a la industria.',
      rasgos: ['🥖 Obrador', '🧼 Higiene', '🎂 Creatividad']
    },
    {
      id: 'ima',
      nombre: 'Instalación y Mantenimiento',
      corto: 'Mantenimiento',
      emoji: '🤖',
      colores: ['#0F3F78', '#1FA2D6'],
      lema: 'Si algo se para, tú lo pones en marcha',
      bio: 'Robots, motores, cuadros eléctricos y máquinas que nunca descansan. Busco a alguien curioso que no se asuste de un cable suelto.',
      descripcion: 'Monta, mantiene y automatiza máquinas e instalaciones industriales: de la mecánica y la soldadura a la robótica.',
      rasgos: ['🔧 Arreglar', '⚡ Electricidad', '🤖 Robótica']
    },
    {
      id: 'mam',
      nombre: 'Madera, Mueble y Corcho',
      corto: 'Madera',
      emoji: '🪑',
      colores: ['#6B4423', '#B7864E'],
      lema: 'Creas cosas que duran toda la vida',
      bio: 'Huelo a madera recién cortada y sueño en 3D. Busco a alguien con buen ojo, paciencia y ganas de crear con sus manos.',
      descripcion: 'Diseña, fabrica e instala muebles y carpintería, combinando el oficio artesano con maquinaria de control numérico.',
      rasgos: ['🙌 Hacer con las manos', '📐 Diseño', '🌳 Sostenibilidad']
    },
    {
      id: 'san',
      nombre: 'Sanidad',
      corto: 'Sanidad',
      emoji: '🩺',
      colores: ['#285A66', '#35B3A5'],
      lema: 'Cuidas la salud de la gente',
      bio: 'Batas, sonrisas y mucho cuidado por los demás. Busco a alguien con empatía, buen pulso y que no se maree con facilidad.',
      descripcion: 'Forma a profesionales que cuidan, previenen y acompañan a pacientes en hospitales, centros de salud y clínicas.',
      rasgos: ['❤️ Cuidar', '🔬 Precisión', '🧼 Higiene']
    },
    {
      id: 'sea',
      nombre: 'Seguridad y Medio Ambiente',
      corto: 'Seguridad',
      emoji: '🚨',
      colores: ['#1B2A4A', '#C62D3A'],
      lema: 'Mantienes la calma cuando todo arde',
      bio: 'Sirenas, simulacros y planes para que todo el mundo vuelva a casa sano y salvo. Busco a alguien valiente, con sangre fría y sentido de la responsabilidad.',
      descripcion: 'Protege a las personas, los bienes y el entorno: emergencias, protección civil, vigilancia y prevención de riesgos.',
      rasgos: ['🧊 Sangre fría', '🛡️ Proteger', '📋 Prevenir']
    },
    {
      id: 'ssc',
      nombre: 'Servicios Socioculturales y a la Comunidad',
      corto: 'Social',
      emoji: '🤝',
      colores: ['#8E2C4A', '#DE6A86'],
      lema: 'Haces la vida de los demás un poco mejor',
      bio: 'Peques, mayores y personas que necesitan un empujón. Busco a alguien que sepa escuchar, con paciencia infinita y mucho corazón.',
      descripcion: 'Educa, acompaña y cuida a personas de todas las edades para que ganen autonomía y bienestar.',
      rasgos: ['👂 Escuchar', '💞 Empatía', '🌱 Educar']
    }
  ];

  var CICLOS = [
    // Industrias Alimentarias
    {
      id: 'ina-panaderia', familia: 'ina', nivel: 'basico',
      nombre: 'Actividades de Panadería y Pastelería',
      modalidades: ['presencial'], turnos: [], duracion: '2 cursos',
      resumen: 'Aprende a elaborar pan, bollería y pastelería: amasar, formar, hornear y decorar con higiene y seguridad alimentaria.',
      salidas: ['Ayudante de panadería y pastelería', 'Obradores y pastelerías', 'Supermercados con horno propio'],
      extra: 'Al terminarlo consigues también el título de la ESO.',
      url: WEB + 'oferta-educativa/'
    },
    // Instalación y Mantenimiento
    {
      id: 'ima-fabricacion', familia: 'ima', nivel: 'basico',
      nombre: 'Fabricación y Montaje',
      modalidades: ['presencial'], turnos: [], duracion: '2 cursos',
      resumen: 'Mecaniza y suelda piezas, monta carpintería metálica e instalaciones básicas de fontanería, calefacción y climatización.',
      salidas: ['Ayudante en talleres de fabricación', 'Carpintería metálica', 'Fontanería y climatización'],
      extra: 'Al terminarlo consigues también el título de la ESO.',
      url: WEB + 'oferta-educativa/'
    },
    {
      id: 'ima-electromecanico', familia: 'ima', nivel: 'medio',
      nombre: 'Mantenimiento Electromecánico',
      modalidades: ['presencial'], turnos: [], duracion: '2 cursos · 2.000 h',
      resumen: 'Monta y mantiene maquinaria y equipos industriales: sistemas mecánicos, eléctricos, neumáticos e hidráulicos.',
      salidas: ['Mecánico/a de mantenimiento industrial', 'Montaje de maquinaria', 'Mantenimiento en fábricas, hoteles y puertos'],
      url: WEB + 'oferta-educativa/'
    },
    {
      id: 'ima-mecatronica', familia: 'ima', nivel: 'superior',
      nombre: 'Mecatrónica Industrial',
      modalidades: ['presencial'], turnos: [], duracion: '2 cursos · 2.000 h',
      resumen: 'Diseña, programa y mantiene sistemas automatizados que combinan mecánica, electrónica e informática: robótica, PLC e hidráulica.',
      salidas: ['Técnico/a de sistemas automatizados', 'Robótica industrial', 'Jefe/a de equipo de montaje y mantenimiento'],
      extra: 'Su alumnado ha hecho prácticas Erasmus+ en una empresa puntera de robótica.',
      url: WEB + 'tecnico-superior-en-mecatronica-industrial/'
    },
    // Madera, Mueble y Corcho
    {
      id: 'mam-carpinteria-gb', familia: 'mam', nivel: 'basico',
      nombre: 'Carpintería y Mueble',
      modalidades: ['presencial'], turnos: [], duracion: '2 cursos',
      resumen: 'Da tus primeros pasos en el taller: preparar la madera, mecanizar piezas, montar muebles y aplicar acabados.',
      salidas: ['Ayudante de carpintería', 'Montaje de muebles', 'Almacenes de madera'],
      extra: 'Al terminarlo consigues también el título de la ESO.',
      url: WEB + 'oferta-educativa/'
    },
    {
      id: 'mam-carpinteria-gm', familia: 'mam', nivel: 'medio',
      nombre: 'Carpintería y Mueble',
      modalidades: ['presencial'], turnos: [], duracion: '2 cursos · 2.000 h',
      resumen: 'Diseña, fabrica e instala muebles y elementos de carpintería con herramientas y maquinaria profesional.',
      salidas: ['Carpintero/a y ebanista', 'Montaje de cocinas y armarios', 'Operador/a de maquinaria CNC'],
      url: WEB + 'titulo-medio-en-carpinteria-y-mueble/'
    },
    {
      id: 'mam-diseno', familia: 'mam', nivel: 'superior',
      nombre: 'Diseño y Amueblamiento',
      modalidades: ['presencial'], turnos: [], duracion: '2 cursos · 2.000 h',
      resumen: 'Diseña muebles y proyectos de amueblamiento de interiores y gestiona su fabricación e instalación.',
      salidas: ['Diseñador/a de mobiliario', 'Proyectos de interiorismo', 'Jefe/a de taller o producción'],
      url: WEB + 'oferta-educativa/'
    },
    // Servicios Socioculturales y a la Comunidad
    {
      id: 'ssc-dependencia', familia: 'ssc', nivel: 'medio',
      nombre: 'Atención a Personas en Situación de Dependencia',
      modalidades: ['presencial'], turnos: [], duracion: '2 cursos · 2.000 h',
      resumen: 'Atiende a personas mayores o con discapacidad en su día a día, en casa o en centros, fomentando su autonomía.',
      salidas: ['Ayuda a domicilio', 'Gerocultor/a en residencias', 'Asistente personal', 'Teleasistencia'],
      url: WEB + 'familia-profesional-de-servicios-socioculturales-y-a-la-comunidad/'
    },
    {
      id: 'ssc-infantil', familia: 'ssc', nivel: 'superior',
      nombre: 'Educación Infantil',
      modalidades: ['presencial', 'semipresencial'], turnos: [], duracion: '2 cursos · 2.000 h',
      resumen: 'Diseña y lleva a cabo actividades educativas y de juego para niños y niñas de 0 a 6 años.',
      salidas: ['Educador/a en escuelas infantiles (0-3)', 'Ludotecas', 'Animación y ocio infantil'],
      url: WEB + 'familia-profesional-de-servicios-socioculturales-y-a-la-comunidad/'
    },
    {
      id: 'ssc-integracion', familia: 'ssc', nivel: 'superior',
      nombre: 'Integración Social',
      modalidades: ['presencial', 'semipresencial'], turnos: [], duracion: '2 cursos · 2.000 h',
      resumen: 'Acompaña a personas y colectivos en riesgo de exclusión para que ganen autonomía y se integren en la sociedad.',
      salidas: ['Integrador/a social', 'Centros de menores y pisos tutelados', 'Programas de inserción laboral'],
      url: WEB + 'familia-profesional-de-servicios-socioculturales-y-a-la-comunidad/'
    },
    // Actividades Físicas y Deportivas
    {
      id: 'afd-sociodeportiva', familia: 'afd', nivel: 'superior',
      nombre: 'Enseñanza y Animación Sociodeportiva',
      modalidades: ['presencial'], turnos: [], duracion: '2 cursos · 2.000 h',
      resumen: 'Enseña deportes y dinamiza actividades físicas y recreativas para todas las edades y colectivos.',
      salidas: ['Monitor/a y coordinador/a deportivo/a', 'Animación en hoteles y campamentos', 'Actividades para la inclusión'],
      url: WEB + 'oferta-educativa/'
    },
    {
      id: 'afd-acondicionamiento', familia: 'afd', nivel: 'superior',
      nombre: 'Acondicionamiento Físico',
      modalidades: ['presencial'], turnos: [], duracion: '2 cursos · 2.000 h',
      resumen: 'Programa y dirige entrenamientos personalizados y actividades de fitness en sala, con música y en el agua.',
      salidas: ['Entrenador/a personal', 'Monitor/a de fitness y actividades dirigidas', 'Fitness acuático'],
      url: WEB + 'oferta-educativa/'
    },
    // Sanidad
    {
      id: 'san-enfermeria', familia: 'san', nivel: 'medio',
      nombre: 'Cuidados Auxiliares de Enfermería',
      modalidades: ['presencial'], turnos: [],
      resumen: 'Cuida a pacientes y colabora con el equipo de enfermería: higiene, alimentación, movilización y material sanitario.',
      salidas: ['TCAE en hospitales y centros de salud', 'Residencias', 'Clínicas y consultas'],
      url: WEB + 'oferta-educativa/'
    },
    {
      id: 'san-bucodental', familia: 'san', nivel: 'superior',
      nombre: 'Higiene Bucodental',
      modalidades: ['presencial'], turnos: [], duracion: '2 cursos · 2.000 h',
      resumen: 'Previene enfermedades bucodentales, promueve hábitos saludables y trabaja junto al equipo de odontología con tecnología de vanguardia.',
      salidas: ['Higienista dental en clínicas', 'Programas de salud bucodental', 'Educación sanitaria'],
      url: WEB + 'oferta-educativa/cf-superior-higiene-bucodental/'
    },
    // Seguridad y Medio Ambiente
    {
      id: 'sea-seguridad', familia: 'sea', nivel: 'medio',
      nombre: 'Seguridad',
      modalidades: ['presencial'], turnos: [], duracion: '2 cursos · 2.000 h',
      resumen: 'Vigilancia y protección de personas y bienes en espacios públicos y privados, urbanos y naturales.',
      salidas: ['Vigilante de seguridad', 'Escolta', 'Guarda rural'],
      extra: 'Algunas salidas requieren además la habilitación oficial correspondiente.',
      url: WEB + 'oferta-educativa/'
    },
    {
      id: 'sea-emergencias', familia: 'sea', nivel: 'medio',
      nombre: 'Emergencias y Protección Civil',
      modalidades: ['presencial'], turnos: [], duracion: '2 cursos · 2.000 h',
      resumen: 'Interviene en incendios, rescates y emergencias, y colabora en la prevención de riesgos en la ciudad y en la naturaleza.',
      salidas: ['Bombero/a (por oposición)', 'Bombero/a forestal', 'Salvamento y rescate', 'Protección civil'],
      url: WEB + 'oferta-educativa/'
    },
    {
      id: 'sea-coordinacion', familia: 'sea', nivel: 'superior',
      nombre: 'Coordinación de Emergencias y Protección Civil',
      modalidades: ['presencial'], turnos: [], duracion: '2 cursos · 2.000 h',
      resumen: 'Planifica y coordina la respuesta ante emergencias: recursos, equipos, simulacros y planes de autoprotección.',
      salidas: ['Centros de coordinación de emergencias', 'Jefatura de intervención', 'Planes de autoprotección'],
      extra: 'Hace prácticas con el Consorcio de Emergencias de Gran Canaria.',
      url: WEB + 'oferta-educativa/'
    },
    {
      id: 'sea-prevencion', familia: 'sea', nivel: 'superior',
      nombre: 'Prevención de Riesgos Profesionales',
      modalidades: ['presencial'], turnos: [], duracion: '2 cursos',
      resumen: 'Evalúa los riesgos del trabajo y propone medidas para evitar accidentes y enfermedades profesionales.',
      salidas: ['Técnico/a de prevención en empresas', 'Servicios de prevención', 'Seguridad en obras'],
      url: WEB + 'oferta-educativa/'
    },
    // Comercio y Marketing
    {
      id: 'com-almacen', familia: 'com', nivel: 'ifc',
      nombre: 'Actividades Auxiliares de Almacén',
      modalidades: ['presencial'], turnos: [],
      resumen: 'Itinerario de Formación Profesional Adaptada: recepción y colocación de mercancías y preparación de pedidos.',
      salidas: ['Auxiliar de almacén', 'Reposición', 'Preparación de pedidos'],
      url: WEB + 'oferta-educativa/'
    },
    // Hostelería y Turismo
    {
      id: 'hot-restaurante', familia: 'hot', nivel: 'ifc',
      nombre: 'Operaciones Básicas de Restaurante y Bar',
      modalidades: ['presencial'], turnos: [],
      resumen: 'Itinerario de Formación Profesional Adaptada: montaje de mesas, servicio básico de comidas y bebidas y atención al cliente.',
      salidas: ['Ayudante de camarero/a', 'Cafeterías', 'Catering'],
      url: WEB + 'oferta-educativa/'
    }
  ];

  var CURIOSIDADES = [
    { id: 'cifp-2022', emoji: '🏛️', texto: 'Desde el 1 de septiembre de 2022 somos Centro Integrado de Formación Profesional: aquí todo gira en torno a la FP.' },
    { id: 'insercion', emoji: '💼', texto: 'Alrededor del 70 % del alumnado titulado encuentra trabajo al terminar su formación.' },
    { id: 'barco', emoji: '⛵', texto: 'El alumnado de FP Básica llegó a construir un barco de madera. Sí, un barco de verdad.' },
    { id: 'erasmus', emoji: '✈️', texto: 'Con Erasmus+ puedes formarte fuera: alumnado de Mecatrónica Industrial ha hecho sus prácticas en una empresa puntera de robótica.' },
    { id: 'escultor', emoji: '🗿', texto: 'El centro lleva el nombre de Tony Gallardo (1929-1996), escultor grancanario conocido como «el escultor de la lava».' },
    { id: 'consorcio', emoji: '🚒', texto: 'El alumnado de Emergencias hace prácticas con el Consorcio de Emergencias de Gran Canaria.' },
    { id: 'mercabasica', emoji: '🎄', texto: 'MercaBásica es el mercadillo navideño e inclusivo que organiza el propio alumnado.' },
    { id: 'comunidad', emoji: '🌗', texto: 'Somos unas 700 personas estudiando y 64 docentes, con turnos de mañana, tarde y noche.' },
    { id: 'c2c', emoji: '🌱', texto: 'Alumnado de Carpintería y Mueble ha participado en la microcredencial europea «Cradle-to-Cradle Design» sobre diseño sostenible.' },
    { id: 'origen', emoji: '🏫', texto: 'Abrió sus puertas en el curso 1994-1995 como IES Nueva Isleta – Tony Gallardo, en La Isleta.' }
  ];

  return { CENTRO: CENTRO, NIVELES: NIVELES, FAMILIAS: FAMILIAS, CICLOS: CICLOS, CURIOSIDADES: CURIOSIDADES };
});
