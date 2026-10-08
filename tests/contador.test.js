// Pruebas de la API del contador de visitas (contador/servidor.js).
// Cada prueba usa una carpeta temporal y un puerto libre; no toca los datos reales.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { crearServidor } = require('../contador/servidor.js');

const A = 'a'.repeat(32);
const B = '0123456789abcdef'.repeat(2);

function carpetaTemporal() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'contador-'));
}

function arrancar(opciones) {
  return new Promise((resolver) => {
    const servidor = crearServidor(opciones);
    servidor.listen(0, '127.0.0.1', () => {
      resolver({ servidor, base: `http://127.0.0.1:${servidor.address().port}/api/visitas` });
    });
  });
}

function parar(servidor) {
  servidor.closeAllConnections();
  return new Promise((resolver) => servidor.close(resolver));
}

function limpiar(carpeta) {
  fs.rmSync(carpeta, { recursive: true, force: true });
}

function post(url, cuerpo) {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo)
  });
}

async function total(url) {
  return (await (await fetch(url)).json()).personas;
}

function postPorPartes(url, partes) {
  return new Promise((resolver, rechazar) => {
    const req = http.request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked' }
    }, (res) => {
      res.resume();
      res.on('end', () => resolver(res.statusCode));
    });
    req.on('error', rechazar);
    for (const parte of partes) req.write(parte);
    req.end();
  });
}

test('cada navegador cuenta una sola vez aunque envíe su código varias veces', async () => {
  const carpeta = carpetaTemporal();
  const { servidor, base } = await arrancar({ carpetaDatos: carpeta });
  try {
    let r = await post(base, { id: A });
    assert.equal(r.status, 200);
    assert.deepEqual(await r.json(), { personas: 1, nueva: true });

    r = await post(base, { id: A });
    assert.deepEqual(await r.json(), { personas: 1, nueva: false });

    r = await post(base, { id: B });
    assert.deepEqual(await r.json(), { personas: 2, nueva: true });
  } finally {
    await parar(servidor);
    limpiar(carpeta);
  }
});

test('GET devuelve el total sin contar a quien lo consulta', async () => {
  const carpeta = carpetaTemporal();
  const { servidor, base } = await arrancar({ carpetaDatos: carpeta });
  try {
    assert.equal(await total(base), 0);
    await post(base, { id: A });
    assert.equal(await total(base), 1);
    assert.equal(await total(base), 1);
  } finally {
    await parar(servidor);
    limpiar(carpeta);
  }
});

test('los códigos sobreviven a un reinicio y se ignoran las líneas que no son códigos', async () => {
  const carpeta = carpetaTemporal();
  fs.writeFileSync(path.join(carpeta, 'visitas.txt'), `${A}\nbasura\n\n${B.toUpperCase()}\n`);
  let { servidor, base } = await arrancar({ carpetaDatos: carpeta });
  try {
    // Cuentan A y el código B en mayúsculas no (no es un código válido); «basura» tampoco.
    assert.equal(await total(base), 1);
    await post(base, { id: B });
    await parar(servidor);

    ({ servidor, base } = await arrancar({ carpetaDatos: carpeta }));
    assert.equal(await total(base), 2);
    assert.deepEqual(await (await post(base, { id: A })).json(), { personas: 2, nueva: false });
  } finally {
    await parar(servidor);
    limpiar(carpeta);
  }
});

test('rechaza identificadores que no son códigos válidos y no los cuenta', async () => {
  const carpeta = carpetaTemporal();
  const { servidor, base } = await arrancar({ carpetaDatos: carpeta });
  const invalidos = [
    '{"id":"hola"}',
    '{}',
    '{"id":42}',
    `{"id":"${A.toUpperCase()}"}`,
    `{"id":"${'a'.repeat(31)}"}`,
    'esto no es JSON',
    'null'
  ];
  try {
    for (const cuerpo of invalidos) {
      const r = await post(base, cuerpo);
      assert.equal(r.status, 400, cuerpo);
    }
    assert.equal(await total(base), 0);
  } finally {
    await parar(servidor);
    limpiar(carpeta);
  }
});

test('responde 404 a otras rutas y 405 a otros métodos', async () => {
  const carpeta = carpetaTemporal();
  const { servidor, base } = await arrancar({ carpetaDatos: carpeta });
  try {
    assert.equal((await fetch(base.replace('/api/visitas', '/otra'))).status, 404);
    const r = await fetch(base, { method: 'PUT', body: '{}' });
    assert.equal(r.status, 405);
    assert.equal(r.headers.get('allow'), 'GET, POST');
  } finally {
    await parar(servidor);
    limpiar(carpeta);
  }
});

test('rechaza cuerpos demasiado grandes, anunciados o no, sin guardar nada', async () => {
  const carpeta = carpetaTemporal();
  const { servidor, base } = await arrancar({ carpetaDatos: carpeta });
  try {
    const anunciado = await post(base, `{"id":"${'a'.repeat(2000)}"}`);
    assert.equal(anunciado.status, 413);

    const sinAnunciar = await postPorPartes(base, ['{"id":"', ...Array(20).fill('a'.repeat(100)), '"}']);
    assert.equal(sinAnunciar, 413);

    assert.equal(await total(base), 0);
  } finally {
    await parar(servidor);
    limpiar(carpeta);
  }
});

test('con ORIGEN_PERMITIDO responde a la comprobación previa del navegador', async () => {
  const origen = 'https://tudominio.es';
  const carpeta = carpetaTemporal();
  const { servidor, base } = await arrancar({ carpetaDatos: carpeta, origenPermitido: origen });
  try {
    const previa = await fetch(base, { method: 'OPTIONS' });
    assert.equal(previa.status, 204);
    assert.equal(previa.headers.get('access-control-allow-origin'), origen);
    assert.match(previa.headers.get('access-control-allow-methods'), /POST/);
    assert.equal(previa.headers.get('access-control-allow-headers'), 'Content-Type');

    const r = await post(base, { id: A });
    assert.equal(r.headers.get('access-control-allow-origin'), origen);
  } finally {
    await parar(servidor);
    limpiar(carpeta);
  }
});

test('sin ORIGEN_PERMITIDO no añade cabeceras CORS', async () => {
  const carpeta = carpetaTemporal();
  const { servidor, base } = await arrancar({ carpetaDatos: carpeta });
  try {
    const r = await post(base, { id: A });
    assert.equal(r.headers.get('access-control-allow-origin'), null);
  } finally {
    await parar(servidor);
    limpiar(carpeta);
  }
});
