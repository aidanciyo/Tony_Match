/*
 * Motor de «Match con el CIFP Tony Gallardo».
 *
 * Cada respuesta suma (o resta) puntos a las familias profesionales. La afinidad de
 * una familia es la proporción de puntos conseguidos sobre los posibles, suavizada
 * para que dos likes sueltos no disparen un 100 %.
 *
 * Hay match cuando se cumplen TODAS estas condiciones:
 *   1. Has deslizado al menos `minSwipes` tarjetas.
 *   2. Has contestado las preguntas imprescindibles (estudios, horario y edad).
 *   3. Todas las familias han aparecido alguna vez (nadie queda sin oportunidad).
 *   4. Has dado al menos `minLikes` likes a tarjetas de la familia líder.
 *   5. La líder supera `minAfinidad` y saca `minMargen` a la segunda.
 * Si al llegar a `maxSwipes` no hay una ganadora clara, el match se fuerza con la líder.
 *
 * La selección de tarjetas es adaptativa: al principio explora todas las familias y,
 * a medida que se perfila una favorita, elige tarjetas que la confirmen, que la
 * separen de la segunda y que ayuden a ordenar sus ciclos.
 */
(function (root, factory) {
  var motor = factory();
  if (typeof module === 'object' && module.exports) module.exports = motor;
  else root.TonyMatch = Object.assign(root.TonyMatch || {}, motor);
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var AJUSTES = {
    minSwipes: 12,
    maxSwipes: 26,
    minLikes: 3,
    minAfinidad: 0.45,
    minMargen: 0.12,
    minExposicion: 2,
    prior: 4,
    factorNope: 0.5,
    factorSuper: 2,
    factorAmbas: 0.6,
    swipesEntreMatches: 6,
    umbralInteres: 0.35,
    // Posición (tarjetas servidas) en la que aparecen preguntas rápidas, perfiles y datos curiosos.
    huecos: {
      2: 'q-aprendizaje', 4: 'perfil', 6: 'q-estudios', 8: 'dato', 10: 'q-superpoder', 12: 'perfil',
      14: 'q-horario', 16: 'dato', 18: 'q-edad', 20: 'perfil', 21: 'q-objetivo', 24: 'dato',
      27: 'q-finde', 28: 'perfil', 31: 'dato', 35: 'perfil', 37: 'dato'
    }
  };

  var DESLIZABLES = { gusto: true, versus: true, perfil: true };
  var TURNOS = { manana: 'mañana', tarde: 'tarde', noche: 'noche' };

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function porcentaje(afinidad) {
    return Math.round(clamp(100 / (1 + Math.exp(-4 * (afinidad - 0.2))), 1, 99));
  }

  function sumar(destino, pesos, factor) {
    if (!pesos) return;
    Object.keys(pesos).forEach(function (k) {
      destino[k] = (destino[k] || 0) + pesos[k] * factor;
    });
  }

  function maximos(mapas) {
    var r = {};
    mapas.forEach(function (m) {
      Object.keys(m || {}).forEach(function (k) { r[k] = Math.max(r[k] || 0, m[k]); });
    });
    return r;
  }

  function minuscula(texto) { return texto.charAt(0).toLowerCase() + texto.slice(1); }

  function listaTexto(items) {
    if (items.length <= 1) return items.join('');
    return items.slice(0, -1).join(', ') + ' y ' + items[items.length - 1];
  }

  function crearMotor(datos, opciones) {
    var cfg = Object.assign({}, AJUSTES, opciones || {});
    var rng = cfg.rng || Math.random;
    var familias = datos.FAMILIAS;
    var ciclos = datos.CICLOS;
    var niveles = datos.NIVELES;
    var tarjetas = datos.TARJETAS;
    var ids = familias.map(function (f) { return f.id; });
    var porId = {};
    tarjetas.forEach(function (t) { porId[t.id] = t; });
    var preguntas = tarjetas.filter(function (t) { return t.tipo === 'pregunta'; });
    var curiosidades = (datos.CURIOSIDADES || []).map(function (c) {
      return { id: 'dato-' + c.id, tipo: 'dato', emoji: c.emoji, texto: c.texto };
    });

    function cero() {
      var o = {};
      ids.forEach(function (id) { o[id] = 0; });
      return o;
    }

    var st = {
      puntos: cero(),
      exposicion: cero(),
      likes: cero(),
      ciclos: {},
      perfil: { estudios: null, edad: null, horario: [], objetivo: null },
      respondidas: {},
      interesadas: {},
      matches: [],
      ultimoMatch: -Infinity,
      divertidas: 0,
      swipes: 0,
      servidas: 0,
      curiosidad: 0,
      vistas: {},
      recientes: [],
      historial: []
    };

    function instantanea() {
      return JSON.parse(JSON.stringify({
        puntos: st.puntos, exposicion: st.exposicion, likes: st.likes, ciclos: st.ciclos,
        perfil: st.perfil, respondidas: st.respondidas, interesadas: st.interesadas,
        matches: st.matches, ultimoMatch: st.ultimoMatch === -Infinity ? null : st.ultimoMatch,
        divertidas: st.divertidas, swipes: st.swipes
      }));
    }

    function restaurar(s) {
      Object.keys(s).forEach(function (k) { st[k] = s[k]; });
      if (st.ultimoMatch === null) st.ultimoMatch = -Infinity;
    }

    function pesosMax(t) {
      if (t.tipo === 'versus') return maximos([t.a.f, t.b.f]);
      if (t.tipo === 'pregunta') return maximos(t.opciones.map(function (o) { return o.f; }));
      return t.f || {};
    }

    function afinidad(id) {
      return st.puntos[id] / (st.exposicion[id] + cfg.prior);
    }

    function ranking() {
      return familias.map(function (f, i) {
        var a = afinidad(f.id);
        return {
          id: f.id, familia: f, afinidad: a, pct: porcentaje(a),
          likes: st.likes[f.id], puntos: st.puntos[f.id], exposicion: st.exposicion[f.id], orden: i
        };
      }).sort(function (x, y) {
        return (y.afinidad - x.afinidad) || (y.puntos - x.puntos) || (x.orden - y.orden);
      });
    }

    function requeridasPendientes() {
      return preguntas.filter(function (q) { return q.requerida && !st.respondidas[q.id]; });
    }

    function condiciones() {
      var rk = ranking();
      var lider = rk[0];
      var segunda = rk[1];
      return {
        lider: lider,
        segunda: segunda,
        swipes: st.swipes >= cfg.minSwipes,
        requeridas: requeridasPendientes().length === 0,
        sondeadas: ids.every(function (id) { return st.exposicion[id] >= cfg.minExposicion; }),
        likes: lider.likes >= cfg.minLikes,
        afinidad: lider.afinidad >= cfg.minAfinidad,
        margen: lider.afinidad - segunda.afinidad >= cfg.minMargen
      };
    }

    function casiListo() {
      if (st.swipes >= cfg.maxSwipes - 3) return true;
      var c = condiciones();
      return st.swipes >= cfg.minSwipes - 3 && c.likes && c.afinidad && c.margen;
    }

    // Termómetro de 0 a 1 para la barra de «química».
    function quimica() {
      if (st.matches.length) return 1;
      var c = condiciones();
      var q1 = clamp(st.swipes / cfg.minSwipes, 0, 1);
      var q2 = clamp((c.lider.afinidad - c.segunda.afinidad) / cfg.minMargen, 0, 1);
      var q3 = clamp(c.lider.likes / cfg.minLikes, 0, 1);
      var q4 = clamp(c.lider.afinidad / cfg.minAfinidad, 0, 1);
      var q = 0.4 * q1 + 0.6 * (0.4 * q2 + 0.3 * q3 + 0.3 * q4);
      return clamp(Math.max(q, st.swipes / cfg.maxSwipes), 0, 0.97);
    }

    function siguienteCuriosidad() {
      return curiosidades[st.curiosidad++] || null;
    }

    function elegirTarjeta(tipo) {
      var candidatas = tarjetas.filter(function (t) {
        return DESLIZABLES[t.tipo] && !st.vistas[t.id] && (!tipo || t.tipo === tipo);
      });
      if (!candidatas.length) return null;
      var rk = ranking();
      var top = rk.slice(0, 3).map(function (r) { return r.id; });
      var ciclosLider = ciclos.filter(function (c) { return c.familia === top[0]; }).map(function (c) { return c.id; });
      var p = st.swipes;
      var lambda = clamp((p - 4) / 8, 0, 1);
      var ultimoTipo = st.recientes[st.recientes.length - 1];
      var perfilReciente = st.recientes.slice(-2).indexOf('perfil') >= 0;
      var mejor = null;

      candidatas.forEach(function (t) {
        var w = pesosMax(t);
        var explora = 0;
        var foco = 0;
        var discr = 0;
        var bonusCiclo = 0;
        ids.forEach(function (id) { if (w[id]) explora += w[id] / (1 + st.exposicion[id]); });
        // En un «esto o aquello» solo se elige un lado: explora menos de lo que suman ambos.
        if (t.tipo === 'versus') explora *= 0.65;
        top.forEach(function (id, i) { if (w[id]) foco += w[id] * [1, 0.7, 0.5][i]; });
        if (t.tipo === 'versus') {
          top.forEach(function (id) { discr += Math.abs((t.a.f[id] || 0) - (t.b.f[id] || 0)); });
        } else {
          discr = Math.abs((w[top[0]] || 0) - (w[top[1]] || 0));
        }
        if (p >= 6) {
          var mapaCiclos = t.tipo === 'versus' ? maximos([t.a.c, t.b.c]) : (t.c || {});
          ciclosLider.forEach(function (id) { bonusCiclo += Math.abs(mapaCiclos[id] || 0); });
          bonusCiclo *= 0.35;
        }
        var u = (1 - lambda) * 2 * explora + lambda * (foco + 0.6 * discr + bonusCiclo + 0.5 * explora);
        if (t.tipo === 'perfil' && !tipo && (p < 3 || perfilReciente)) u *= 0.25;
        if (t.tipo === ultimoTipo) u *= t.tipo === 'versus' ? 0.5 : 0.8;
        if (t.divertida) u = (st.divertidas || p < 3 || p > 15) ? 0 : u + 1.5;
        u *= 0.75 + 0.5 * rng();
        if (!mejor || u > mejor.u) mejor = { t: t, u: u };
      });
      return mejor.t;
    }

    function marcarServida(t) {
      st.servidas++;
      st.vistas[t.id] = true;
      if (DESLIZABLES[t.tipo]) st.recientes = st.recientes.concat(t.tipo).slice(-3);
      return t;
    }

    // Devuelve la próxima tarjeta que hay que mostrar (o null si el mazo se ha agotado).
    function siguiente() {
      var pendientes = requeridasPendientes().filter(function (q) { return !st.vistas[q.id]; });
      if (pendientes.length && casiListo()) return marcarServida(pendientes[0]);

      var hueco = cfg.huecos[st.servidas];
      if (hueco === 'dato') {
        var dato = siguienteCuriosidad();
        if (dato) return marcarServida(dato);
      } else if (hueco === 'perfil' && st.recientes[st.recientes.length - 1] !== 'perfil') {
        var perfil = elegirTarjeta('perfil');
        if (perfil) return marcarServida(perfil);
      } else if (hueco && porId[hueco] && !st.vistas[hueco]) {
        return marcarServida(porId[hueco]);
      }

      var t = elegirTarjeta();
      if (t) return marcarServida(t);

      var sinHacer = preguntas.filter(function (q) { return !st.vistas[q.id]; });
      if (sinHacer.length) return marcarServida(sinHacer[0]);
      return null;
    }

    function registrarMatch(r, forzado) {
      st.matches.push(r.id);
      st.ultimoMatch = st.swipes;
      return { id: r.id, familia: r.familia, pct: r.pct, afinidad: r.afinidad, forzado: forzado, numero: st.matches.length };
    }

    function comprobarMatch() {
      var c = condiciones();
      if (!st.matches.length) {
        var listo = c.swipes && c.requeridas && c.sondeadas && c.likes && c.afinidad && c.margen;
        var forzado = st.swipes >= cfg.maxSwipes && c.requeridas;
        return listo || forzado ? registrarMatch(c.lider, !listo) : null;
      }
      // Después del primer match se puede seguir deslizando y hacer match con otra familia.
      if (st.swipes - st.ultimoMatch < cfg.swipesEntreMatches) return null;
      var candidata = ranking().filter(function (r) { return st.matches.indexOf(r.id) < 0; })[0];
      if (candidata && candidata.likes >= cfg.minLikes && candidata.afinidad >= Math.max(cfg.minAfinidad, 0.5)) {
        return registrarMatch(candidata, false);
      }
      return null;
    }

    // Registra la respuesta a una tarjeta.
    //   gusto / perfil / dato: { accion: 'like' | 'nope' | 'super' }
    //   versus:                { accion: 'a' | 'b' | 'ambas' }
    //   pregunta:              { opciones: ['id', ...] }
    function responder(t, r) {
      var antes = instantanea();
      var d = { puntos: {}, ciclos: {} };
      var likes = {};

      function contarLikes(pesos, n) {
        Object.keys(pesos || {}).forEach(function (id) {
          if (pesos[id] >= 2) likes[id] = (likes[id] || 0) + n;
        });
      }

      if (t.tipo === 'gusto' || t.tipo === 'perfil') {
        var factor = r.accion === 'super' ? cfg.factorSuper : r.accion === 'like' ? 1 : -cfg.factorNope;
        sumar(d.puntos, t.f, factor);
        sumar(d.ciclos, t.c, factor);
        sumar(st.exposicion, t.f, 1);
        if (factor > 0) contarLikes(t.f, r.accion === 'super' ? 2 : 1);
        st.swipes++;
      } else if (t.tipo === 'versus') {
        var fa = r.accion === 'b' ? 0 : r.accion === 'ambas' ? cfg.factorAmbas : 1;
        var fb = r.accion === 'a' ? 0 : r.accion === 'ambas' ? cfg.factorAmbas : 1;
        sumar(d.puntos, t.a.f, fa);
        sumar(d.puntos, t.b.f, fb);
        sumar(d.ciclos, t.a.c, fa);
        sumar(d.ciclos, t.b.c, fb);
        sumar(st.exposicion, pesosMax(t), 1);
        if (fa) contarLikes(t.a.f, 1);
        if (fb) contarLikes(t.b.f, 1);
        st.swipes++;
      } else if (t.tipo === 'pregunta') {
        var elegidas = t.opciones.filter(function (o) { return r.opciones.indexOf(o.id) >= 0; });
        if (t.campo) {
          st.perfil[t.campo] = t.multiple
            ? elegidas.map(function (o) { return o.id; })
            : (elegidas[0] ? elegidas[0].id : null);
        }
        var puntua = t.opciones.some(function (o) { return o.f; });
        if (puntua) {
          elegidas.forEach(function (o) {
            sumar(d.puntos, o.f, 1);
            sumar(d.ciclos, o.c, 1);
            contarLikes(o.f, 1);
          });
          sumar(st.exposicion, pesosMax(t), 1);
        }
        st.respondidas[t.id] = r.opciones.slice();
      }

      sumar(st.puntos, d.puntos, 1);
      sumar(st.ciclos, d.ciclos, 1);
      sumar(st.likes, likes, 1);
      if (t.divertida) st.divertidas++;

      var nuevas = [];
      ids.forEach(function (id) {
        if (!st.interesadas[id] && afinidad(id) >= cfg.umbralInteres && st.likes[id] >= 2) {
          st.interesadas[id] = true;
          nuevas.push(id);
        }
      });

      var match = comprobarMatch();
      st.historial.push({ tarjeta: t, respuesta: r, puntos: d.puntos, antes: antes });
      return { match: match, nuevasInteresadas: nuevas };
    }

    // Deshace la última respuesta y devuelve su tarjeta para volver a mostrarla.
    function deshacer() {
      var h = st.historial.pop();
      if (!h) return null;
      restaurar(h.antes);
      return h.tarjeta;
    }

    // Por si el mazo se agota sin match: se queda la familia líder.
    function forzarMatch() {
      if (st.matches.length) return null;
      return registrarMatch(ranking()[0], true);
    }

    // Motivos del match: lo que más ha sumado a esa familia.
    function razones(id, n) {
      var vistas = {};
      var lista = [];
      st.historial.forEach(function (h) {
        var peso = h.puntos[id] || 0;
        if (peso <= 0) return;
        var t = h.tarjeta;
        var r = h.respuesta;
        var textos = [];
        if (t.tipo === 'gusto') textos.push(t.corto);
        else if (t.tipo === 'perfil') textos.push('Te molaba el curro de ' + t.nombre + ': ' + minuscula(t.puesto));
        else if (t.tipo === 'versus') {
          if (r.accion === 'ambas') textos.push('«' + t.a.texto + '» y «' + t.b.texto + '»');
          else {
            var elegido = r.accion === 'a' ? t.a : t.b;
            var otro = r.accion === 'a' ? t.b : t.a;
            textos.push('«' + elegido.texto + '» antes que «' + otro.texto + '»');
          }
        } else if (t.tipo === 'pregunta' && t.razon) {
          t.opciones.forEach(function (o) {
            if (r.opciones.indexOf(o.id) >= 0 && o.f && o.f[id] > 0) textos.push(t.razon.replace('{texto}', minuscula(o.texto)));
          });
        }
        textos.forEach(function (texto) {
          if (vistas[texto]) return;
          vistas[texto] = true;
          lista.push({ texto: texto, peso: peso, super: r.accion === 'super' });
        });
      });
      return lista.sort(function (a, b) { return b.peso - a.peso; }).slice(0, n || 4);
    }

    function nivelEntrada() {
      var e = st.perfil.estudios;
      var edad = st.perfil.edad;
      if (!e) return null;
      if (e === 'eso-no') return edad === '18-20' || edad === '21+' ? 'medio' : 'basico';
      if (e === 'eso') return 'medio';
      return 'superior';
    }

    function evaluarAcceso(ciclo) {
      var e = st.perfil.estudios;
      var edad = st.perfil.edad;
      switch (ciclo.nivel) {
        case 'basico':
          if (!e) return { ok: null, texto: niveles.basico.requisito };
          if (e !== 'eso-no') return { ok: false, texto: 'Ya tienes la ESO, así que puedes ir directamente a un Grado Medio.' };
          if (edad === '18-20' || edad === '21+') return { ok: false, texto: 'El Grado Básico es para jóvenes de 15 a 17 años. Pregunta en el centro por otras opciones para ti.' };
          return { ok: edad === '15-17' ? true : null, texto: 'Pensado para ti: de 15 a 17 años y sin la ESO, con propuesta del equipo docente.' };
        case 'medio':
          if (!e) return { ok: null, texto: niveles.medio.requisito };
          if (e === 'eso-no') return { ok: false, texto: 'Necesitas la ESO o un Grado Básico… o aprobar la prueba de acceso (desde los 17 años).' };
          return { ok: true, texto: 'Puedes acceder con tus estudios.' };
        case 'superior':
          if (!e) return { ok: null, texto: niveles.superior.requisito };
          if (e === 'eso-no' || e === 'eso') return { ok: false, texto: 'Necesitas Bachillerato o un Grado Medio… o aprobar la prueba de acceso (desde los 19 años).' };
          return { ok: true, texto: 'Puedes acceder con tus estudios.' };
        default:
          if (edad === '21+') return { ok: true, texto: 'Formación Profesional Adaptada para mayores de 21 años: consulta los requisitos en el centro.' };
          if (!edad || edad === 'nsnc') return { ok: null, texto: niveles.ifc.requisito };
          return { ok: false, texto: 'Es una Formación Profesional Adaptada para personas de 21 años o más.' };
      }
    }

    function evaluarModalidad(ciclo) {
      var horario = st.perfil.horario || [];
      var semi = ciclo.modalidades.indexOf('semipresencial') >= 0;
      var quiereSemi = horario.indexOf('semi') >= 0;
      var soloSemi = quiereSemi && horario.length === 1;
      if (semi && quiereSemi) return { ok: true, texto: 'También semipresencial: ideal para compaginar con trabajo o familia.' };
      if (semi) return { ok: true, texto: 'Presencial o semipresencial, tú eliges.' };
      if (soloSemi) return { ok: false, texto: 'Solo presencial.' };
      return { ok: null, texto: 'Presencial.' };
    }

    function evaluarTurno(ciclo) {
      var prefs = (st.perfil.horario || []).filter(function (h) { return TURNOS[h]; }).map(function (h) { return TURNOS[h]; });
      var turnos = ciclo.turnos || [];
      if (!turnos.length) return { ok: null, texto: 'Turno por confirmar: el centro tiene clases de mañana, tarde y noche.' };
      if (!prefs.length) return { ok: null, texto: 'Turno de ' + listaTexto(turnos) + '.' };
      var comunes = turnos.filter(function (x) { return prefs.indexOf(x) >= 0; });
      return comunes.length
        ? { ok: true, texto: 'Turno de ' + listaTexto(comunes) + ': te encaja.' }
        : { ok: false, texto: 'Se imparte en turno de ' + listaTexto(turnos) + '.' };
    }

    // Ciclos de una familia, ordenados de más a menos recomendable para ti.
    function recomendar(id) {
      var entrada = nivelEntrada();
      return ciclos.filter(function (c) { return c.familia === id; }).map(function (c, i) {
        var acceso = evaluarAcceso(c);
        var modalidad = evaluarModalidad(c);
        var turno = evaluarTurno(c);
        var encaje = st.ciclos[c.id] || 0;
        var puntuacion = (acceso.ok === true ? 100 : acceso.ok === null ? 60 : 0) +
          encaje * 4 + (c.nivel === entrada ? 12 : 0) +
          (modalidad.ok === true ? 6 : modalidad.ok === false ? -6 : 0) +
          (turno.ok === true ? 6 : turno.ok === false ? -6 : 0) - i * 0.01;
        return { ciclo: c, nivel: niveles[c.nivel], acceso: acceso, modalidad: modalidad, turno: turno, encaje: encaje, puntuacion: puntuacion };
      }).sort(function (a, b) { return b.puntuacion - a.puntuacion; });
    }

    // Itinerario de la familia en el centro (Básico → Medio → Superior) y tu punto de entrada.
    function ruta(id) {
      var entrada = nivelEntrada();
      var porNivel = {};
      ciclos.forEach(function (c) {
        if (c.familia !== id) return;
        (porNivel[c.nivel] = porNivel[c.nivel] || []).push(c);
      });
      return Object.keys(porNivel).sort(function (a, b) { return niveles[a].orden - niveles[b].orden; }).map(function (n) {
        return { nivel: n, info: niveles[n], ciclos: porNivel[n], entrada: n === entrada };
      });
    }

    return {
      siguiente: siguiente,
      responder: responder,
      deshacer: deshacer,
      forzarMatch: forzarMatch,
      ranking: ranking,
      quimica: quimica,
      razones: razones,
      recomendar: recomendar,
      ruta: ruta,
      nivelEntrada: nivelEntrada,
      condiciones: condiciones,
      perfil: function () { return st.perfil; },
      matches: function () { return st.matches.slice(); },
      interesadas: function () { return ids.filter(function (id) { return st.interesadas[id]; }); },
      puedeDeshacer: function () { return st.historial.length > 0; },
      pasos: function () { return st.historial.length; },
      swipes: function () { return st.swipes; },
      config: cfg
    };
  }

  return { crearMotor: crearMotor, porcentaje: porcentaje, AJUSTES: AJUSTES };
});
