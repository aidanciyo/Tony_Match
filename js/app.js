/*
 * Interfaz de «Haz Match con el CIFP Tony Gallardo»: pantallas, tarjetas deslizables,
 * pantalla de match y resultados. La lógica de puntuación vive en motor.js.
 *
 * Añade ?kiosco a la URL para usarla en una pantalla compartida (jornadas de puertas
 * abiertas): vuelve sola al inicio tras dos minutos sin actividad.
 *
 * Para ocultar el botón de compartir (por ejemplo, al incrustarla en otra web), define
 * window.TonyMatchConfig = { compartir: false } antes de cargar este archivo.
 */
(function () {
  'use strict';

  var TM = window.TonyMatch;
  var CENTRO = TM.CENTRO;
  var NIVELES = TM.NIVELES;
  var FAMILIAS = TM.FAMILIAS;
  var CICLOS = TM.CICLOS;
  var CATEGORIAS = TM.CATEGORIAS;

  var familiaPorId = {};
  FAMILIAS.forEach(function (f) { familiaPorId[f.id] = f; });
  var cicloPorId = {};
  CICLOS.forEach(function (c) { cicloPorId[c.id] = c; });

  var AVATARES = [
    ['🦎', 'Lagarto'], ['🐬', 'Delfín'], ['🌋', 'Volcán'], ['🌴', 'Palmera'], ['🦜', 'Loro'], ['🐢', 'Tortuga'],
    ['🦊', 'Zorro'], ['🐙', 'Pulpo'], ['🦄', 'Unicornio'], ['🐝', 'Abeja'], ['🌵', 'Cactus'], ['🐧', 'Pingüino']
  ];
  var PALETAS = [
    ['#FF5F6D', '#FFC371'], ['#4776E6', '#8E54E9'], ['#11998E', '#38EF7D'], ['#FC466B', '#3F5EFB'],
    ['#F7971E', '#FFD200'], ['#00B4DB', '#0083B0'], ['#8E2DE2', '#4A00E0'], ['#EE0979', '#FF6A00'],
    ['#0B3C6F', '#1E88E5'], ['#C2185B', '#FF6F61'], ['#134E5E', '#71B280'], ['#DA4453', '#89216B']
  ];
  var BURBUJAS = ['🤖', '🧸', '🦷', '🚒', '🥐', '🏄', '🪑', '🍹', '📦', '🩺', '⚙️', '💘', '🌊', '✨'];
  var TEXTO_QUIMICA = [[0.15, 'Calentando motores…'], [0.35, 'Conociéndote…'], [0.55, 'Hay chispa ✨'], [0.75, '¡Hay química! 🔥'], [2, '¡Casi, casi!']];
  var HORARIOS = { manana: '☀️ Mañana', tarde: '🌇 Tarde', noche: '🌙 Noche', semi: '💻 Semipresencial' };
  var SELLO = { derecha: 'like', izquierda: 'nope', arriba: 'super' };
  var REDUCIR_MOVIMIENTO = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var KIOSCO = /[?&]kiosco\b/.test(window.location.search);
  var COMPARTIR = !KIOSCO && (window.TonyMatchConfig || {}).compartir !== false;

  var app = {
    motor: null,
    cola: [],
    nombre: '',
    avatar: AVATARES[0][0],
    ocupado: false,
    direcciones: [],
    bloqueoDeshacer: 0,
    entrada: null,
    matchActual: null,
    resultadoId: null,
    resultadoPrevio: null,
    volverA: null
  };

  // ---------- Utilidades ----------
  function $(sel, raiz) { return (raiz || document).querySelector(sel); }
  function $$(sel, raiz) { return Array.prototype.slice.call((raiz || document).querySelectorAll(sel)); }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function esc(texto) {
    return String(texto).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function hash(texto) {
    var h = 0;
    for (var i = 0; i < texto.length; i++) h = (h * 31 + texto.charCodeAt(i)) | 0;
    return Math.abs(h);
  }
  function paleta(id) { return PALETAS[hash(id) % PALETAS.length]; }
  function colores(g) { return '--g1:' + g[0] + ';--g2:' + g[1]; }
  function icono(id) { return '<svg aria-hidden="true"><use href="#' + id + '"/></svg>'; }
  function vibrar(patron) {
    try { if (navigator.vibrate) navigator.vibrate(patron); } catch { /* sin vibración */ }
  }
  function anunciar(texto) {
    var el = $('#anuncio');
    el.textContent = '';
    setTimeout(function () { el.textContent = texto; }, 40);
  }
  var temporizadorToast;
  function toast(texto) {
    var el = $('#toast');
    el.textContent = texto;
    el.classList.add('is-visible');
    clearTimeout(temporizadorToast);
    temporizadorToast = setTimeout(function () { el.classList.remove('is-visible'); }, 2800);
  }

  function mostrarPantalla(id, sinFoco) {
    $$('.pantalla').forEach(function (p) { p.hidden = p.id !== id; });
    var destino = document.getElementById(id);
    if (id === 'pantalla-resultado') destino.scrollTop = 0;
    var foco = destino.querySelector('[tabindex="-1"]');
    if (foco && !sinFoco) foco.focus({ preventScroll: true });
  }

  // ---------- Bienvenida y perfil ----------
  function prepararInicio() {
    if (!REDUCIR_MOVIMIENTO) {
      $('#burbujas').innerHTML = BURBUJAS.map(function (e, i) {
        var estilo = 'left:' + ((i * 37 + 7) % 96) + '%;font-size:' + (22 + (i * 13) % 20) + 'px;' +
          'animation-duration:' + (10 + (i * 7) % 9) + 's;animation-delay:-' + ((i * 53) % 14) + 's';
        return '<span class="burbuja" style="' + estilo + '">' + e + '</span>';
      }).join('');
    }
    $('#btn-comenzar').addEventListener('click', function () { mostrarPantalla('pantalla-perfil'); });
  }

  function prepararPerfil() {
    var rejilla = $('#avatares');
    rejilla.setAttribute('role', 'radiogroup');
    rejilla.setAttribute('aria-label', 'Foto de perfil');
    rejilla.innerHTML = AVATARES.map(function (a, i) {
      return '<button type="button" class="avatar-opcion" role="radio" aria-checked="' + (i === 0) + '" aria-label="' + a[1] + '"' +
        ' tabindex="' + (i === 0 ? 0 : -1) + '" data-avatar="' + a[0] + '">' + a[0] + '</button>';
    }).join('');
    rejilla.addEventListener('click', function (e) {
      var b = e.target.closest('[data-avatar]');
      if (b) elegirAvatar(b);
    });
    rejilla.addEventListener('keydown', function (e) {
      var botones = $$('.avatar-opcion', rejilla);
      var i = botones.indexOf(document.activeElement);
      var paso = { ArrowRight: 1, ArrowDown: 6, ArrowLeft: -1, ArrowUp: -6 }[e.key];
      if (i < 0 || !paso) return;
      e.preventDefault();
      var siguiente = botones[(i + paso + botones.length) % botones.length];
      elegirAvatar(siguiente);
      siguiente.focus();
    });
    $('#input-nombre').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); empezarPartida(); }
    });
    $('#btn-jugar').addEventListener('click', empezarPartida);
    $$('[data-ir]').forEach(function (b) {
      b.addEventListener('click', function () { mostrarPantalla(b.dataset.ir); });
    });
  }

  function elegirAvatar(boton) {
    $$('.avatar-opcion').forEach(function (b) {
      var elegido = b === boton;
      b.setAttribute('aria-checked', String(elegido));
      b.tabIndex = elegido ? 0 : -1;
    });
    app.avatar = boton.dataset.avatar;
    var vista = $('#avatar-vista');
    vista.textContent = app.avatar;
    vista.classList.remove('is-cambiando');
    void vista.offsetWidth;
    vista.classList.add('is-cambiando');
  }

  function empezarPartida() {
    app.nombre = $('#input-nombre').value.trim().slice(0, 20);
    app.motor = TM.crearMotor(TM);
    app.cola = [];
    app.direcciones = [];
    app.bloqueoDeshacer = 0;
    app.entrada = null;
    app.matchActual = null;
    app.resultadoId = null;
    app.ocupado = false;
    $$('#mazo .carta, #mazo .fin-mazo').forEach(function (el) { el.remove(); });
    $('#mazo').classList.add('con-tutorial');
    rellenarCola();
    mostrarPantalla('pantalla-juego');
    pintarMazo();
    actualizarQuimica();
    actualizarInsignia(false);
  }

  // ---------- Tarjetas ----------
  function olas() {
    return '<svg class="carta__olas" viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden="true">' +
      '<path d="M0 58C70 30 130 30 200 54S330 86 400 50V120H0Z"/>' +
      '<path d="M0 80C80 56 140 60 210 78S340 100 400 74V120H0Z"/>' +
      '<path d="M0 100C90 84 150 88 220 98S350 112 400 96V120H0Z"/></svg>';
  }

  function decoraciones(deco) {
    deco = deco || [];
    return (deco[0] ? '<span class="carta__deco carta__deco--a" aria-hidden="true">' + deco[0] + '</span>' : '') +
      (deco[1] ? '<span class="carta__deco carta__deco--b" aria-hidden="true">' + deco[1] + '</span>' : '');
  }

  function sellos(t) {
    if (t.tipo === 'versus') {
      return '<div class="sello sello--nope sello--versus" aria-hidden="true"><span class="sello__emoji">' + t.a.emoji + '</span>' + esc(t.a.texto) + '</div>' +
        '<div class="sello sello--like sello--versus" aria-hidden="true"><span class="sello__emoji">' + t.b.emoji + '</span>' + esc(t.b.texto) + '</div>' +
        '<div class="sello sello--super" aria-hidden="true">¡Las dos!</div>';
    }
    var textos = t.tipo === 'dato' ? ['¡Mola!', 'Anotado', '¡Guau!'] : ['Me mola', 'Paso', '¡Me encanta!'];
    return '<div class="sello sello--like" aria-hidden="true">' + textos[0] + '</div>' +
      '<div class="sello sello--nope" aria-hidden="true">' + textos[1] + '</div>' +
      '<div class="sello sello--super" aria-hidden="true">' + textos[2] + '</div>';
  }

  function htmlGusto(t) {
    var cat = CATEGORIAS[t.cat] || CATEGORIAS.mania;
    var pista = app.motor.swipes() < 3 ? '<p class="carta__pista">← Paso · Me mola →</p>' : '';
    return '<div class="carta__arte" style="' + colores(paleta(t.id)) + '">' + decoraciones(t.deco) +
      '<span class="carta__emoji" aria-hidden="true">' + t.emoji + '</span>' + olas() + '</div>' +
      '<div class="carta__velo"></div>' +
      '<span class="carta__etiqueta">' + cat.emoji + ' ' + esc(cat.etiqueta) + '</span>' +
      '<div class="carta__cuerpo"><h3 class="carta__titulo">' + esc(t.texto) + '</h3>' + pista + '</div>' + sellos(t);
  }

  function htmlVersus(t) {
    var pa = paleta(t.id + 'a');
    var pb = paleta(t.id + 'b');
    if (pa === pb) pb = PALETAS[(PALETAS.indexOf(pa) + 3) % PALETAS.length];
    return '<div class="versus">' +
      '<button type="button" class="versus__lado versus__lado--a" data-lado="a" style="--a1:' + pa[0] + ';--a2:' + pa[1] + '">' +
      '<span class="versus__contenido"><span class="versus__emoji" aria-hidden="true">' + t.a.emoji + '</span>' + esc(t.a.texto) + '</span></button>' +
      '<button type="button" class="versus__lado versus__lado--b" data-lado="b" style="--b1:' + pb[0] + ';--b2:' + pb[1] + '">' +
      '<span class="versus__contenido"><span class="versus__emoji" aria-hidden="true">' + t.b.emoji + '</span>' + esc(t.b.texto) + '</span></button>' +
      '<span class="versus__vs" aria-hidden="true">VS</span></div>' +
      '<div class="carta__velo"></div>' +
      '<span class="carta__etiqueta">⚖️ Esto o aquello</span>' +
      '<div class="carta__cuerpo"><h3 class="carta__titulo">' + esc(t.pregunta) + '</h3>' +
      '<p class="carta__pista">Desliza hacia tu elección o toca un lado</p></div>' + sellos(t);
  }

  function htmlPerfil(t) {
    var ciclo = cicloPorId[t.ciclo];
    var nivel = NIVELES[ciclo.nivel];
    return '<div class="carta__arte" style="' + colores(paleta(t.id)) + '">' + decoraciones(t.deco) +
      '<span class="carta__emoji" aria-hidden="true">' + t.emoji + '</span>' + olas() + '</div>' +
      '<div class="carta__velo carta__velo--alto"></div>' +
      '<div class="carta__barras" aria-hidden="true"><span class="is-activa"></span><span></span><span></span></div>' +
      '<span class="carta__etiqueta">💼 Conoce a…</span>' +
      '<div class="carta__cuerpo">' +
      '<h3 class="perfil__cabecera"><span class="perfil__nombre">' + esc(t.nombre) + '</span><span class="perfil__edad">' + t.edad + '</span></h3>' +
      '<p class="perfil__puesto">' + icono('i-maletin') + esc(t.puesto) + '</p>' +
      '<div class="perfil__diapo is-activa"><p class="perfil__texto">' + esc(t.bio) + '</p>' +
      '<ul class="chips">' + t.chips.map(function (c) { return '<li class="chip">' + esc(c) + '</li>'; }).join('') + '</ul></div>' +
      '<div class="perfil__diapo"><p class="perfil__subtitulo">Un día conmigo</p><p class="perfil__texto">' + esc(t.dia) + '</p></div>' +
      '<div class="perfil__diapo"><p class="perfil__subtitulo">🎓 Para llegar aquí</p><p class="perfil__texto"><b>' +
      esc(nivel.nombre + ': ' + ciclo.nombre) + '</b>. Lo tienes en el CIFP Tony Gallardo.</p></div>' +
      '<p class="carta__pista">Toca la tarjeta para ver más ›</p></div>' + sellos(t);
  }

  function htmlPregunta(t) {
    var lista = t.opciones.length <= 5;
    return '<div class="pregunta__banda"></div>' +
      '<div class="pregunta__cabecera"><span class="pregunta__emoji" aria-hidden="true">' + t.emoji + '</span>' +
      '<span class="pregunta__etiqueta">' + esc(t.etiqueta) + '</span></div>' +
      '<h3 class="pregunta__titulo">' + esc(t.pregunta) + '</h3>' +
      (t.sub ? '<p class="pregunta__sub">' + esc(t.sub) + '</p>' : '') +
      '<div class="opciones' + (lista ? ' opciones--lista' : '') + '" role="group" aria-label="' + esc(t.pregunta) + '">' +
      t.opciones.map(function (o, i) {
        return '<button type="button" class="opcion" data-opcion="' + o.id + '" aria-pressed="false">' +
          '<span class="opcion__emoji" aria-hidden="true">' + o.emoji + '</span><span>' + esc(o.texto) + '</span>' +
          '<kbd aria-hidden="true">' + (i + 1) + '</kbd></button>';
      }).join('') + '</div>' +
      (t.multiple ? '<button type="button" class="btn btn--grad pregunta__listo" data-listo disabled>Listo</button>' : '') +
      '<div class="pregunta__pie">' + olas() + '<span>' + (t.multiple ? 'Marca las que quieras y pulsa «Listo»' : 'Toca una opción para seguir') + '</span></div>';
  }

  function htmlDato(t) {
    return '<div class="carta__arte carta__arte--dato"><span class="carta__emoji" aria-hidden="true">' + t.emoji + '</span>' + olas() + '</div>' +
      '<div class="carta__velo carta__velo--alto"></div>' +
      '<span class="carta__etiqueta carta__etiqueta--dato">💡 Dato Tony Gallardo</span>' +
      '<div class="carta__cuerpo"><p class="dato__texto">' + esc(t.texto) + '</p><p class="carta__pista">Desliza para seguir</p></div>' + sellos(t);
  }

  function describir(t) {
    switch (t.tipo) {
      case 'gusto': return t.texto + '. ¿Te mola?';
      case 'versus': return t.pregunta + ' ' + t.a.texto + ' o ' + t.b.texto + '.';
      case 'perfil': return t.nombre + ', ' + t.edad + ' años, ' + t.puesto + '. ' + t.bio;
      case 'pregunta': return t.pregunta + (t.sub ? ' ' + t.sub : '');
      default: return 'Dato del centro: ' + t.texto;
    }
  }

  function crearCarta(t) {
    var el = document.createElement('article');
    el.className = 'carta carta--' + t.tipo + (t.tipo === 'pregunta' && t.opciones.length > 5 ? ' pregunta--larga' : '');
    el.dataset.id = t.id;
    el.setAttribute('aria-roledescription', 'tarjeta');
    el.setAttribute('aria-label', describir(t));
    el._tarjeta = t;
    el.innerHTML = t.tipo === 'gusto' ? htmlGusto(t)
      : t.tipo === 'versus' ? htmlVersus(t)
      : t.tipo === 'perfil' ? htmlPerfil(t)
      : t.tipo === 'pregunta' ? htmlPregunta(t)
      : htmlDato(t);
    if (t.tipo === 'pregunta') habilitarPregunta(el);
    else habilitarArrastre(el);
    return el;
  }

  function cartaActual() { return $('#mazo .carta--pos-0'); }

  function rellenarCola() {
    while (app.cola.length < 3) {
      var t = app.motor.siguiente();
      if (!t) break;
      app.cola.push(t);
    }
  }

  function pintarMazo() {
    var mazo = $('#mazo');
    var existentes = {};
    $$('.carta:not(.is-saliendo)', mazo).forEach(function (el) { existentes[el.dataset.id] = el; });
    app.cola.slice(0, 3).forEach(function (t, i) {
      var el = existentes[t.id];
      var nueva = !el;
      delete existentes[t.id];
      if (nueva) el = crearCarta(t);
      el.classList.remove('carta--pos-0', 'carta--pos-1', 'carta--pos-2', 'hacia-a', 'hacia-b');
      el.classList.add('carta--pos-' + i);
      el.style.zIndex = String(10 - i);
      el.style.filter = '';
      el.inert = i > 0;
      if (i > 0) el.setAttribute('aria-hidden', 'true');
      else el.removeAttribute('aria-hidden');

      var vuelve = nueva && i === 0 && app.entrada && app.entrada.id === t.id;
      if (vuelve) {
        var desde = { derecha: 'translate(130%, -4%) rotate(28deg)', izquierda: 'translate(-130%, -4%) rotate(-28deg)', arriba: 'translate(0, -130%)' }[app.entrada.dir];
        el.style.transition = 'none';
        el.style.transform = desde;
        app.entrada = null;
      } else {
        el.style.transition = '';
        el.style.transform = '';
      }
      if (nueva) mazo.appendChild(el);
      if (vuelve) {
        void el.offsetWidth;
        el.style.transition = '';
        el.style.transform = '';
      }
    });
    Object.keys(existentes).forEach(function (id) { existentes[id].remove(); });

    var fin = $('.fin-mazo', mazo);
    if (app.cola.length && fin) fin.remove();
    var actual = cartaActual();
    if (actual) anunciar(describir(actual._tarjeta));
    actualizarAcciones();
    if (!app.cola.length) finDelMazo();
  }

  function finDelMazo() {
    if (!app.motor.matches().length) {
      var m = app.motor.forzarMatch();
      if (m) {
        app.matchActual = m;
        app.bloqueoDeshacer = app.motor.pasos();
        actualizarQuimica();
        actualizarInsignia(true);
        setTimeout(function () { mostrarMatch(m); }, 300);
      }
    }
    var mazo = $('#mazo');
    if ($('.fin-mazo', mazo)) return;
    var div = document.createElement('div');
    div.className = 'fin-mazo';
    div.innerHTML = '<span class="fin-mazo__emoji" aria-hidden="true">🎉</span><h3>¡Has visto todas las tarjetas!</h3>' +
      '<p>Ya tienes tu match. Echa un vistazo a tus ciclos o vuelve a empezar.</p>' +
      '<button class="btn btn--grad" type="button" data-accion="ver-match">Ver mi resultado</button>' +
      '<button class="btn btn--suave" type="button" data-accion="reiniciar">Empezar de nuevo</button>';
    mazo.appendChild(div);
  }

  // ---------- Gestos ----------
  function ponerSello(el, tipo, valor) {
    var s = el.querySelector('.sello--' + tipo);
    if (s) s.style.opacity = valor;
  }

  function resaltar(sel, p) {
    var b = $(sel);
    b.style.setProperty('--escala', String(1 + 0.16 * p));
    b.classList.toggle('is-activa', p >= 1);
  }

  function reiniciarBotones() {
    ['#btn-like', '#btn-nope', '#btn-super'].forEach(function (sel) {
      var b = $(sel);
      b.style.removeProperty('--escala');
      b.classList.remove('is-activa');
    });
  }

  function moverCarta(el, dx, dy, ancho) {
    el.style.transform = 'translate(' + dx + 'px,' + dy + 'px) rotate(' + clamp(dx * 0.07, -24, 24) + 'deg)';
    var u = ancho * 0.28;
    var vertical = Math.abs(dy) > Math.abs(dx) * 1.1;
    var der = vertical ? 0 : clamp(dx / u, 0, 1);
    var izq = vertical ? 0 : clamp(-dx / u, 0, 1);
    var arr = vertical ? clamp(-dy / (u * 1.1), 0, 1) : 0;
    ponerSello(el, 'like', der);
    ponerSello(el, 'nope', izq);
    ponerSello(el, 'super', arr);
    if (el._tarjeta.tipo === 'versus') {
      el.classList.toggle('hacia-a', izq > 0.2);
      el.classList.toggle('hacia-b', der > 0.2);
    }
    var p = Math.max(der, izq, arr);
    var siguiente = $('#mazo .carta--pos-1');
    if (siguiente) {
      siguiente.style.transition = 'none';
      siguiente.style.transform = 'translateY(' + (12 - 12 * p) + 'px) scale(' + (0.955 + 0.045 * p) + ')';
      siguiente.style.filter = 'brightness(' + (0.94 + 0.06 * p) + ')';
    }
    resaltar('#btn-like', der);
    resaltar('#btn-nope', izq);
    resaltar('#btn-super', arr);
  }

  function volverAlCentro(el) {
    el.style.transition = '';
    el.style.transform = '';
    ['like', 'nope', 'super'].forEach(function (s) { ponerSello(el, s, 0); });
    el.classList.remove('hacia-a', 'hacia-b');
    var siguiente = $('#mazo .carta--pos-1');
    if (siguiente) {
      siguiente.style.transition = '';
      siguiente.style.transform = '';
      siguiente.style.filter = '';
    }
    reiniciarBotones();
  }

  function habilitarArrastre(el) {
    var p = null;
    el.addEventListener('pointerdown', function (e) {
      if (app.ocupado || !el.classList.contains('carta--pos-0')) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      p = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), dx: 0, dy: 0, arrastrando: false, ancho: el.offsetWidth || 320 };
    });
    el.addEventListener('pointermove', function (e) {
      if (!p || e.pointerId !== p.id) return;
      p.dx = e.clientX - p.x;
      p.dy = e.clientY - p.y;
      if (!p.arrastrando) {
        if (Math.abs(p.dx) + Math.abs(p.dy) < 8) return;
        p.arrastrando = true;
        try { el.setPointerCapture(p.id); } catch { /* el puntero ya no existe */ }
        el.classList.add('is-arrastrando');
        quitarTutorial();
      }
      e.preventDefault();
      moverCarta(el, p.dx, p.dy, p.ancho);
    });
    function soltar(e) {
      if (!p || e.pointerId !== p.id) return;
      var q = p;
      p = null;
      if (!q.arrastrando) return;
      el._finArrastre = performance.now();
      el.classList.remove('is-arrastrando');
      var dt = Math.max(1, performance.now() - q.t);
      var vx = q.dx / dt;
      var vy = q.dy / dt;
      var umbral = q.ancho * 0.28;
      var vertical = Math.abs(q.dy) > Math.abs(q.dx) * 1.1;
      var dir = null;
      if (e.type !== 'pointercancel') {
        if (vertical && (q.dy < -umbral * 1.1 || (vy < -0.6 && q.dy < -70))) dir = 'arriba';
        else if (!vertical && (q.dx > umbral || (vx > 0.55 && q.dx > 60))) dir = 'derecha';
        else if (!vertical && (q.dx < -umbral || (vx < -0.55 && q.dx < -60))) dir = 'izquierda';
      }
      if (dir) decidir(dir, { dx: q.dx, dy: q.dy, vy: vy });
      else volverAlCentro(el);
    }
    el.addEventListener('pointerup', soltar);
    el.addEventListener('pointercancel', soltar);
    el.addEventListener('click', function (e) {
      if (performance.now() - (el._finArrastre || 0) < 350) return;
      if (app.ocupado || !el.classList.contains('carta--pos-0')) return;
      var t = el._tarjeta;
      if (t.tipo === 'versus') {
        var lado = e.target.closest('[data-lado]');
        if (lado) decidir(lado.dataset.lado === 'a' ? 'izquierda' : 'derecha', null);
      } else if (t.tipo === 'perfil') {
        var r = el.getBoundingClientRect();
        cambiarDiapo(el, e.clientX && e.clientX - r.left < r.width * 0.35 ? -1 : 1);
      }
    });
  }

  function cambiarDiapo(el, delta) {
    var diapos = $$('.perfil__diapo', el);
    var barras = $$('.carta__barras span', el);
    var i = 0;
    diapos.forEach(function (d, j) { if (d.classList.contains('is-activa')) i = j; });
    var n = (i + delta + diapos.length) % diapos.length;
    diapos[i].classList.remove('is-activa');
    diapos[n].classList.add('is-activa');
    barras.forEach(function (b, j) { b.classList.toggle('is-activa', j === n); });
    anunciar($('.perfil__diapo.is-activa', el).textContent);
  }

  function lanzarCarta(el, dir, info, sinSello) {
    info = info || { dx: 0, dy: 0, vy: 0 };
    el.classList.remove('carta--pos-0', 'is-arrastrando');
    el.classList.add('is-saliendo');
    el.inert = true;
    if (!sinSello) ponerSello(el, SELLO[dir], 1);
    var ancho = el.offsetWidth || 320;
    var alto = window.innerHeight;
    var x, y, giro;
    if (dir === 'arriba') {
      x = info.dx;
      y = -(alto + 240);
      giro = info.dx * 0.05;
    } else {
      var s = dir === 'derecha' ? 1 : -1;
      x = s * (ancho * 1.6 + 120);
      y = info.dy + (info.vy || 0) * 140;
      giro = s * 32;
    }
    el.style.transition = REDUCIR_MOVIMIENTO ? 'none' : 'transform .45s cubic-bezier(.3,.6,.4,1), opacity .45s';
    void el.offsetWidth;
    el.style.transform = 'translate(' + x + 'px,' + y + 'px) rotate(' + giro + 'deg)';
    var quitar = function () { if (el.parentNode) el.remove(); };
    el.addEventListener('transitionend', quitar, { once: true });
    setTimeout(quitar, REDUCIR_MOVIMIENTO ? 0 : 650);
  }

  function respuestaPara(t, dir) {
    if (t.tipo === 'versus') return { accion: dir === 'izquierda' ? 'a' : dir === 'derecha' ? 'b' : 'ambas' };
    return { accion: dir === 'izquierda' ? 'nope' : dir === 'derecha' ? 'like' : 'super' };
  }

  function pulsar(dir) {
    var b = $({ derecha: '#btn-like', izquierda: '#btn-nope', arriba: '#btn-super' }[dir]);
    b.classList.remove('is-pulsada');
    void b.offsetWidth;
    b.classList.add('is-pulsada');
  }

  function decidir(dir, info) {
    var el = cartaActual();
    if (!el || app.ocupado) return;
    var t = el._tarjeta;
    if (t.tipo === 'pregunta') return;
    app.ocupado = true;
    quitarTutorial();
    pulsar(dir);
    lanzarCarta(el, dir, info);
    app.direcciones.push(dir);
    trasResponder(app.motor.responder(t, respuestaPara(t, dir)));
  }

  function habilitarPregunta(el) {
    var t = el._tarjeta;
    var elegidas = [];
    el.addEventListener('click', function (e) {
      if (app.ocupado || !el.classList.contains('carta--pos-0')) return;
      var b = e.target.closest('.opcion');
      if (b) {
        var id = b.dataset.opcion;
        if (t.multiple) {
          var i = elegidas.indexOf(id);
          if (i >= 0) elegidas.splice(i, 1);
          else elegidas.push(id);
          b.setAttribute('aria-pressed', String(i < 0));
          $('[data-listo]', el).disabled = !elegidas.length;
        } else {
          $$('.opcion', el).forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
          responderPregunta(el, [id]);
        }
      } else if (e.target.closest('[data-listo]') && elegidas.length) {
        responderPregunta(el, elegidas.slice());
      }
    });
  }

  function responderPregunta(el, opciones) {
    app.ocupado = true;
    quitarTutorial();
    setTimeout(function () {
      lanzarCarta(el, 'arriba', null, true);
      app.direcciones.push('arriba');
      trasResponder(app.motor.responder(el._tarjeta, { opciones: opciones }));
    }, REDUCIR_MOVIMIENTO ? 0 : 260);
  }

  function trasResponder(res) {
    app.cola.shift();
    rellenarCola();
    reiniciarBotones();
    pintarMazo();
    actualizarQuimica();
    if (res.match) {
      app.matchActual = res.match;
      app.bloqueoDeshacer = app.motor.pasos();
      actualizarInsignia(true);
      actualizarAcciones();
      setTimeout(function () {
        app.ocupado = false;
        mostrarMatch(res.match);
      }, REDUCIR_MOVIMIENTO ? 0 : 420);
      return;
    }
    actualizarInsignia(res.nuevasInteresadas.length > 0);
    if (res.nuevasInteresadas.length) avisarInteres();
    setTimeout(function () { app.ocupado = false; }, 90);
  }

  function puedeDeshacer() {
    return !!app.motor && app.motor.pasos() > app.bloqueoDeshacer;
  }

  function deshacer() {
    if (app.ocupado || !puedeDeshacer()) return;
    var t = app.motor.deshacer();
    if (!t) return;
    app.entrada = { id: t.id, dir: app.direcciones.pop() || 'izquierda' };
    app.cola.unshift(t);
    pintarMazo();
    actualizarQuimica();
    actualizarInsignia(false);
    anunciar('Última respuesta deshecha. ' + describir(t));
  }

  function quitarTutorial() { $('#mazo').classList.remove('con-tutorial'); }

  function accion(dir) {
    var el = cartaActual();
    if (!el || app.ocupado || el._tarjeta.tipo === 'pregunta') return;
    decidir(dir, null);
  }

  function actualizarAcciones() {
    var el = cartaActual();
    var t = el ? el._tarjeta : null;
    var pregunta = !!t && t.tipo === 'pregunta';
    $('#acciones').classList.toggle('es-pregunta', pregunta);
    $('#btn-deshacer').disabled = !puedeDeshacer();
    ['#btn-nope', '#btn-super', '#btn-like'].forEach(function (sel) { $(sel).disabled = !t || pregunta; });
    var etiquetas = ['', '', ''];
    var aria = ['Paso', '¡Me encanta!', 'Me mola'];
    if (t && t.tipo === 'versus') {
      etiquetas = [t.a.texto, 'Las dos', t.b.texto];
      aria = ['Elegir: ' + t.a.texto, 'Las dos', 'Elegir: ' + t.b.texto];
    } else if (t && t.tipo === 'dato') {
      aria = ['Siguiente', 'Siguiente', 'Siguiente'];
    }
    ['nope', 'super', 'like'].forEach(function (id, i) {
      $('#etiqueta-' + id).textContent = etiquetas[i];
      $('#btn-' + id).setAttribute('aria-label', aria[i]);
    });
  }

  // ---------- Química, likes y avisos ----------
  function actualizarQuimica() {
    var q = app.motor.quimica();
    var matches = app.motor.matches();
    $('#quimica-relleno').style.width = Math.round(q * 100) + '%';
    $('#quimica-barra').setAttribute('aria-valuenow', String(Math.round(q * 100)));
    var texto = $('#quimica-texto');
    if (matches.length) {
      texto.textContent = '💘 ' + familiaPorId[matches[0]].corto + ' · Ver';
      texto.disabled = false;
    } else {
      for (var i = 0; i < TEXTO_QUIMICA.length; i++) {
        if (q < TEXTO_QUIMICA[i][0]) { texto.textContent = TEXTO_QUIMICA[i][1]; break; }
      }
      texto.disabled = true;
    }
  }

  function actualizarInsignia(latir) {
    var matches = app.motor.matches().length;
    var n = matches || app.motor.interesadas().length;
    var insignia = $('#insignia-likes');
    insignia.hidden = !n;
    insignia.textContent = String(n);
    var boton = $('#btn-likes');
    boton.classList.toggle('is-match', matches > 0);
    boton.setAttribute('aria-label', matches ? 'Tus matches (' + matches + ')' : 'Familias a las que les gustas (' + n + ')');
    if (latir) {
      boton.classList.remove('is-latiendo');
      void boton.offsetWidth;
      boton.classList.add('is-latiendo');
    }
  }

  function avisarInteres() {
    var n = app.motor.interesadas().length;
    toast(n === 1 ? '💌 ¡Le gustas a una familia profesional!' : '💌 Ya le gustas a ' + n + ' familias');
    vibrar(20);
  }

  // ---------- ¡Es un match! ----------
  function lanzarConfeti() {
    if (REDUCIR_MOVIMIENTO) return;
    var piezas = ['💖', '✨', '💘', '🎉', '💕', '⭐'];
    var html = '';
    for (var i = 0; i < 30; i++) {
      html += '<span class="confeti" style="left:' + (Math.random() * 100).toFixed(1) + '%;font-size:' + Math.round(14 + Math.random() * 18) +
        'px;animation-duration:' + (2.2 + Math.random() * 2).toFixed(2) + 's;animation-delay:' + (Math.random() * 0.9).toFixed(2) + 's">' +
        piezas[i % piezas.length] + '</span>';
    }
    $('#match-confeti').innerHTML = html;
  }

  function mostrarMatch(m) {
    var f = m.familia;
    var capa = $('#match');
    capa.style.setProperty('--g1', f.colores[0]);
    capa.style.setProperty('--g2', f.colores[1]);
    $('#match-titulo').textContent = m.numero > 1 ? '¡Otro Match!' : '¡Es un Match!';
    $('#match-texto').innerHTML = (app.nombre ? esc(app.nombre) + ', a ti' : 'A ti') + ' y a <strong>' + esc(f.nombre) + '</strong> os gustan las mismas cosas.';
    $('#match-yo').textContent = app.avatar;
    $('#match-familia').textContent = f.emoji;
    $('#match-compat').textContent = m.pct + ' % de compatibilidad';
    $('#match-bio').textContent = '«' + f.bio + '»';
    var nota = $('#match-nota');
    nota.hidden = !m.forzado;
    nota.textContent = 'No ha sido un flechazo a primera vista, pero es la familia con la que más química tienes. 😉';
    lanzarConfeti();
    app.volverA = document.activeElement;
    capa.hidden = false;
    $('#btn-ver-ciclos').focus();
    vibrar([40, 60, 40]);
    anunciar('¡Es un match con ' + f.nombre + '! ' + m.pct + ' por ciento de compatibilidad.');
  }

  function cerrarMatch() {
    $('#match').hidden = true;
    $('#match-confeti').innerHTML = '';
  }

  // ---------- Resultado ----------
  function seccion(titulo, cuerpo) {
    return '<section class="seccion"><h2 class="seccion__titulo">' + titulo + '</h2>' + cuerpo + '</section>';
  }

  function htmlHeroe(f, r, esMatch) {
    var pre = esMatch ? (app.nombre ? esc(app.nombre) + ', tu' : 'Tu') + ' match es' : 'También tienes química con';
    return '<section class="res-heroe">' +
      '<div class="res-heroe__avatares" aria-hidden="true"><span class="avatar avatar--yo">' + app.avatar + '</span>' +
      '<span class="res-heroe__corazon">' + (esMatch ? '💘' : '✨') + '</span><span class="avatar avatar--familia">' + f.emoji + '</span></div>' +
      '<p class="res-heroe__pre">' + pre + '</p>' +
      '<h2 class="res-heroe__nombre">' + esc(f.nombre) + '</h2>' +
      '<p class="res-heroe__compat">' + r.pct + ' % de compatibilidad</p>' +
      '<p class="res-heroe__lema">' + esc(f.lema) + '</p>' +
      '<ul class="rasgos">' + f.rasgos.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></section>';
  }

  function htmlRazones(razones, f) {
    if (!razones.length) return '<p class="nota">' + esc(f.descripcion) + '</p>';
    return '<ul class="razones">' + razones.map(function (r) {
      return '<li><span class="razones__icono" aria-hidden="true">' + (r.super ? '⭐' : '✅') + '</span><span>' + esc(r.texto) + '</span></li>';
    }).join('') + '</ul><p class="nota">' + esc(f.descripcion) + '</p>';
  }

  function itemEncaje(ok, texto) {
    var ic = ok === true ? '✅' : ok === false ? '⚠️' : 'ℹ️';
    return '<li><span class="encaje__icono" aria-hidden="true">' + ic + '</span><span>' + esc(texto) + '</span></li>';
  }

  function htmlCiclo(r, destacado) {
    var c = r.ciclo;
    var insignias = '<span class="nivel nivel--' + c.nivel + '">' + esc(r.nivel.nombre) + '</span>' +
      c.modalidades.map(function (m) {
        return '<span class="modalidad">' + (m === 'semipresencial' ? '💻 Semipresencial' : '🏫 Presencial') + '</span>';
      }).join('') +
      (c.duracion ? '<span class="modalidad">⏱️ ' + esc(c.duracion) + '</span>' : '');
    var encaje = itemEncaje(r.acceso.ok, r.acceso.texto) +
      (r.modalidad.ok !== null ? itemEncaje(r.modalidad.ok, r.modalidad.texto) : '') +
      itemEncaje(r.turno.ok, r.turno.texto);
    return '<article class="ciclo' + (destacado ? ' ciclo--top' : '') + '">' +
      '<div class="ciclo__insignias">' + insignias + '</div>' +
      '<h3 class="ciclo__nombre">' + esc(c.nombre) + '</h3>' +
      '<p class="ciclo__resumen">' + esc(c.resumen) + '</p>' +
      '<ul class="encaje">' + encaje + '</ul>' +
      (c.extra ? '<p class="ciclo__extra">✨ ' + esc(c.extra) + '</p>' : '') +
      '<p class="ciclo__salidas"><b>Salidas:</b> ' + esc(c.salidas.join(' · ')) + '</p>' +
      '<a class="enlace" href="' + c.url + '" target="_blank" rel="noopener">Más información en la web del centro ↗</a></article>';
  }

  function htmlCiclos(recs) {
    var avisos = '';
    var accesibles = recs.filter(function (r) { return r.acceso.ok !== false; });
    if (!accesibles.length) {
      avisos += '<p class="aviso">Con tus estudios o tu edad actuales, estos ciclos todavía no encajan del todo. ¡Tranquilidad! ' +
        'Hay pruebas de acceso y otros caminos: pregunta en secretaría o mira tus otras familias.</p>';
    }
    if (recs.every(function (r) { return r.ciclo.nivel === 'ifc'; })) {
      avisos += '<p class="aviso">En esta familia el centro ofrece un itinerario IFC+21 de Formación Profesional Adaptada. ' +
        'Si no encaja con tu perfil, echa un vistazo a las familias con las que también tienes química.</p>';
    }
    var destacado = recs.length > 1 && accesibles.length ? recs.indexOf(accesibles[0]) : -1;
    return avisos + recs.map(function (r, i) { return htmlCiclo(r, i === destacado); }).join('');
  }

  function htmlRuta(ruta) {
    return '<p class="seccion__intro">En el Tony Gallardo puedes ir subiendo de nivel sin cambiar de familia.</p>' +
      '<ol class="ruta">' + ruta.map(function (p, i) {
        return '<li class="ruta__paso' + (p.entrada ? ' ruta__paso--entrada' : '') + '">' +
          '<span class="ruta__punto" aria-hidden="true">' + (i + 1) + '</span>' +
          '<p class="ruta__nivel">' + esc(p.info.nombre) + '</p>' +
          '<ul class="ruta__ciclos">' + p.ciclos.map(function (c) { return '<li>' + esc(c.nombre) + '</li>'; }).join('') + '</ul>' +
          (p.entrada ? '<span class="ruta__tu">Empiezas aquí</span>' : '') + '</li>';
      }).join('') + '</ol>';
  }

  function htmlDisponibilidad(perfil) {
    var h = perfil.horario || [];
    var chips = h.length
      ? h.map(function (x) { return '<span class="chip-suave">' + HORARIOS[x] + '</span>'; }).join('')
      : '<span class="chip-suave">Sin indicar</span>';
    var consejos = [];
    var entrada = app.motor.nivelEntrada();
    if (entrada === 'basico') consejos.push(['👣', 'Tu puerta de entrada es el Grado Básico: al terminarlo consigues también el título de la ESO y puedes seguir con un Grado Medio.']);
    if (entrada === 'medio') consejos.push(['👣', 'Tu puerta de entrada es el Grado Medio. Al terminarlo puedes pasar directamente a un Grado Superior.']);
    if (entrada === 'superior') consejos.push(['🚀', 'Con tus estudios puedes entrar directamente en un Grado Superior.']);
    if (h.indexOf('semi') >= 0) consejos.push(['💻', 'Educación Infantil e Integración Social se pueden cursar en modalidad semipresencial.']);
    consejos.push(['🕒', h.indexOf('tarde') >= 0 || h.indexOf('noche') >= 0
      ? 'El centro tiene turnos de mañana, tarde y noche: pregunta en secretaría en qué turno se imparte el ciclo que te interesa.'
      : 'El centro tiene turnos de mañana, tarde y noche. Confirma en secretaría el turno de tu ciclo.']);
    var meta = {
      trabajar: ['💼', 'Toda la FP incluye formación en empresas: saldrás con experiencia real en tu currículum.'],
      seguir: ['🎓', 'Con un Grado Superior puedes acceder a la universidad.'],
      cambiar: ['🔄', 'La FP es perfecta para reinventarte: en sus aulas hay gente de todas las edades.'],
      explorar: ['🧭', 'Puedes volver a jugar para comparar y hablar con el departamento de orientación del centro.']
    }[perfil.objetivo];
    if (meta) consejos.push(meta);
    return '<div class="chips-suaves">' + chips + '</div><ul class="consejos">' + consejos.map(function (c) {
      return '<li><span aria-hidden="true">' + c[0] + '</span><span>' + esc(c[1]) + '</span></li>';
    }).join('') + '</ul>';
  }

  function htmlOtra(r) {
    var f = r.familia;
    var ciclos = CICLOS.filter(function (c) { return c.familia === f.id; }).map(function (c) { return NIVELES[c.nivel].corto + ': ' + c.nombre; });
    return '<article class="otra" style="' + colores(f.colores) + '">' +
      '<span class="otra__avatar" aria-hidden="true">' + f.emoji + '</span>' +
      '<div><p class="otra__nombre">' + esc(f.nombre) + '</p><p class="otra__ciclos">' + esc(ciclos.join(' · ')) + '</p></div>' +
      '<span class="otra__pct">' + r.pct + ' %</span>' +
      '<button type="button" class="otra__ver" data-res="familia" data-id="' + f.id + '">Ver sus ciclos →</button></article>';
  }

  function htmlRanking(ranking) {
    var matches = app.motor.matches();
    return '<ul class="ranking">' + ranking.map(function (r) {
      return '<li class="' + (matches.indexOf(r.id) >= 0 ? 'es-match' : '') + '" style="' + colores(r.familia.colores) + '">' +
        '<span class="ranking__emoji" aria-hidden="true">' + r.familia.emoji + '</span>' +
        '<div><div class="ranking__nombre">' + esc(r.familia.nombre) + '</div><div class="ranking__barra"><span data-ancho="' + r.pct + '%"></span></div></div>' +
        '<span class="ranking__pct">' + r.pct + ' %</span></li>';
    }).join('') + '</ul>';
  }

  function htmlAdmision(recs) {
    var ifc = recs.some(function (r) { return r.ciclo.nivel === 'ifc'; }) || app.motor.perfil().edad === '21+';
    return '<ol class="pasos">' + CENTRO.admision.pasos.map(function (p) {
      return '<li><span class="pasos__emoji" aria-hidden="true">' + p.emoji + '</span><div><p class="pasos__titulo">' + esc(p.titulo) +
        '</p><p class="pasos__texto">' + esc(p.texto) + '</p></div></li>';
    }).join('') + '</ol>' +
      (ifc ? '<p class="nota">' + esc(CENTRO.admision.ifc) + '</p>' : '') +
      '<p class="nota"><a class="enlace" href="' + CENTRO.admisionUrl + '" target="_blank" rel="noopener">Admisión de FP en Canarias ↗</a></p>';
  }

  function htmlContacto() {
    return '<p class="contacto__datos"><b>' + esc(CENTRO.nombre) + '</b><br>' + esc(CENTRO.direccion) + ' (' + esc(CENTRO.barrio) + ')<br>' +
      '📞 ' + esc(CENTRO.telefono) + '<br><span class="rompe">✉️ ' + esc(CENTRO.email) + '</span></p>' +
      '<div class="contacto__botones">' +
      '<a class="boton-contacto" href="' + CENTRO.telefonoHref + '">' + icono('i-telefono') + 'Llamar</a>' +
      '<a class="boton-contacto" href="mailto:' + CENTRO.email + '">' + icono('i-correo') + 'Escribir</a>' +
      '<a class="boton-contacto" href="' + CENTRO.mapa + '" target="_blank" rel="noopener">' + icono('i-mapa') + 'Cómo llegar</a>' +
      '<a class="boton-contacto" href="' + CENTRO.web + '" target="_blank" rel="noopener">' + icono('i-web') + 'Web del centro</a></div>' +
      '<div class="redes">' + CENTRO.redes.map(function (r) {
        return '<a class="red" href="' + r.url + '" target="_blank" rel="noopener" aria-label="' + esc(r.nombre + ': ' + r.usuario) + '">' +
          icono(r.id === 'x' ? 'i-x-logo' : 'i-' + r.id) + '</a>';
      }).join('') + '</div>';
  }

  function mostrarResultado(id, previo) {
    var m = app.motor;
    var f = familiaPorId[id];
    var ranking = m.ranking();
    var r = ranking.filter(function (x) { return x.id === id; })[0];
    var esMatch = m.matches().indexOf(id) >= 0;
    var recs = m.recomendar(id);
    var ruta = m.ruta(id);
    var otras = ranking.filter(function (x) { return x.id !== id; }).slice(0, 2);
    app.resultadoId = id;
    app.resultadoPrevio = previo || null;

    var cont = $('#resultado');
    cont.setAttribute('style', colores(f.colores));
    cont.innerHTML = [
      '<header class="res-barra">',
      '<button class="icono-btn" type="button" data-res="volver" aria-label="' + (previo ? 'Volver a tu match' : 'Volver a las tarjetas') + '">' + icono('i-atras') + '</button>',
      '<h1 class="res-barra__titulo" id="titulo-resultado" tabindex="-1">' + (esMatch ? 'Tu match' : 'Familia con química') + '</h1>',
      COMPARTIR ? '<button class="icono-btn" type="button" data-res="compartir" aria-label="Compartir resultado">' + icono('i-compartir') + '</button>' : '<span></span>',
      '</header>',
      htmlHeroe(f, r, esMatch),
      seccion(esMatch ? '💬 Por qué hacéis match' : '💬 Lo que tenéis en común', htmlRazones(m.razones(id, 4), f)),
      seccion('🎓 Tus ciclos en el Tony Gallardo', htmlCiclos(recs)),
      ruta.length > 1 ? seccion('🧭 Tu camino en el centro', htmlRuta(ruta)) : '',
      seccion('⏰ Tu disponibilidad', htmlDisponibilidad(m.perfil())),
      seccion('🔥 También tienes química con…', otras.map(htmlOtra).join('')),
      seccion('📊 Tu ranking de familias', htmlRanking(ranking)),
      seccion('✍️ ¿Cómo me apunto?', htmlAdmision(recs)),
      seccion('📍 Ven a conocernos', htmlContacto()),
      '<div class="res-acciones">',
      COMPARTIR ? '<button class="btn btn--grad" type="button" data-res="compartir">' + icono('i-compartir') + 'Compartir mi match</button>' : '',
      '<button class="btn btn--suave" type="button" data-res="seguir">Seguir deslizando</button>',
      '<button class="btn btn--suave" type="button" data-res="reiniciar">' + icono('i-reiniciar') + 'Empezar de nuevo</button>',
      '</div>',
      '<p class="res-legal">Resultado orientativo a partir de tus respuestas: para decidir, habla con el departamento de orientación. ',
      'Oferta según la web del centro; confirma plazas, turnos y requisitos en secretaría. Los perfiles de las tarjetas son personajes de ejemplo.</p>'
    ].join('');
    mostrarPantalla('pantalla-resultado');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        $$('.ranking__barra span', cont).forEach(function (s) { s.style.width = s.dataset.ancho; });
      });
    });
  }

  function volverAlJuego() {
    mostrarPantalla('pantalla-juego');
    if (!app.cola.length) finDelMazo();
  }

  function compartir() {
    var f = familiaPorId[app.resultadoId];
    var r = app.motor.ranking().filter(function (x) { return x.id === f.id; })[0];
    var url = window.location.href.split('#')[0].split('?')[0];
    var texto = '💘 ¡He hecho match con ' + f.nombre + ' (' + r.pct + ' %) en el CIFP Tony Gallardo! ¿Y tú con qué familia profesional haces match?';
    if (navigator.share) {
      navigator.share({ title: 'Haz Match con el CIFP Tony Gallardo', text: texto, url: url }).catch(function (err) {
        // Si la persona cancela no hacemos nada; si el navegador lo bloquea (p. ej. en un iframe), copiamos.
        if (!err || err.name !== 'AbortError') copiar(texto + ' ' + url, url);
      });
    } else {
      copiar(texto + ' ' + url, url);
    }
  }

  function copiar(texto, url) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(
        function () { toast('📋 Copiado. ¡Pégalo donde quieras!'); },
        function () { toast('Comparte este enlace: ' + url); }
      );
    } else {
      toast('Comparte este enlace: ' + url);
    }
  }

  // ---------- Hojas: likes e información ----------
  function abrirHoja(id) {
    app.volverA = document.activeElement;
    var hoja = document.getElementById(id);
    hoja.hidden = false;
    $('.hoja__cerrar', hoja).focus();
  }

  function cerrarHojas() {
    var abiertas = $$('.hoja').filter(function (h) { return !h.hidden; });
    if (!abiertas.length) return;
    abiertas.forEach(function (h) { h.hidden = true; });
    if (app.volverA && document.contains(app.volverA)) app.volverA.focus();
  }

  function abrirLikes() {
    var m = app.motor;
    var matches = m.matches();
    var interesadas = m.interesadas();
    var titulo, texto;
    if (matches.length) {
      titulo = matches.length === 1 ? 'Tienes 1 match 💘' : 'Tienes ' + matches.length + ' matches 💘';
      texto = 'Toca tu match para ver tus ciclos recomendados.';
    } else if (interesadas.length) {
      titulo = 'Le gustas a ' + interesadas.length + (interesadas.length === 1 ? ' familia' : ' familias');
      texto = 'Sigue deslizando para descubrir quién es… y si el flechazo es mutuo. 😉';
    } else {
      titulo = 'Aún no hay likes';
      texto = 'Desliza unas cuantas tarjetas y verás cómo las familias profesionales empiezan a fijarse en ti.';
    }
    var orden = FAMILIAS.slice().sort(function () { return Math.random() - 0.5; }).sort(function (a, b) {
      return (matches.indexOf(b.id) >= 0) - (matches.indexOf(a.id) >= 0);
    });
    var rejilla = orden.map(function (f) {
      var esMatch = matches.indexOf(f.id) >= 0;
      if (esMatch) {
        return '<button type="button" class="likes__carta likes__carta--match" style="' + colores(f.colores) + '" data-accion="ver-familia" data-id="' + f.id + '">' +
          '<span class="emoji" aria-hidden="true">' + f.emoji + '</span><span class="likes__nombre">' + esc(f.nombre) + '</span></button>';
      }
      var interes = interesadas.indexOf(f.id) >= 0;
      return '<div class="likes__carta ' + (interes ? 'likes__carta--interes' : 'likes__carta--oculta') + '" style="' + colores(f.colores) + '"' +
        ' role="img" aria-label="' + (interes ? 'Familia misteriosa interesada en ti' : 'Familia misteriosa') + '"><span class="emoji" aria-hidden="true">' + f.emoji + '</span></div>';
    }).join('');
    $('#likes-contenido').innerHTML = '<h2 class="hoja__titulo" id="likes-titulo">' + titulo + '</h2><p class="hoja__texto">' + texto + '</p>' +
      '<div class="likes__rejilla">' + rejilla + '</div>';
    abrirHoja('hoja-likes');
  }

  function abrirInfo() {
    $('#info-contenido').innerHTML =
      '<div class="info__cabecera"><img class="info__logo" src="assets/logo.webp" alt="" width="64" height="64">' +
      '<div><h2 class="hoja__titulo" id="info-titulo">' + esc(CENTRO.nombre) + '</h2>' +
      '<p class="hoja__texto">' + esc(CENTRO.nombreLargo) + '</p></div></div>' +
      '<div class="cifras">' + CENTRO.cifras.map(function (c) { return '<div class="cifra"><b>' + esc(c.valor) + '</b><span>' + esc(c.texto) + '</span></div>'; }).join('') + '</div>' +
      '<h3 class="info__subtitulo">Nuestra historia</h3>' +
      '<ul class="linea-tiempo">' + CENTRO.historia.map(function (h) { return '<li><b>' + esc(h.anio) + '</b>' + esc(h.texto) + '</li>'; }).join('') + '</ul>' +
      '<p class="nota">🗿 El centro lleva el nombre del escultor grancanario Tony Gallardo (1929-1996), conocido como «el escultor de la lava».</p>' +
      '<h3 class="info__subtitulo">Contacto</h3>' + htmlContacto() +
      '<h3 class="info__subtitulo">Sobre esta app</h3>' +
      '<ul class="info__lista">' +
      '<li>Desliza tarjetas sobre tus gustos, planes y manías. Cuando una familia profesional acumula suficientes likes y encaja contigo claramente mejor que las demás… ¡match!</li>' +
      '<li>Todo ocurre en tu dispositivo: no se guardan ni se envían tus respuestas.</li>' +
      '<li>Los perfiles de las tarjetas son personajes de ejemplo.</li>' +
      '<li>El resultado es orientativo: habla con el departamento de orientación del centro.</li></ul>' +
      '<div class="likes__pie"><button class="btn btn--suave" type="button" data-accion="reiniciar">' + icono('i-reiniciar') + 'Empezar de nuevo</button></div>';
    abrirHoja('hoja-info');
  }

  function reiniciar() {
    cerrarHojas();
    cerrarMatch();
    app.motor = null;
    app.cola = [];
    app.matchActual = null;
    app.resultadoId = null;
    app.ocupado = false;
    $$('#mazo .carta, #mazo .fin-mazo').forEach(function (el) { el.remove(); });
    if (KIOSCO) {
      $('#input-nombre').value = '';
      elegirAvatar($('.avatar-opcion'));
    }
    mostrarPantalla('pantalla-inicio');
  }

  // ---------- Eventos ----------
  function prepararJuego() {
    $('#btn-nope').addEventListener('click', function () { accion('izquierda'); });
    $('#btn-like').addEventListener('click', function () { accion('derecha'); });
    $('#btn-super').addEventListener('click', function () { accion('arriba'); });
    $('#btn-deshacer').addEventListener('click', deshacer);
    $('#btn-info').addEventListener('click', abrirInfo);
    $('#btn-likes').addEventListener('click', abrirLikes);
    $('#quimica-texto').addEventListener('click', function () {
      var matches = app.motor.matches();
      if (matches.length) mostrarResultado(matches[0]);
    });
    $('#btn-ver-ciclos').addEventListener('click', function () {
      cerrarMatch();
      mostrarResultado(app.matchActual.id);
    });
    $('#btn-seguir').addEventListener('click', function () {
      cerrarMatch();
      volverAlJuego();
      $('#btn-like').focus();
    });
    $('#resultado').addEventListener('click', function (e) {
      var b = e.target.closest('[data-res]');
      if (!b) return;
      var tipo = b.dataset.res;
      if (tipo === 'volver') {
        if (app.resultadoPrevio) mostrarResultado(app.resultadoPrevio);
        else volverAlJuego();
      } else if (tipo === 'seguir') volverAlJuego();
      else if (tipo === 'compartir') compartir();
      else if (tipo === 'reiniciar') reiniciar();
      else if (tipo === 'familia') mostrarResultado(b.dataset.id, app.resultadoId);
    });
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-cerrar]')) { cerrarHojas(); return; }
      var b = e.target.closest('[data-accion]');
      if (!b) return;
      if (b.dataset.accion === 'reiniciar') reiniciar();
      else if (b.dataset.accion === 'ver-match') mostrarResultado(app.motor.matches()[0]);
      else if (b.dataset.accion === 'ver-familia') { cerrarHojas(); mostrarResultado(b.dataset.id); }
    });
    document.addEventListener('keydown', teclado);
  }

  function teclado(e) {
    if (e.key === 'Escape') {
      if (!$('#match').hidden) { $('#btn-seguir').click(); return; }
      cerrarHojas();
      return;
    }
    if ($('#pantalla-juego').hidden || !$('#match').hidden || $$('.hoja').some(function (h) { return !h.hidden; })) return;
    if (e.target.closest && e.target.closest('input, textarea')) return;
    var deshacerTecla = e.key === 'Backspace' || (e.key === 'z' && (e.ctrlKey || e.metaKey));
    if (deshacerTecla) {
      e.preventDefault();
      deshacer();
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var el = cartaActual();
    if (!el) return;
    var t = el._tarjeta;
    if (t.tipo === 'pregunta') {
      if (/^[1-9]$/.test(e.key)) {
        var boton = $$('.opcion', el)[Number(e.key) - 1];
        if (boton) { e.preventDefault(); boton.click(); }
      } else if (e.key === 'Enter' && !e.target.closest('button')) {
        var listo = $('[data-listo]', el);
        if (listo && !listo.disabled) { e.preventDefault(); listo.click(); }
      }
      return;
    }
    var dir = { ArrowRight: 'derecha', ArrowLeft: 'izquierda', ArrowUp: 'arriba' }[e.key];
    if (dir) {
      e.preventDefault();
      accion(dir);
    } else if (e.key === ' ' && t.tipo === 'perfil' && !e.target.closest('button')) {
      e.preventDefault();
      cambiarDiapo(el, 1);
    }
  }

  function prepararKiosco() {
    if (!KIOSCO) return;
    var temporizador;
    var rearmar = function () {
      clearTimeout(temporizador);
      temporizador = setTimeout(function () {
        if ($('#pantalla-inicio').hidden) reiniciar();
        rearmar();
      }, 120000);
    };
    ['pointerdown', 'keydown'].forEach(function (ev) { document.addEventListener(ev, rearmar, true); });
    rearmar();
  }

  prepararInicio();
  prepararPerfil();
  prepararJuego();
  prepararKiosco();
})();
