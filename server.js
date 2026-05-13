/**
 * ---------------------------------------------------------
 * Servidor JSON Server usando ES Modules
 * ---------------------------------------------------------
 *
 * Características:
 * - JSON Server
 * - ES Modules (import/export)
 * - Rutas personalizadas
 * - Middlewares
 * - Validaciones
 * - Logs
 *
 * ---------------------------------------------------------
 */

import jsonServer from 'json-server';

/**
 * ---------------------------------------------------------
 * Crea la instancia principal del servidor.
 * ---------------------------------------------------------
 *
 * @type {import('json-server').JsonServer}
 */
const server = jsonServer.create();

/**
 * ---------------------------------------------------------
 * Middlewares por defecto:
 * - logger
 * - cors
 * - no-cache
 * - static
 * ---------------------------------------------------------
 *
 * @type {Array<Function>}
 */
const middlewares = jsonServer.defaults();

/**
 * ---------------------------------------------------------
 * Router conectado al archivo db.json.
 * ---------------------------------------------------------
 *
 * @type {import('json-server').Router}
 */
const router = jsonServer.router('db.json');

/**
 * ---------------------------------------------------------
 * Puerto del servidor.
 * ---------------------------------------------------------
 *
 * @type {number}
 */
const PORT = 3000;

/**
 * ---------------------------------------------------------
 * Parser JSON para body requests.
 * ---------------------------------------------------------
 */
server.use(jsonServer.bodyParser);

/**
 * ---------------------------------------------------------
 * Activa middlewares por defecto.
 * ---------------------------------------------------------
 */
server.use(middlewares);

/**
 * ---------------------------------------------------------
 * Middleware personalizado de logs
 * ---------------------------------------------------------
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 *
 * @returns {void}
 */
server.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.url}`
  );

  next();
});

/**
 * ---------------------------------------------------------
 * Ruta personalizada:
 * Health Check
 * ---------------------------------------------------------
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 *
 * @returns {import('express').Response}
 */
server.get('/health', (req, res) => {
  return res.status(200).json({
    status: 'OK',
    message: 'Servidor funcionando correctamente'
  });
});

/**
 * ---------------------------------------------------------
 * Ruta personalizada:
 * Obtener personajes vivos
 * ---------------------------------------------------------
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 *
 * @returns {import('express').Response}
 */
server.get('/characters/alive', (req, res) => {
  /**
   * Acceso a base de datos interna.
   *
   * @type {import('lowdb').LowdbSync<any>}
   */
  const db = router.db;

  /**
   * Filtra personajes vivos.
   *
   * @type {Array<Object>}
   */
  const aliveCharacters = db
    .get('characters')
    .filter({ status: 'Alive' })
    .value();

  return res.status(200).json(aliveCharacters);
});

/**
 * ---------------------------------------------------------
 * Ruta personalizada:
 * Buscar personaje por nombre
 * ---------------------------------------------------------
 *
 * Ejemplo:
 * GET /characters/search?name=rick
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 *
 * @returns {import('express').Response}
 */
server.get('/characters/search', (req, res) => {
  /**
   * Obtiene query param.
   *
   * @type {string}
   */
  const searchName = req.query.name;

  /**
   * Validación básica.
   */
  if (!searchName) {
    return res.status(400).json({
      error: 'Debe enviar el parámetro name'
    });
  }

  /**
   * Base de datos interna.
   *
   * @type {import('lowdb').LowdbSync<any>}
   */
  const db = router.db;

  /**
   * Resultados encontrados.
   *
   * @type {Array<Object>}
   */
  const results = db
    .get('characters')
    .filter(character =>
      character.name
        .toLowerCase()
        .includes(searchName.toLowerCase())
    )
    .value();

  return res.status(200).json(results);
});

/**
 * ---------------------------------------------------------
 * Middleware de validación para POST
 * ---------------------------------------------------------
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 *
 * @returns {void | import('express').Response}
 */
server.post('/characters', (req, res, next) => {
  /**
   * Body recibido.
   *
   * @type {Object}
   */
  const body = req.body;

  /**
   * Valida campo obligatorio.
   */
  if (!body.name) {
    return res.status(400).json({
      error: 'El campo name es obligatorio'
    });
  }

  next();
});

/**
 * ---------------------------------------------------------
 * Reescritura de rutas
 * ---------------------------------------------------------
 */
server.use(
  jsonServer.rewriter({
    '/api/*': '/$1'
  })
);

/**
 * ---------------------------------------------------------
 * Conecta router automático REST
 * ---------------------------------------------------------
 */
server.use(router);

/**
 * ---------------------------------------------------------
 * Inicializa servidor
 * ---------------------------------------------------------
 *
 * @returns {void}
 */
server.listen(PORT, () => {
  console.log('====================================');
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
  console.log('====================================');
  console.log('');
  console.log('Endpoints disponibles:');
  console.log('');
  console.log(`GET    http://localhost:${PORT}/characters`);
  console.log(`GET    http://localhost:${PORT}/characters/1`);
  console.log(`GET    http://localhost:${PORT}/characters/alive`);
  console.log(
    `GET    http://localhost:${PORT}/characters/search?name=rick`
  );
  console.log(`POST   http://localhost:${PORT}/characters`);
  console.log(`GET    http://localhost:${PORT}/health`);
  console.log('');
  console.log('Ruta alternativa:');
  console.log(`GET    http://localhost:${PORT}/api/characters`);
  console.log('====================================');
});