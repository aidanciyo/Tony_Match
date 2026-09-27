// Pruebas del motor y de los datos. Ejecutar con: npm test
const test = require('node:test');
const assert = require('node:assert/strict');

const datos = Object.assign({}, require('../js/datos.js'), require('../js/tarjetas.js'));
const { crearMotor, porcentaje, AJUSTES } = require('../js/motor.js');

const FAMILIAS = datos.FAMILIAS.map((f) => f.id);
const CICLOS = datos.CICLOS.map((c) => c.id);

// Generador pseudoaleatorio con semilla, para que las pruebas sean reproducibles.
function aleatorio(semilla) {
  let a = semilla >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pregunta(id) {
  return datos.TARJETAS.find((t) => t.id === id);
}

// Simula a alguien a quien le encanta la familia `fav` (y responde con algo de ruido).
function jugar(fav, semilla, opciones = {}) {
  const rng = aleatorio(semilla);
  const motor = crearMotor(datos, { rng });
  const gusto = (f) => (f && f[fav]) || 0;
  let t;
  let match = null;
  let servidas = 0;
  while (!match && (t = motor.siguiente()) && servidas < 100) {
    servidas++;
    let r;
    if (t.tipo === 'gusto' || t.tipo === 'perfil') {
      const g = gusto(t.f) + (rng() - 0.5) * (opciones.ruido || 0);
      r = { accion: g >= 2.5 ? 'super' : g >= 1 ? 'like' : 'nope' };
    } else if (t.tipo === 'versus') {
      r = { accion: gusto(t.a.f) >= gusto(t.b.f) ? 'a' : 'b' };
    } else if (t.tipo === 'pregunta') {
      if (t.campo === 'estudios') r = { opciones: [opciones.estudios || 'eso'] };
      else if (t.campo === 'edad') r = { opciones: [opciones.edad || '18-20'] };
      else if (t.campo === 'horario') r = { opciones: ['manana'] };
      else {
        const mejor = t.opciones.reduce((m, o) => (gusto(o.f) > gusto(m.f) ? o : m), t.opciones[0]);
        r = { opciones: [mejor.id] };
      }
    } else {
      r = { accion: 'like' };
    }
    match = motor.responder(t, r).match;
  }
  return { motor, match: match || motor.forzarMatch(), servidas };
}

test('los datos del mazo son coherentes', () => {
  const ids = new Set();
  for (const t of datos.TARJETAS) {
    assert.ok(!ids.has(t.id), `id repetido: ${t.id}`);
    ids.add(t.id);
    const mapas = [t.f, t.c];
    if (t.tipo === 'versus') mapas.push(t.a.f, t.a.c, t.b.f, t.b.c);
    if (t.tipo === 'pregunta') t.opciones.forEach((o) => mapas.push(o.f, o.c));
    for (const m of mapas.filter(Boolean)) {
      for (const k of Object.keys(m)) {
        assert.ok(FAMILIAS.includes(k) || CICLOS.includes(k), `${t.id} usa una clave desconocida: ${k}`);
      }
    }
    if (t.tipo === 'gusto') assert.ok(datos.CATEGORIAS[t.cat], `${t.id} tiene una categoría desconocida`);
    if (t.tipo === 'perfil') {
      const ciclo = datos.CICLOS.find((c) => c.id === t.ciclo);
      assert.ok(ciclo, `${t.id} apunta a un ciclo que no existe`);
      assert.equal(t.f[ciclo.familia], 3, `${t.id} debería sumar 3 a su familia`);
    }
  }
  for (const campo of ['estudios', 'horario', 'edad']) {
    assert.ok(datos.TARJETAS.some((t) => t.campo === campo && t.requerida), `falta la pregunta de ${campo}`);
  }
});

test('cada familia tiene ciclos y suficientes tarjetas que la representen', () => {
  for (const id of FAMILIAS) {
    assert.ok(datos.CICLOS.some((c) => c.familia === id), `${id} no tiene ciclos`);
    const fuertes = datos.TARJETAS.filter((t) => {
      const mapas = t.tipo === 'versus' ? [t.a.f, t.b.f] : [t.f];
      return mapas.some((m) => m && m[id] >= 2);
    });
    assert.ok(fuertes.length >= 8, `${id} solo tiene ${fuertes.length} tarjetas con peso fuerte`);
  }
  for (const c of datos.CICLOS) {
    assert.ok(FAMILIAS.includes(c.familia), `${c.id} tiene una familia desconocida`);
    assert.ok(datos.NIVELES[c.nivel], `${c.id} tiene un nivel desconocido`);
  }
});

test('cada familia puede ganar el match', () => {
  for (const fav of FAMILIAS) {
    for (let s = 1; s <= 15; s++) {
      const { match } = jugar(fav, s * 101 + fav.charCodeAt(0), { ruido: 1 });
      assert.equal(match.id, fav, `con semilla ${s} ganó ${match.id} en lugar de ${fav}`);
    }
  }
});

test('no hay match antes del mínimo de tarjetas ni sin las preguntas imprescindibles', () => {
  for (const fav of FAMILIAS) {
    const { motor, match } = jugar(fav, 7);
    assert.ok(motor.swipes() >= AJUSTES.minSwipes);
    assert.ok(!match.forzado);
    const perfil = motor.perfil();
    assert.ok(perfil.estudios && perfil.edad && perfil.horario.length);
  }
});

test('si ninguna familia destaca, el match se fuerza al llegar al máximo', () => {
  // Alguien a quien le gusta todo por igual: nunca hay una ganadora clara.
  const motor = crearMotor(datos, { rng: aleatorio(3) });
  const campos = { estudios: 'eso', edad: '18-20', horario: 'tarde', objetivo: 'explorar' };
  let match = null;
  let t;
  while (!match && (t = motor.siguiente())) {
    let r;
    if (t.tipo === 'versus') r = { accion: 'ambas' };
    else if (t.tipo === 'pregunta') r = { opciones: t.campo ? [campos[t.campo]] : t.opciones.map((o) => o.id) };
    else r = { accion: 'like' };
    match = motor.responder(t, r).match;
  }
  assert.ok(match && match.forzado);
  assert.equal(motor.swipes(), AJUSTES.maxSwipes);
});

test('siguiente() nunca repite tarjetas y el mazo acaba agotándose', () => {
  const motor = crearMotor(datos, { rng: aleatorio(1) });
  const vistas = new Set();
  let t;
  while ((t = motor.siguiente())) {
    assert.ok(!vistas.has(t.id), `tarjeta repetida: ${t.id}`);
    vistas.add(t.id);
  }
  assert.ok(vistas.size >= datos.TARJETAS.length);
});

test('deshacer deja el estado exactamente como estaba', () => {
  const rng = aleatorio(42);
  const motor = crearMotor(datos, { rng });
  for (let i = 0; i < 9; i++) {
    const t = motor.siguiente();
    if (t.tipo === 'pregunta') motor.responder(t, { opciones: [t.opciones[0].id] });
    else if (t.tipo === 'versus') motor.responder(t, { accion: 'ambas' });
    else motor.responder(t, { accion: i % 2 ? 'like' : 'nope' });
  }
  const antes = JSON.stringify({ r: motor.ranking(), p: motor.perfil(), q: motor.quimica(), s: motor.swipes() });
  const t = motor.siguiente();
  motor.responder(t, t.tipo === 'pregunta' ? { opciones: [t.opciones[1].id] } : { accion: 'super' });
  assert.notEqual(JSON.stringify({ r: motor.ranking(), p: motor.perfil(), q: motor.quimica(), s: motor.swipes() }), antes);
  assert.equal(motor.deshacer(), t);
  assert.equal(JSON.stringify({ r: motor.ranking(), p: motor.perfil(), q: motor.quimica(), s: motor.swipes() }), antes);
});

test('el acceso a los ciclos depende de tus estudios y tu edad', () => {
  const acceso = (estudios, edad, cicloId) => {
    const motor = crearMotor(datos, { rng: aleatorio(1) });
    motor.responder(pregunta('q-estudios'), { opciones: [estudios] });
    motor.responder(pregunta('q-edad'), { opciones: [edad] });
    const familia = datos.CICLOS.find((c) => c.id === cicloId).familia;
    return motor.recomendar(familia).find((r) => r.ciclo.id === cicloId).acceso.ok;
  };
  assert.equal(acceso('eso', '15-17', 'mam-carpinteria-gm'), true);
  assert.equal(acceso('eso', '15-17', 'mam-diseno'), false);
  assert.equal(acceso('eso', '15-17', 'mam-carpinteria-gb'), false);
  assert.equal(acceso('eso-no', '15-17', 'mam-carpinteria-gb'), true);
  assert.equal(acceso('eso-no', '15-17', 'mam-carpinteria-gm'), false);
  assert.equal(acceso('eso-no', '21+', 'mam-carpinteria-gb'), false);
  assert.equal(acceso('bach', '18-20', 'san-bucodental'), true);
  assert.equal(acceso('gm', '18-20', 'sea-coordinacion'), true);
  assert.equal(acceso('eso', '21+', 'hot-restaurante'), true);
  assert.equal(acceso('bach', '18-20', 'hot-restaurante'), false);
});

test('las recomendaciones empiezan por tu puerta de entrada', () => {
  const motor = crearMotor(datos, { rng: aleatorio(5) });
  motor.responder(pregunta('q-estudios'), { opciones: ['eso'] });
  motor.responder(pregunta('q-edad'), { opciones: ['15-17'] });
  motor.responder(pregunta('q-horario'), { opciones: ['semi'] });
  assert.equal(motor.nivelEntrada(), 'medio');
  assert.equal(motor.recomendar('ima')[0].ciclo.id, 'ima-electromecanico');
  const ruta = motor.ruta('ima');
  assert.deepEqual(ruta.map((p) => p.nivel), ['basico', 'medio', 'superior']);
  assert.equal(ruta.find((p) => p.entrada).nivel, 'medio');
  const infantil = motor.recomendar('ssc').find((r) => r.ciclo.id === 'ssc-infantil');
  assert.equal(infantil.modalidad.ok, true);
});

test('los motivos del match salen de lo que te ha gustado', () => {
  const { motor, match } = jugar('ima', 11);
  const razones = motor.razones(match.id, 4);
  assert.ok(razones.length > 0);
  razones.forEach((r) => assert.ok(r.peso > 0 && typeof r.texto === 'string'));
});

test('el porcentaje de compatibilidad está siempre entre 1 y 99', () => {
  for (const a of [-10, -1, 0, 0.2, 0.5, 1, 2, 10]) {
    const p = porcentaje(a);
    assert.ok(p >= 1 && p <= 99, `porcentaje(${a}) = ${p}`);
  }
  assert.ok(porcentaje(0.9) > porcentaje(0.3));
});
