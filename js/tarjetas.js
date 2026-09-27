/*
 * Mazo de tarjetas de «Haz Match con el CIFP Tony Gallardo».
 *
 * Tipos:
 *   gusto     Afirmación sobre gustos, manías o situaciones. Like / paso / superlike.
 *   versus    «Esto o aquello»: cada lado suma a familias distintas.
 *   perfil    Perfil de ejemplo (estilo Tinder) de alguien que trabaja de algo.
 *   pregunta  Pregunta rápida con opciones (estudios, edad, horario, gustos…).
 *
 * f: pesos por familia (1 = pista leve, 3 = pista fuerte).
 * c: pesos por ciclo, para ordenar los ciclos dentro de la familia ganadora.
 * Las tarjetas no revelan la familia: el color de cada tarjeta es independiente.
 */
(function (root, factory) {
  var mazo = factory();
  if (typeof module === 'object' && module.exports) module.exports = mazo;
  else root.TonyMatch = Object.assign(root.TonyMatch || {}, mazo);
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var CATEGORIAS = {
    plan: { etiqueta: 'Planazo', emoji: '🎉' },
    mania: { etiqueta: 'Confiesa', emoji: '🙊' },
    habilidad: { etiqueta: 'Se te da bien', emoji: '✨' },
    situacion: { etiqueta: 'Situación', emoji: '🎬' },
    valor: { etiqueta: 'Lo que te mueve', emoji: '💭' }
  };

  var GUSTOS = [
    { id: 'manos', cat: 'mania', emoji: '🙌', deco: ['🧤', '✨'], texto: 'Mancharte las manos de serrín, grasa o harina no te importa lo más mínimo', corto: 'Mancharte las manos sin drama', f: { ima: 2, mam: 2, ina: 2, hot: 1 } },
    { id: 'desmontar', cat: 'mania', emoji: '🔩', deco: ['🧸', '⚙️'], texto: 'De peque desmontabas los juguetes para ver qué había dentro', corto: 'Desmontar cosas para ver cómo funcionan', f: { ima: 3, mam: 1 }, c: { 'ima-mecatronica': 1, 'ima-electromecanico': 1 } },
    { id: 'ikea', cat: 'habilidad', emoji: '🧩', deco: ['🔧', '🛋️'], texto: 'Montas un mueble de IKEA sin mirar las instrucciones… y no sobra ni un tornillo', corto: 'Montar muebles sin instrucciones', f: { mam: 3, ima: 1 }, c: { 'mam-carpinteria-gm': 1, 'mam-carpinteria-gb': 1 } },
    { id: 'abuela', cat: 'habilidad', emoji: '👵', deco: ['📱', '💞'], texto: 'Eres quien le explica el móvil a tu abuela, con toda la paciencia del mundo', corto: 'Tener paciencia infinita', f: { ssc: 3, san: 1 }, c: { 'ssc-dependencia': 2 } },
    { id: 'calma', cat: 'habilidad', emoji: '🧘', deco: ['🌪️', '🧊'], texto: 'Cuando hay un lío, tú mantienes la calma y dices qué hay que hacer', corto: 'Mantener la calma en pleno lío', f: { sea: 3, san: 1, ssc: 1 }, c: { 'sea-coordinacion': 2, 'sea-emergencias': 1 } },
    { id: 'roque', cat: 'plan', emoji: '⛰️', deco: ['🥪', '🌄'], texto: 'Plan de finde: ruta al Roque Nublo y bocadillo en la cumbre', corto: 'Las rutas por la montaña', f: { afd: 2, sea: 1 }, c: { 'afd-sociodeportiva': 1 } },
    { id: 'cocinar', cat: 'plan', emoji: '🍳', deco: ['🍝', '🎉'], texto: 'Cocinar para diez amigos te parece un planazo, no un marrón', corto: 'Cocinar para mucha gente', f: { hot: 3, ina: 2 } },
    { id: 'pan', cat: 'mania', emoji: '🥖', deco: ['🌅', '☕'], texto: 'El olor a pan recién hecho a primera hora te da la vida', corto: 'El olor a pan recién hecho', f: { ina: 3, hot: 1 }, c: { 'ina-panaderia': 2 } },
    { id: 'vender', cat: 'habilidad', emoji: '💸', deco: ['📱', '🏷️'], texto: 'Vendes cosas por internet y siempre consigues buen precio', corto: 'Vender y negociar', f: { com: 3 } },
    { id: 'escaparate', cat: 'mania', emoji: '🛒', deco: ['👀', '✨'], texto: 'Te fijas en cómo están colocados los escaparates y las estanterías del súper', corto: 'Fijarte en cómo se colocan los productos', f: { com: 2, mam: 1 } },
    { id: 'etiquetar', cat: 'mania', emoji: '📦', deco: ['🏷️', '✅'], texto: 'Ordenar, clasificar y etiquetar cajas te relaja muchísimo', corto: 'Ordenar y clasificar', f: { com: 3, ima: 1 }, c: { 'com-almacen': 2 } },
    { id: 'peques', cat: 'plan', emoji: '🧸', deco: ['🎨', '🎈'], texto: 'Pasar la tarde entera con peques de tres años te parece un planazo', corto: 'Pasar tiempo con peques', f: { ssc: 3 }, c: { 'ssc-infantil': 3 } },
    { id: 'gym', cat: 'habilidad', emoji: '🏋️', deco: ['💪', '⏱️'], texto: 'Te sabes tu rutina de gym de memoria y corriges la postura de tus colegas', corto: 'Entrenar y corregir la técnica', f: { afd: 3, san: 1 }, c: { 'afd-acondicionamiento': 3 } },
    { id: 'torneos', cat: 'plan', emoji: '🏐', deco: ['🏆', '📣'], texto: 'Organizar partidos, torneos o juegos para el grupo es lo tuyo', corto: 'Organizar juegos y torneos', f: { afd: 3, ssc: 1 }, c: { 'afd-sociodeportiva': 3 } },
    { id: 'sangre', cat: 'mania', emoji: '🩸', deco: ['🩹', '😎'], texto: 'Ver sangre no te marea lo más mínimo', corto: 'No marearte con la sangre', f: { san: 3, sea: 2 }, c: { 'san-enfermeria': 2, 'sea-emergencias': 1 } },
    { id: 'dientes', cat: 'mania', emoji: '🦷', deco: ['✨', '😁'], texto: 'Te lavas los dientes después de cada comida (y usas hilo dental)', corto: 'Cuidar la higiene al detalle', f: { san: 2 }, c: { 'san-bucodental': 3 } },
    { id: 'cuerpo', cat: 'mania', emoji: '🧬', deco: ['🧠', '🔬'], texto: 'Los documentales sobre el cuerpo humano te enganchan', corto: 'Saber cómo funciona el cuerpo', f: { san: 3, afd: 1 }, c: { 'san-enfermeria': 1, 'san-bucodental': 1, 'afd-acondicionamiento': 1 } },
    { id: 'serie', cat: 'mania', emoji: '📺', deco: ['🚑', '🍿'], texto: 'Tu serie favorita pasa en un hospital, una ambulancia o un parque de bomberos', corto: 'Las series de médicos y bomberos', f: { san: 2, sea: 2 } },
    { id: 'salida', cat: 'habilidad', emoji: '🚪', deco: ['🚨', '🏃'], texto: 'Si suena una alarma, eres quien sabe dónde está la salida de emergencia', corto: 'Saber qué hacer si suena la alarma', f: { sea: 3 }, c: { 'sea-prevencion': 1, 'sea-coordinacion': 1 } },
    { id: 'extintores', cat: 'mania', emoji: '🧯', deco: ['👀', '⚠️'], texto: 'Entras en un sitio y te fijas en si hay extintores, salidas y señales', corto: 'Detectar riesgos en cualquier sitio', f: { sea: 3 }, c: { 'sea-prevencion': 3 } },
    { id: 'silla-oficina', cat: 'mania', emoji: '💺', deco: ['😩', '⏰'], texto: 'Pasar ocho horas sentado frente a una pantalla sería tu pesadilla', corto: 'Un trabajo en movimiento, lejos de la silla', f: { afd: 2, sea: 1, ima: 1, hot: 1 } },
    { id: 'decorar', cat: 'habilidad', emoji: '🎨', deco: ['🛋️', '✨'], texto: 'Dibujas, diseñas o decoras tu cuarto y queda de revista', corto: 'Diseñar y decorar espacios', f: { mam: 3, com: 1 }, c: { 'mam-diseno': 3 } },
    { id: 'robots', cat: 'mania', emoji: '🤖', deco: ['🚁', '⚡'], texto: 'Los robots, los drones y todo lo que se mueve solo te flipan', corto: 'Los robots y los automatismos', f: { ima: 3 }, c: { 'ima-mecatronica': 3 } },
    { id: 'lego', cat: 'habilidad', emoji: '🧱', deco: ['🏗️', '💡'], texto: 'Con una caja de LEGO construyes lo tuyo sin mirar el manual', corto: 'Construir sin manual', f: { mam: 2, ima: 2 }, c: { 'mam-diseno': 1, 'ima-mecatronica': 1 } },
    { id: 'escuchar', cat: 'habilidad', emoji: '💬', deco: ['👂', '💞'], texto: 'Tus amistades te cuentan sus problemas porque sabes escuchar', corto: 'Saber escuchar', f: { ssc: 3, san: 1 }, c: { 'ssc-integracion': 2 } },
    { id: 'voluntariado', cat: 'valor', emoji: '🙋', deco: ['🤝', '🌍'], texto: 'Has hecho voluntariado o te encantaría hacerlo', corto: 'El voluntariado', f: { ssc: 3, sea: 1 }, c: { 'ssc-integracion': 2 } },
    { id: 'injusticia', cat: 'valor', emoji: '✊', deco: ['📢', '⚖️'], texto: 'Las injusticias te hierven la sangre y quieres hacer algo', corto: 'Luchar contra las injusticias', f: { ssc: 3 }, c: { 'ssc-integracion': 3 } },
    { id: 'educacion-fisica', cat: 'mania', emoji: '🏅', deco: ['⚽', '🎽'], texto: 'Tu mejor recuerdo del cole es de Educación Física o de un equipo', corto: 'El deporte en equipo', f: { afd: 3 }, c: { 'afd-sociodeportiva': 1, 'afd-acondicionamiento': 1 } },
    { id: 'canteras', cat: 'plan', emoji: '🌊', deco: ['🏄', '🌅'], texto: 'Día perfecto: surf o paddle en Las Canteras al amanecer', corto: 'El deporte en el mar', f: { afd: 3, sea: 1 }, c: { 'afd-acondicionamiento': 1, 'afd-sociodeportiva': 1 } },
    { id: 'bici', cat: 'habilidad', emoji: '🛴', deco: ['🔧', '⚡'], texto: 'Arreglas tu bici, tu patinete o el enchufe que no funciona', corto: 'Arreglar lo que se rompe', f: { ima: 3 }, c: { 'ima-electromecanico': 2, 'ima-fabricacion': 1 } },
    { id: 'electricidad', cat: 'mania', emoji: '⚡', deco: ['💡', '🔌'], texto: 'Te pica la curiosidad por saber cómo llega la electricidad a un enchufe', corto: 'Entender la electricidad', f: { ima: 3 }, c: { 'ima-electromecanico': 2, 'ima-mecatronica': 1 } },
    { id: 'madera', cat: 'mania', emoji: '🌳', deco: ['🪑', '✨'], texto: 'El olor a madera recién cortada te encanta', corto: 'El olor a madera', f: { mam: 3 }, c: { 'mam-carpinteria-gm': 2, 'mam-carpinteria-gb': 2 } },
    { id: 'diy', cat: 'plan', emoji: '✂️', deco: ['🎨', '🧶'], texto: 'Tarde de manualidades y DIY: tú pones la música y el pegamento', corto: 'Las manualidades y el DIY', f: { mam: 2, ssc: 1 }, c: { 'ssc-infantil': 1, 'mam-diseno': 1 } },
    { id: 'bizcochos', cat: 'habilidad', emoji: '🧁', deco: ['🍪', '⭐'], texto: 'Los domingos haces bizcochos o galletas… y te salen de lujo', corto: 'La repostería', f: { ina: 3, hot: 1 }, c: { 'ina-panaderia': 3 } },
    { id: 'terraza', cat: 'plan', emoji: '🍹', deco: ['☕', '😄'], texto: 'Te ves atendiendo mesas con una sonrisa aunque la terraza esté a reventar', corto: 'Atender a clientes en una terraza', f: { hot: 3, com: 1 }, c: { 'hot-restaurante': 3 } },
    { id: 'turistas', cat: 'habilidad', emoji: '🗺️', deco: ['🧳', '💬'], texto: 'Ayudas a turistas perdidos y chapurreas idiomas sin vergüenza', corto: 'Ayudar a turistas', f: { hot: 2, com: 1 } },
    { id: 'redes', cat: 'mania', emoji: '📱', deco: ['📈', '💡'], texto: 'Te fijas en cómo las marcas se anuncian en redes sociales', corto: 'La publicidad y las marcas', f: { com: 3 } },
    { id: 'regatear', cat: 'habilidad', emoji: '🏷️', deco: ['🛍️', '😏'], texto: 'Regatear en un mercadillo es tu deporte favorito', corto: 'Negociar precios', f: { com: 3 } },
    { id: 'adrenalina', cat: 'valor', emoji: '🎢', deco: ['⚡', '🔥'], texto: 'La adrenalina te pone: cuanto más intenso, mejor', corto: 'La adrenalina', f: { sea: 3, afd: 2 }, c: { 'sea-emergencias': 2 } },
    { id: 'rcp', cat: 'habilidad', emoji: '⛑️', deco: ['❤️', '⏱️'], texto: 'Sabes hacer una RCP… o te encantaría aprender', corto: 'Los primeros auxilios', f: { san: 3, sea: 2 }, c: { 'sea-emergencias': 1, 'san-enfermeria': 2 } },
    { id: 'mayores', cat: 'plan', emoji: '👴', deco: ['☕', '📖'], texto: 'Pasar tiempo con personas mayores y escuchar sus historias te encanta', corto: 'Escuchar a las personas mayores', f: { ssc: 3, san: 1 }, c: { 'ssc-dependencia': 3, 'san-enfermeria': 1 } },
    { id: 'cuidar', cat: 'situacion', emoji: '🍵', deco: ['🤒', '💞'], texto: 'Cuando alguien se pone malo en casa, eres quien le cuida', corto: 'Cuidar a quien lo necesita', f: { san: 3, ssc: 2 }, c: { 'san-enfermeria': 2, 'ssc-dependencia': 1 } },
    { id: 'precision', cat: 'habilidad', emoji: '📏', deco: ['📐', '🎯'], texto: 'Eres de medir dos veces y cortar una: precisión milimétrica', corto: 'La precisión milimétrica', f: { mam: 3, ima: 2 }, c: { 'mam-carpinteria-gm': 1, 'ima-fabricacion': 2 } },
    { id: 'maquinas', cat: 'mania', emoji: '🏗️', deco: ['⚙️', '😍'], texto: 'Las máquinas gigantes (grúas, tornos, prensas) te fascinan', corto: 'Las máquinas grandes', f: { ima: 3, mam: 1 }, c: { 'ima-electromecanico': 2, 'ima-fabricacion': 1 } },
    { id: 'arduino', cat: 'plan', emoji: '💡', deco: ['💻', '🔌'], texto: 'Programar un Arduino para automatizar algo en casa te suena a planazo', corto: 'Programar y automatizar', f: { ima: 3 }, c: { 'ima-mecatronica': 3 } },
    { id: 'bomberos', cat: 'valor', emoji: '🚒', deco: ['🦸', '🔥'], texto: 'Los bomberos y el personal de emergencias te parecen auténticos héroes', corto: 'Admirar a los equipos de emergencias', f: { sea: 3 }, c: { 'sea-emergencias': 3 } },
    { id: 'planeta', cat: 'valor', emoji: '♻️', deco: ['🌍', '🌱'], texto: 'Te preocupa el planeta y reciclas en serio', corto: 'Cuidar el medio ambiente', f: { sea: 2, mam: 1 }, c: { 'mam-diseno': 1 } },
    { id: 'paladar', cat: 'habilidad', emoji: '👅', deco: ['🍲', '🧂'], texto: 'Pruebas un plato y adivinas los ingredientes', corto: 'Tener buen paladar', f: { hot: 3, ina: 2 } },
    { id: 'limpieza', cat: 'mania', emoji: '🧼', deco: ['✨', '🧽'], texto: 'Eres un poco maniático/a del orden y la limpieza', corto: 'El orden y la limpieza', f: { san: 2, ina: 2, hot: 1, com: 1 }, c: { 'san-bucodental': 1, 'ina-panaderia': 1 } },
    { id: 'explicar', cat: 'habilidad', emoji: '📚', deco: ['💡', '🗣️'], texto: 'Explicar cosas a los demás se te da genial', corto: 'Explicar y enseñar', f: { ssc: 2, afd: 2 }, c: { 'ssc-infantil': 2, 'afd-sociodeportiva': 2 } },
    { id: 'coreo', cat: 'plan', emoji: '💃', deco: ['🎶', '🕺'], texto: 'Te apuntas a cualquier coreografía o clase en grupo', corto: 'Las actividades en grupo con música', f: { afd: 2, ssc: 1, hot: 1 }, c: { 'afd-acondicionamiento': 2, 'afd-sociodeportiva': 1 } },
    { id: 'etiquetas-comida', cat: 'mania', emoji: '🥗', deco: ['🍎', '🔍'], texto: 'En el súper lees las etiquetas porque te interesa comer sano', corto: 'La alimentación saludable', f: { afd: 2, ina: 2, san: 1 }, c: { 'afd-acondicionamiento': 1 } },
    { id: 'de-pie', cat: 'habilidad', emoji: '👟', deco: ['⚡', '😅'], texto: 'Estar de pie y en movimiento todo el día no te cansa', corto: 'Aguantar todo el día en movimiento', f: { hot: 2, afd: 2, ima: 1, ina: 1 } },
    { id: 'ojo', cat: 'habilidad', emoji: '👀', deco: ['🕵️', '🔍'], texto: 'Nada se te escapa: detalles, caras, movimientos raros…', corto: 'Tener ojo para los detalles', f: { sea: 3, san: 1 }, c: { 'sea-seguridad': 3 } },
    { id: 'proteger', cat: 'valor', emoji: '🛡️', deco: ['🤝', '💪'], texto: 'Te gusta que confíen en ti para proteger algo o a alguien', corto: 'Proteger a los demás', f: { sea: 3, ssc: 1 }, c: { 'sea-seguridad': 3 } },
    { id: 'uniforme', cat: 'mania', emoji: '🦺', deco: ['😎', '✨'], texto: 'Llevar uniforme en el trabajo te parece un puntazo', corto: 'Llevar uniforme', f: { sea: 2, san: 1, hot: 1 }, c: { 'sea-seguridad': 1, 'sea-emergencias': 1 } },
    { id: 'emprender', cat: 'valor', emoji: '🚀', deco: ['💡', '💰'], texto: 'Algún día quieres montar tu propio negocio', corto: 'Emprender', f: { com: 2, hot: 1, ina: 1, mam: 1 } },
    { id: 'lider', cat: 'situacion', emoji: '📣', deco: ['📋', '👥'], texto: 'En los trabajos de clase acabas organizando a todo el grupo', corto: 'Organizar al grupo', f: { sea: 1, afd: 1, com: 1 }, c: { 'sea-coordinacion': 2 } },
    { id: 'vendaje', cat: 'situacion', emoji: '🩹', deco: ['⚽', '🧊'], texto: 'Tu colega se tuerce un tobillo jugando y tú ya sabes cómo vendarlo', corto: 'Atender una lesión', f: { san: 3, afd: 2 }, c: { 'san-enfermeria': 1, 'afd-acondicionamiento': 1 } },
    { id: 'apagon', cat: 'situacion', emoji: '🔦', deco: ['⚡', '🏠'], texto: 'Se va la luz en casa y tú ya estás mirando el cuadro eléctrico', corto: 'Resolver averías', f: { ima: 3 }, c: { 'ima-electromecanico': 2 } },
    { id: 'guagua', cat: 'situacion', emoji: '🚌', deco: ['🧸', '🎵'], texto: 'Un peque llora en la guagua y a ti te salen solos los trucos para calmarle', corto: 'Calmar a un peque', f: { ssc: 3 }, c: { 'ssc-infantil': 3 } },
    { id: 'andamio', cat: 'situacion', emoji: '🚧', deco: ['⚠️', '🤔'], texto: 'Ves un andamio mal montado y piensas: «eso es un accidente esperando a pasar»', corto: 'Ver peligros antes de que pasen', f: { sea: 3 }, c: { 'sea-prevencion': 3 } },
    { id: 'barra', cat: 'situacion', emoji: '🍾', deco: ['🍸', '🎉'], texto: 'En una fiesta acabas ayudando en la barra porque te sale natural', corto: 'Echar una mano en la barra', f: { hot: 3 }, c: { 'hot-restaurante': 3 } },
    { id: 'silla', cat: 'situacion', emoji: '🪑', deco: ['🔨', '✨'], texto: 'Tienes una silla que cojea: en lugar de tirarla, la arreglas y la barnizas', corto: 'Reparar muebles', f: { mam: 3 }, c: { 'mam-carpinteria-gm': 2, 'mam-carpinteria-gb': 2 } },
    { id: 'vecina', cat: 'situacion', emoji: '🧺', deco: ['👵', '💞'], texto: 'Tu vecina mayor necesita ayuda con la compra y te ofreces sin pensarlo', corto: 'Ayudar a una vecina mayor', f: { ssc: 3 }, c: { 'ssc-dependencia': 3 } },
    { id: 'rescate', cat: 'situacion', emoji: '🏊', deco: ['🌊', '🆘'], texto: 'Alguien pide ayuda en el agua y tú sabes cómo actuar sin ponerte en peligro', corto: 'Actuar en un rescate', f: { sea: 3, afd: 2, san: 1 }, c: { 'sea-emergencias': 2 } },
    { id: 'cumple', cat: 'situacion', emoji: '🎂', deco: ['🎈', '🎁'], texto: 'Te toca organizar el cumple sorpresa: decoración, tarta y juegos', corto: 'Organizar fiestas', f: { ina: 2, ssc: 1, afd: 1, hot: 1 }, c: { 'ina-panaderia': 1 } },
    { id: 'pedidos', cat: 'situacion', emoji: '🚚', deco: ['⏱️', '✅'], texto: 'Preparar 50 pedidos a contrarreloj sin equivocarte: reto aceptado', corto: 'Preparar pedidos sin errores', f: { com: 3 }, c: { 'com-almacen': 3 } },
    { id: 'obrador', cat: 'plan', emoji: '🍞', deco: ['🌾', '🔥'], texto: 'Aprender a hacer pan de verdad, con masa madre y todo', corto: 'Hacer pan artesano', f: { ina: 3 }, c: { 'ina-panaderia': 3 } },
    { id: 'soldar', cat: 'mania', emoji: '🔥', deco: ['🔩', '⚙️'], texto: 'Ver cómo sueldan metal te deja hipnotizado/a', corto: 'La soldadura y el metal', f: { ima: 3 }, c: { 'ima-fabricacion': 3 } },
    { id: 'grifo', cat: 'habilidad', emoji: '🚰', deco: ['🔧', '💧'], texto: 'Cambiar un grifo o desatascar una tubería no te da ningún miedo', corto: 'La fontanería', f: { ima: 3 }, c: { 'ima-fabricacion': 2 } },
    { id: 'clinica', cat: 'plan', emoji: '🥼', deco: ['🦷', '✨'], texto: 'Te imaginas con bata trabajando en una clínica moderna', corto: 'Trabajar en una clínica', f: { san: 3 }, c: { 'san-bucodental': 2, 'san-enfermeria': 1 } },
    { id: 'incendios', cat: 'valor', emoji: '🌲', deco: ['🔥', '🚁'], texto: 'Proteger los montes de Gran Canaria de los incendios te parece una misión', corto: 'Proteger la naturaleza', f: { sea: 3 }, c: { 'sea-emergencias': 2, 'sea-coordinacion': 1 } },
    { id: 'turismo', cat: 'valor', emoji: '🏝️', deco: ['✈️', '☀️'], texto: 'El turismo mueve Canarias y te gustaría formar parte de ello', corto: 'El turismo', f: { hot: 3, com: 1 } },
    { id: 'tienda', cat: 'plan', emoji: '🛍️', deco: ['😊', '💳'], texto: 'Trabajar en una tienda chula atendiendo a clientes te molaría', corto: 'Atender en una tienda', f: { com: 3, hot: 1 } },
    { id: 'musculos', cat: 'mania', emoji: '💪', deco: ['🏋️', '🧠'], texto: 'Sabes qué músculo trabajas en cada ejercicio', corto: 'Saber cómo se entrena el cuerpo', f: { afd: 3, san: 1 }, c: { 'afd-acondicionamiento': 3 } },
    { id: 'campamento', cat: 'plan', emoji: '⛺', deco: ['🔥', '🎒'], texto: 'Ser monitor/a de campamento en verano: planazo total', corto: 'Ser monitor/a de campamento', f: { afd: 2, ssc: 2 }, c: { 'afd-sociodeportiva': 3, 'ssc-infantil': 1 } },
    { id: 'cuentos', cat: 'habilidad', emoji: '📖', deco: ['🐉', '✨'], texto: 'Cuando cuentas un cuento pones voces y todo el mundo se engancha', corto: 'Contar cuentos', f: { ssc: 3 }, c: { 'ssc-infantil': 3 } },
    { id: 'igualdad', cat: 'valor', emoji: '🌈', deco: ['🤝', '💞'], texto: 'Crees que todo el mundo merece las mismas oportunidades, y actúas en consecuencia', corto: 'La igualdad de oportunidades', f: { ssc: 3, afd: 1 }, c: { 'ssc-integracion': 3 } },
    { id: 'diseno3d', cat: 'plan', emoji: '🖥️', deco: ['📐', '🪑'], texto: 'Diseñar un mueble en 3D en el ordenador y luego verlo hecho de verdad', corto: 'Diseñar en 3D', f: { mam: 3, ima: 1 }, c: { 'mam-diseno': 3 } },
    { id: 'motor', cat: 'mania', emoji: '⚙️', deco: ['👂', '🔧'], texto: 'Por el ruido de un motor sabes si algo va bien o mal', corto: 'Entender los motores', f: { ima: 3 }, c: { 'ima-electromecanico': 3 } }
  ].map(function (t) { t.tipo = 'gusto'; return t; });

  var VERSUS = [
    { id: 'vs-personas-cosas', pregunta: '¿Con qué te llevas mejor?', a: { emoji: '👥', texto: 'Personas', f: { ssc: 2, san: 1, hot: 1, afd: 1, com: 1 } }, b: { emoji: '⚙️', texto: 'Cosas y máquinas', f: { ima: 2, mam: 2, ina: 1 } } },
    { id: 'vs-crear-arreglar', pregunta: '¿Qué te sale mejor?', a: { emoji: '🎨', texto: 'Crear algo nuevo', f: { mam: 2, ina: 1, com: 1 }, c: { 'mam-diseno': 1 } }, b: { emoji: '🔧', texto: 'Arreglar lo que falla', f: { ima: 3, sea: 1 }, c: { 'ima-electromecanico': 1 } } },
    { id: 'vs-fijo-movil', pregunta: 'Tu trabajo ideal sería…', a: { emoji: '🏢', texto: 'En un sitio fijo', f: { com: 1, san: 1, ina: 1, mam: 1 } }, b: { emoji: '🚐', texto: 'Cada día en un sitio', f: { sea: 2, afd: 1, ima: 1 } } },
    { id: 'vs-rutina-sorpresa', pregunta: '¿Qué prefieres?', a: { emoji: '📋', texto: 'Una rutina clara', f: { com: 1, ina: 1, ima: 1 } }, b: { emoji: '🎲', texto: 'Sorpresas cada día', f: { sea: 2, hot: 1, ssc: 1 } } },
    { id: 'vs-peques-mayores', pregunta: '¿A quién te gustaría cuidar?', a: { emoji: '🧸', texto: 'Peques', f: { ssc: 2 }, c: { 'ssc-infantil': 3 } }, b: { emoji: '👵', texto: 'Personas mayores', f: { ssc: 2, san: 1 }, c: { 'ssc-dependencia': 3, 'san-enfermeria': 1 } } },
    { id: 'vs-dulce-salado', pregunta: '¿Dulce o salado?', a: { emoji: '🍰', texto: 'Dulce', f: { ina: 2 }, c: { 'ina-panaderia': 2 } }, b: { emoji: '🍟', texto: 'Salado', f: { hot: 2 }, c: { 'hot-restaurante': 1 } } },
    { id: 'vs-madera-metal', pregunta: '¿Con qué material trabajarías?', a: { emoji: '🌳', texto: 'Madera', f: { mam: 3 } }, b: { emoji: '🔩', texto: 'Metal', f: { ima: 3 }, c: { 'ima-fabricacion': 1 } } },
    { id: 'vs-cuerpo-mente', pregunta: '¿Qué te interesa más?', a: { emoji: '💪', texto: 'Cómo entrenar el cuerpo', f: { afd: 3 }, c: { 'afd-acondicionamiento': 2 } }, b: { emoji: '🧠', texto: 'Cómo piensan las personas', f: { ssc: 2, san: 1 }, c: { 'ssc-integracion': 1 } } },
    { id: 'vs-vender-analizar', pregunta: '¿Qué se te da mejor?', a: { emoji: '🗣️', texto: 'Convencer y vender', f: { com: 3, hot: 1 } }, b: { emoji: '🔍', texto: 'Investigar y analizar', f: { sea: 1, san: 1, ima: 1 }, c: { 'sea-prevencion': 1 } } },
    { id: 'vs-prevenir-actuar', pregunta: 'Ante una emergencia, tú…', a: { emoji: '📋', texto: 'La evitas antes de que pase', f: { sea: 2 }, c: { 'sea-prevencion': 3 } }, b: { emoji: '🚨', texto: 'Actúas cuando ya ha pasado', f: { sea: 2, san: 1 }, c: { 'sea-emergencias': 3 } } },
    { id: 'vs-disenar-fabricar', pregunta: 'Con un mueble, prefieres…', a: { emoji: '📐', texto: 'Diseñarlo', f: { mam: 2 }, c: { 'mam-diseno': 3 } }, b: { emoji: '🔨', texto: 'Fabricarlo', f: { mam: 2, ima: 1 }, c: { 'mam-carpinteria-gm': 2, 'mam-carpinteria-gb': 2 } } },
    { id: 'vs-fuera-dentro', pregunta: '¿Dónde prefieres trabajar?', a: { emoji: '🌤️', texto: 'Al aire libre', f: { afd: 2, sea: 2 }, c: { 'afd-sociodeportiva': 1, 'sea-emergencias': 1 } }, b: { emoji: '🏠', texto: 'Bajo techo', f: { san: 1, mam: 1, ina: 1, com: 1 } } },
    { id: 'vs-liderar-apoyar', pregunta: 'En un equipo, tú…', a: { emoji: '📣', texto: 'Lideras', f: { sea: 2, afd: 1, com: 1 }, c: { 'sea-coordinacion': 2 } }, b: { emoji: '🤲', texto: 'Apoyas', f: { ssc: 2, san: 2 } } },
    { id: 'vs-gym-grupo', pregunta: 'Si te dedicas al deporte…', a: { emoji: '🏋️', texto: 'Entrenamiento personal', f: { afd: 2 }, c: { 'afd-acondicionamiento': 3 } }, b: { emoji: '🎉', texto: 'Animar a grupos', f: { afd: 2, ssc: 1 }, c: { 'afd-sociodeportiva': 3 } } },
    { id: 'vs-mojo', divertida: true, pregunta: 'Papas arrugadas: ¿con qué mojo?', a: { emoji: '🌶️', texto: 'Mojo rojo', f: { sea: 0.5, afd: 0.5 } }, b: { emoji: '🌿', texto: 'Mojo verde', f: { san: 0.5, ssc: 0.5 } } },
    { id: 'vs-hospital-escuela', pregunta: '¿Dónde te ves?', a: { emoji: '🏥', texto: 'Hospital o clínica', f: { san: 3 }, c: { 'san-enfermeria': 1, 'san-bucodental': 1 } }, b: { emoji: '🏫', texto: 'Escuela infantil o centro social', f: { ssc: 3 }, c: { 'ssc-infantil': 1, 'ssc-integracion': 1 } } },
    { id: 'vs-cocina-sala', pregunta: 'En un restaurante estarías…', a: { emoji: '🍳', texto: 'En la cocina o el obrador', f: { ina: 2, hot: 1 }, c: { 'ina-panaderia': 1 } }, b: { emoji: '🍸', texto: 'En la sala, con la gente', f: { hot: 3 }, c: { 'hot-restaurante': 2 } } },
    { id: 'vs-silencio-bullicio', pregunta: '¿Qué ambiente te va?', a: { emoji: '🤫', texto: 'Tranquilo y concentrado', f: { mam: 1, san: 1, ima: 1 } }, b: { emoji: '🎶', texto: 'Con bullicio', f: { hot: 2, afd: 1, ssc: 1, com: 1 } } },
    { id: 'vs-tecnologia-naturaleza', pregunta: 'Tu rollo es más…', a: { emoji: '💻', texto: 'Tecnología', f: { ima: 2, mam: 1 }, c: { 'ima-mecatronica': 1, 'mam-diseno': 1 } }, b: { emoji: '🌿', texto: 'Naturaleza', f: { sea: 2, afd: 1 } } },
    { id: 'vs-clientes-almacen', pregunta: 'En una tienda preferirías…', a: { emoji: '🛍️', texto: 'Atender a clientes', f: { com: 2, hot: 1 } }, b: { emoji: '📦', texto: 'Organizar el almacén', f: { com: 2, ima: 1 }, c: { 'com-almacen': 2 } } },
    { id: 'vs-vigilar-rescatar', pregunta: '¿Qué te va más?', a: { emoji: '🛡️', texto: 'Vigilar y proteger', f: { sea: 2 }, c: { 'sea-seguridad': 3 } }, b: { emoji: '🚒', texto: 'Rescatar y apagar fuegos', f: { sea: 2 }, c: { 'sea-emergencias': 3 } } },
    { id: 'vs-dental-planta', pregunta: 'En sanidad te ves…', a: { emoji: '🦷', texto: 'En una clínica dental', f: { san: 2 }, c: { 'san-bucodental': 3 } }, b: { emoji: '🛏️', texto: 'Cuidando pacientes en planta', f: { san: 2 }, c: { 'san-enfermeria': 3 } } },
    { id: 'vs-robot-motor', pregunta: 'Te llama más…', a: { emoji: '🤖', texto: 'Programar robots', f: { ima: 2 }, c: { 'ima-mecatronica': 3 } }, b: { emoji: '⚙️', texto: 'Reparar motores y máquinas', f: { ima: 2 }, c: { 'ima-electromecanico': 3 } } },
    { id: 'vs-infantil-integracion', pregunta: 'Te gustaría acompañar a…', a: { emoji: '🧒', texto: 'Niños y niñas de 0 a 6 años', f: { ssc: 2 }, c: { 'ssc-infantil': 3 } }, b: { emoji: '🤝', texto: 'Personas en riesgo de exclusión', f: { ssc: 2 }, c: { 'ssc-integracion': 3 } } }
  ].map(function (t) { t.tipo = 'versus'; return t; });

  // Personajes de ejemplo: no son personas reales.
  var PERFILES = [
    { id: 'pf-yeray', nombre: 'Yeray', edad: 24, emoji: '🚒', deco: ['🔥', '🦺'], puesto: 'Técnico en Emergencias', ciclo: 'sea-emergencias', bio: 'Mi oficina tiene sirena. Busco a alguien que no se agobie cuando la cosa se pone seria.', dia: 'Revisamos el material, hacemos simulacros y, cuando suena el aviso, salimos a rescatar, apagar fuegos o ayudar en un accidente.', chips: ['🔥 Rescate', '💪 Forma física', '🧊 Sangre fría'], f: { sea: 3, afd: 1 }, c: { 'sea-emergencias': 3 } },
    { id: 'pf-nayra', nombre: 'Nayra', edad: 26, emoji: '🤖', deco: ['⚡', '💻'], puesto: 'Técnica en Mecatrónica', ciclo: 'ima-mecatronica', bio: 'Programo robots y autómatas. Si tu lavadora hace un ruido raro, ya sé por qué.', dia: 'Programo líneas automáticas, reviso sensores y consigo que los robots de la fábrica trabajen sin parar.', chips: ['🤖 Robótica', '💻 PLC', '⚡ Electrónica'], f: { ima: 3 }, c: { 'ima-mecatronica': 3 } },
    { id: 'pf-acoraida', nombre: 'Acoraida', edad: 23, emoji: '🦷', deco: ['✨', '😁'], puesto: 'Higienista bucodental', ciclo: 'san-bucodental', bio: 'Tu sonrisa es mi trabajo (literal). Red flag: no usar hilo dental.', dia: 'Hago limpiezas, radiografías y revisiones, enseño a cuidar la boca y trabajo codo con codo con el equipo de odontología.', chips: ['😁 Sonrisas', '🔬 Precisión', '🧼 Higiene'], f: { san: 3 }, c: { 'san-bucodental': 3 } },
    { id: 'pf-ivan', nombre: 'Iván', edad: 25, emoji: '🧸', deco: ['🎨', '🎵'], puesto: 'Educador infantil', ciclo: 'ssc-infantil', bio: 'Paso el día entre cuentos, pinturas y canciones. Mi superpoder: calmar una rabieta en 30 segundos.', dia: 'Preparo juegos y actividades que ayudan a los peques a crecer, hablo con las familias y convierto cualquier caja en un castillo.', chips: ['🎨 Creatividad', '🎵 Canciones', '💞 Paciencia'], f: { ssc: 3 }, c: { 'ssc-infantil': 3 } },
    { id: 'pf-carla', nombre: 'Carla', edad: 27, emoji: '🏋️', deco: ['💪', '🌊'], puesto: 'Entrenadora personal', ciclo: 'afd-acondicionamiento', bio: 'Tu récord personal es mi récord. Los domingos, surf en Las Canteras.', dia: 'Valoro la forma física de cada cliente, diseño su entrenamiento y doy clases dirigidas en sala y en el agua.', chips: ['💪 Fitness', '📊 Planificación', '🌊 Surf'], f: { afd: 3 }, c: { 'afd-acondicionamiento': 3 } },
    { id: 'pf-aday', nombre: 'Aday', edad: 22, emoji: '🪑', deco: ['🌳', '🔨'], puesto: 'Carpintero', ciclo: 'mam-carpinteria-gm', bio: 'Hago muebles que duran toda la vida. Busco a alguien que valore el trabajo bien hecho.', dia: 'Preparo la madera, programo la máquina CNC y monto cocinas y armarios a medida en casa de cada cliente.', chips: ['🌳 Madera', '📏 Precisión', '🔨 Oficio'], f: { mam: 3 }, c: { 'mam-carpinteria-gm': 3, 'mam-carpinteria-gb': 1 } },
    { id: 'pf-daniela', nombre: 'Daniela', edad: 29, emoji: '🦺', deco: ['📋', '🏗️'], puesto: 'Técnica en Prevención de Riesgos', ciclo: 'sea-prevencion', bio: 'Mi misión: que todo el mundo vuelva a casa sano y salvo. Me pone un buen protocolo.', dia: 'Visito obras y empresas, detecto riesgos, propongo medidas de seguridad y formo a los equipos.', chips: ['🔍 Inspeccionar', '📋 Protocolos', '🦺 Seguridad'], f: { sea: 3 }, c: { 'sea-prevencion': 3 } },
    { id: 'pf-oscar', nombre: 'Óscar', edad: 30, emoji: '🤝', deco: ['🌈', '💬'], puesto: 'Integrador social', ciclo: 'ssc-integracion', bio: 'Acompaño a personas que lo tienen más difícil. Cero juicios, mucha escucha.', dia: 'Trabajo con jóvenes y personas en riesgo de exclusión: les ayudo a buscar empleo, vivienda o, simplemente, a creer en sí mismas.', chips: ['👂 Escucha', '🌈 Inclusión', '💪 Autonomía'], f: { ssc: 3 }, c: { 'ssc-integracion': 3 } },
    { id: 'pf-tania', nombre: 'Tania', edad: 21, emoji: '🥐', deco: ['🌅', '🎂'], puesto: 'Pastelera', ciclo: 'ina-panaderia', bio: 'Me levanto antes que el sol para que tu cruasán esté perfecto. Harina en el pelo = día productivo.', dia: 'Amaso, formo y horneo pan y bollería, decoro tartas y cuido la higiene del obrador al milímetro.', chips: ['🥖 Masas', '🎂 Decoración', '🌅 Madrugar'], f: { ina: 3 }, c: { 'ina-panaderia': 3 } },
    { id: 'pf-jonay', nombre: 'Jonay', edad: 23, emoji: '🩺', deco: ['🏥', '💙'], puesto: 'Técnico en Cuidados de Enfermería', ciclo: 'san-enfermeria', bio: 'Soy la mano que ayuda en el hospital. Busco a alguien con empatía y buen estómago.', dia: 'Ayudo a los pacientes con su higiene, comida y movilidad, preparo el material y apoyo al equipo de enfermería.', chips: ['❤️ Cuidar', '🏥 Hospital', '🤝 Equipo'], f: { san: 3, ssc: 1 }, c: { 'san-enfermeria': 3 } },
    { id: 'pf-saray', nombre: 'Saray', edad: 28, emoji: '🏐', deco: ['🏆', '🎒'], puesto: 'Animadora sociodeportiva', ciclo: 'afd-sociodeportiva', bio: 'Si hay un grupo aburrido, lo arreglo yo. Torneos, campamentos y juegos para todas las edades.', dia: 'Organizo actividades deportivas en un ayuntamiento, enseño deporte a peques y mayores y animo los veranos en un hotel.', chips: ['📣 Animar', '🏆 Torneos', '🎒 Campamentos'], f: { afd: 3, ssc: 1 }, c: { 'afd-sociodeportiva': 3 } },
    { id: 'pf-hector', nombre: 'Héctor', edad: 31, emoji: '📐', deco: ['🛋️', '🖥️'], puesto: 'Diseñador de mobiliario', ciclo: 'mam-diseno', bio: 'Convierto espacios en hogares. Sueño en 3D.', dia: 'Mido espacios, diseño muebles y cocinas en el ordenador, preparo presupuestos y superviso que se fabriquen tal y como los imaginé.', chips: ['🖥️ Diseño 3D', '🛋️ Interiorismo', '✨ Estética'], f: { mam: 3, com: 1 }, c: { 'mam-diseno': 3 } },
    { id: 'pf-ancor', nombre: 'Ancor', edad: 26, emoji: '🔧', deco: ['⚙️', '⚡'], puesto: 'Técnico electromecánico', ciclo: 'ima-electromecanico', bio: 'Si una máquina se para, me llaman a mí. Motores, cuadros eléctricos, hidráulica… todo.', dia: 'Me encargo del mantenimiento de las máquinas de una fábrica o de un hotel: reviso, diagnostico averías y las reparo.', chips: ['⚙️ Motores', '⚡ Electricidad', '🔧 Averías'], f: { ima: 3 }, c: { 'ima-electromecanico': 3 } },
    { id: 'pf-mireia', nombre: 'Mireia', edad: 24, emoji: '🛡️', deco: ['👀', '📻'], puesto: 'Vigilante de seguridad', ciclo: 'sea-seguridad', bio: 'Protejo personas, eventos e instalaciones. Ojo de halcón y mucha mano izquierda.', dia: 'Controlo accesos, vigilo instalaciones y eventos, reviso cámaras y actúo con calma si algo se tuerce.', chips: ['👀 Vigilancia', '🧠 Calma', '🤝 Trato'], f: { sea: 3 }, c: { 'sea-seguridad': 3 } },
    { id: 'pf-laura', nombre: 'Laura', edad: 25, emoji: '📡', deco: ['🗺️', '🚁'], puesto: 'Coordinadora de emergencias', ciclo: 'sea-coordinacion', bio: 'Cuando todo es caos, yo organizo recursos, equipos y planes.', dia: 'Desde un centro de coordinación decido qué recursos salen, redacto planes de emergencia y dirijo simulacros.', chips: ['📡 Coordinar', '🗺️ Planificar', '🧊 Sangre fría'], f: { sea: 3 }, c: { 'sea-coordinacion': 3 } },
    { id: 'pf-samuel', nombre: 'Samuel', edad: 22, emoji: '👴', deco: ['☕', '💞'], puesto: 'Técnico en atención a la dependencia', ciclo: 'ssc-dependencia', bio: 'Ayudo a personas mayores o con discapacidad en su día a día. Lo mejor: sus historias.', dia: 'Acompaño a las personas en casa o en una residencia: les ayudo a asearse, comer y moverse y, sobre todo, a seguir haciendo lo que les gusta.', chips: ['💞 Cuidar', '☕ Compañía', '🏡 Autonomía'], f: { ssc: 3, san: 1 }, c: { 'ssc-dependencia': 3 } },
    { id: 'pf-nira', nombre: 'Nira', edad: 29, emoji: '🍹', deco: ['☕', '😄'], puesto: 'Camarera', ciclo: 'hot-restaurante', bio: 'Llevo seis platos a la vez y me sé tu pedido de memoria. Terraza llena = mi hábitat natural.', dia: 'Monto las mesas, sirvo cafés y refrescos, atiendo con una sonrisa y dejo la sala impecable.', chips: ['😊 Sonrisa', '⚡ Reflejos', '☕ Barra'], f: { hot: 3 }, c: { 'hot-restaurante': 3 } },
    { id: 'pf-rayco', nombre: 'Rayco', edad: 27, emoji: '📦', deco: ['🚚', '✅'], puesto: 'Mozo de almacén', ciclo: 'com-almacen', bio: 'El orden es mi religión y la transpaleta, mi coche favorito.', dia: 'Recibo la mercancía, la coloco en su sitio, preparo pedidos y controlo que no falte de nada.', chips: ['📦 Orden', '✅ Control', '🚚 Logística'], f: { com: 3 }, c: { 'com-almacen': 3 } },
    { id: 'pf-marta', nombre: 'Marta', edad: 20, emoji: '⚙️', deco: ['🔩', '🔥'], puesto: 'Montadora en un taller', ciclo: 'ima-fabricacion', bio: 'Monto, ajusto y sueldo piezas. Ver funcionando algo que he hecho yo es lo más.', dia: 'Mecanizo y sueldo piezas, monto instalaciones de fontanería y climatización y cada día aprendo algo nuevo en el taller.', chips: ['🔥 Soldar', '🔩 Montar', '🚰 Instalaciones'], f: { ima: 3 }, c: { 'ima-fabricacion': 3 } }
  ].map(function (t) { t.tipo = 'perfil'; return t; });

  var PREGUNTAS = [
    {
      id: 'q-aprendizaje', etiqueta: 'Tu estilo', emoji: '🧠',
      pregunta: '¿Cómo aprendes mejor?', razon: 'Aprendes mejor {texto}',
      opciones: [
        { id: 'manos', emoji: '🙌', texto: 'Haciendo con las manos', f: { ima: 2, mam: 2, ina: 2, hot: 1 } },
        { id: 'gente', emoji: '🗣️', texto: 'Hablando y trabajando con gente', f: { ssc: 2, com: 2, hot: 1, afd: 1 } },
        { id: 'moviendome', emoji: '🏃', texto: 'Moviéndome', f: { afd: 3, sea: 1 } },
        { id: 'observando', emoji: '🔬', texto: 'Observando y analizando', f: { san: 2, sea: 2, ima: 1 }, c: { 'sea-prevencion': 1 } }
      ]
    },
    {
      id: 'q-superpoder', etiqueta: 'Superpoder', emoji: '🦸',
      pregunta: 'Elige tu superpoder', razon: 'Tu superpoder: {texto}',
      opciones: [
        { id: 'empatia', emoji: '💞', texto: 'Sentir lo que sienten los demás', f: { ssc: 3, san: 1 } },
        { id: 'energia', emoji: '⚡', texto: 'Energía infinita', f: { afd: 3, hot: 1 } },
        { id: 'arreglar', emoji: '🛠️', texto: 'Arreglar cualquier cosa al tocarla', f: { ima: 3, mam: 1 } },
        { id: 'sangre-fria', emoji: '🧊', texto: 'Sangre fría ante cualquier crisis', f: { sea: 3, san: 1 } },
        { id: 'crear', emoji: '✨', texto: 'Convertir lo que sea en algo bonito', f: { mam: 3, com: 1 } },
        { id: 'cocinar', emoji: '😋', texto: 'Que todo lo que cocinas esté buenísimo', f: { ina: 3, hot: 2 } },
        { id: 'convencer', emoji: '🗣️', texto: 'Convencer a cualquiera', f: { com: 3, hot: 1 } },
        { id: 'curar', emoji: '🩹', texto: 'Curar con las manos', f: { san: 3, sea: 1 } }
      ]
    },
    {
      id: 'q-finde', etiqueta: 'Tu sábado', emoji: '🌴',
      pregunta: 'Tu sábado ideal es…', razon: 'Tu sábado ideal: {texto}',
      opciones: [
        { id: 'playa', emoji: '🏖️', texto: 'Deporte en la playa', f: { afd: 3, sea: 1 } },
        { id: 'garaje', emoji: '🔧', texto: 'Cacharrear en el garaje', f: { ima: 3, mam: 2 } },
        { id: 'hornear', emoji: '🍰', texto: 'Cocinar u hornear algo rico', f: { ina: 3, hot: 2 } },
        { id: 'ayudar', emoji: '👫', texto: 'Echar una mano a quien lo necesite', f: { ssc: 3, san: 1 } },
        { id: 'tiendas', emoji: '🛍️', texto: 'Tiendas y mercadillos', f: { com: 3, hot: 1 } },
        { id: 'aventura', emoji: '🧗', texto: 'Aventura y adrenalina', f: { sea: 3, afd: 1 } },
        { id: 'auxilios', emoji: '⛑️', texto: 'Un curso de primeros auxilios', f: { san: 3, sea: 1 } },
        { id: 'disenar', emoji: '🎨', texto: 'Dibujar, diseñar o decorar', f: { mam: 3, com: 1 } }
      ]
    },
    {
      id: 'q-estudios', campo: 'estudios', requerida: true, etiqueta: 'Tus estudios', emoji: '🎓',
      pregunta: '¿Qué estudios tienes terminados?', sub: 'Así sabremos a qué ciclos puedes acceder.',
      opciones: [
        { id: 'eso-no', emoji: '📘', texto: 'Aún no tengo la ESO' },
        { id: 'eso', emoji: '🎒', texto: 'Tengo la ESO' },
        { id: 'gm', emoji: '🛠️', texto: 'Tengo un Grado Medio' },
        { id: 'bach', emoji: '📚', texto: 'Tengo Bachillerato' },
        { id: 'gs', emoji: '🏛️', texto: 'Grado Superior o carrera' }
      ]
    },
    {
      id: 'q-horario', campo: 'horario', requerida: true, multiple: true, etiqueta: 'Tu agenda', emoji: '⏰',
      pregunta: '¿Cuándo podrías ir a clase?', sub: 'Marca todas las opciones que te encajen.',
      opciones: [
        { id: 'manana', emoji: '☀️', texto: 'Por la mañana' },
        { id: 'tarde', emoji: '🌇', texto: 'Por la tarde' },
        { id: 'noche', emoji: '🌙', texto: 'Por la noche' },
        { id: 'semi', emoji: '💻', texto: 'Semipresencial, para compaginar' }
      ]
    },
    {
      id: 'q-edad', campo: 'edad', requerida: true, etiqueta: 'Tu edad', emoji: '🎂',
      pregunta: '¿Cuántos años tienes?', sub: 'Algunos ciclos tienen requisitos de edad.',
      opciones: [
        { id: '15-17', emoji: '🧃', texto: 'Entre 15 y 17' },
        { id: '18-20', emoji: '🎧', texto: 'Entre 18 y 20' },
        { id: '21+', emoji: '☕', texto: '21 o más' },
        { id: 'nsnc', emoji: '🤐', texto: 'Prefiero no decirlo' }
      ]
    },
    {
      id: 'q-objetivo', campo: 'objetivo', etiqueta: 'Tu meta', emoji: '🎯',
      pregunta: '¿Qué buscas con la FP?',
      opciones: [
        { id: 'trabajar', emoji: '💼', texto: 'Trabajar cuanto antes' },
        { id: 'seguir', emoji: '🎓', texto: 'Seguir estudiando después' },
        { id: 'cambiar', emoji: '🔄', texto: 'Dar un giro a mi carrera' },
        { id: 'explorar', emoji: '🧭', texto: 'Aún estoy explorando' }
      ]
    }
  ].map(function (t) { t.tipo = 'pregunta'; return t; });

  return {
    CATEGORIAS: CATEGORIAS,
    TARJETAS: [].concat(GUSTOS, VERSUS, PERFILES, PREGUNTAS)
  };
});
