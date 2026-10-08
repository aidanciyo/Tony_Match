#!/usr/bin/env node
/*
 * Contador de visitas únicas para «Haz Match con el CIFP Tony Gallardo».
 *
 * Sin dependencias: solo necesita Node.js 18 o superior. La primera vez, cada navegador
 * genera un código aleatorio y anónimo; aquí solo se cuentan los códigos distintos, que se
 * guardan en <DATOS>/visitas.txt, uno por línea. No se guarda la IP ni nada que identifique
 * a la persona.
 *
 * Uso:  node servidor.js
 *
 * Variables de entorno (todas opcionales):
 *   PORT              Puerto de escucha (3100).
 *   HOST              Dirección de escucha (127.0.0.1: solo accesible desde el propio servidor).
 *   DATOS             Carpeta donde se guarda visitas.txt (datos/, junto a este archivo).
 *   ORIGEN_PERMITIDO  Solo si la API está en otro dominio que la web, p. ej. https://tudominio.es
 */
'use strict';

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const RUTA = '/api/visitas';
const LIMITE_CUERPO = 512; // bytes: el cuerpo que envía la web mide unos 60
const CODIGO_VALIDO = /^[a-f0-9]{32}$/;

function cargarVisitas(fichero) {
  const visitas = new Set();
  let contenido = '';
  try {
    contenido = fs.readFileSync(fichero, 'utf8');
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
  for (const linea of contenido.split('\n')) {
    const codigo = linea.trim();
    if (CODIGO_VALIDO.test(codigo)) visitas.add(codigo);
  }
  return visitas;
}

function enviar(res, codigo, cuerpo, origenPermitido, cabeceras = {}) {
  res.writeHead(codigo, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...(origenPermitido ? { 'Access-Control-Allow-Origin': origenPermitido, Vary: 'Origin' } : {}),
    ...cabeceras
  });
  res.end(JSON.stringify(cuerpo));
}

// Lee todo el cuerpo (así la respuesta llega aunque el cliente siga enviando) y lo descarta si supera el límite.
function leerCuerpo(req, limite) {
  return new Promise((resolver, rechazar) => {
    const trozos = [];
    let recibido = 0;
    req.on('data', (trozo) => {
      recibido += trozo.length;
      if (recibido <= limite) trozos.push(trozo);
    });
    req.on('end', () => {
      if (recibido > limite) {
        rechazar(Object.assign(new Error('Cuerpo demasiado grande'), { codigo: 413 }));
      } else {
        resolver(Buffer.concat(trozos).toString('utf8'));
      }
    });
    req.on('error', rechazar);
  });
}

async function atender(req, res, { visitas, fichero, origenPermitido }) {
  const ruta = (req.url || '').split('?')[0];
  if (ruta !== RUTA) return enviar(res, 404, { error: 'No encontrado' }, origenPermitido);

  if (req.method === 'OPTIONS' && origenPermitido) {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': origenPermitido,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '600',
      Vary: 'Origin'
    });
    return res.end();
  }
  // GET solo consulta el total; no cuenta a quien lo pide.
  if (req.method === 'GET') return enviar(res, 200, { personas: visitas.size }, origenPermitido);
  if (req.method !== 'POST') {
    return enviar(res, 405, { error: 'Método no permitido' }, origenPermitido, { Allow: 'GET, POST' });
  }

  let datos;
  try {
    datos = JSON.parse(await leerCuerpo(req, LIMITE_CUERPO));
  } catch (err) {
    if (err.codigo === 413) return enviar(res, 413, { error: 'Petición demasiado grande' }, origenPermitido);
    return enviar(res, 400, { error: 'JSON no válido' }, origenPermitido);
  }
  const codigo = datos && typeof datos.id === 'string' ? datos.id : '';
  if (!CODIGO_VALIDO.test(codigo)) {
    return enviar(res, 400, { error: 'Identificador no válido' }, origenPermitido);
  }

  const nueva = !visitas.has(codigo);
  if (nueva) {
    try {
      fs.appendFileSync(fichero, codigo + '\n');
    } catch (err) {
      console.error('No se ha podido guardar la visita:', err.message);
      return enviar(res, 500, { error: 'No se ha podido guardar' }, origenPermitido);
    }
    visitas.add(codigo);
  }
  return enviar(res, 200, { personas: visitas.size, nueva }, origenPermitido);
}

function crearServidor({ carpetaDatos = path.join(__dirname, 'datos'), origenPermitido = '' } = {}) {
  fs.mkdirSync(carpetaDatos, { recursive: true });
  const fichero = path.join(carpetaDatos, 'visitas.txt');
  const visitas = cargarVisitas(fichero);
  return http.createServer((req, res) => {
    atender(req, res, { visitas, fichero, origenPermitido }).catch((err) => {
      console.error('Error atendiendo una petición:', err);
      if (!res.headersSent) enviar(res, 500, { error: 'Error interno' }, origenPermitido);
    });
  });
}

module.exports = { crearServidor };

if (require.main === module) {
  const puerto = Number(process.env.PORT) || 3100;
  const host = process.env.HOST || '127.0.0.1';
  const servidor = crearServidor({
    carpetaDatos: process.env.DATOS || path.join(__dirname, 'datos'),
    origenPermitido: process.env.ORIGEN_PERMITIDO || ''
  });
  servidor.listen(puerto, host, () => {
    console.log(`Contador de visitas escuchando en http://${host}:${puerto}${RUTA}`);
  });
}
