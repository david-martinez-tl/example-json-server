# JSON Server usando ES Modules

Proyecto básico usando JSON Server con:

- ES Modules (`import`)
- Rutas personalizadas
- Middleware
- Validaciones
- Reescritura de rutas

---

# Requisitos

- Node.js 18+
- npm

---

# Instalación

```bash
npm install
```

---

# Ejecutar servidor

## Producción

```bash
npm start
```

## Desarrollo

```bash
npm run dev
```

---

# URL Base

```txt
http://localhost:3000
```

---

# Endpoints automáticos

## Obtener personajes

```http
GET /characters
```

---

## Obtener personaje por ID

```http
GET /characters/1
```

---

## Crear personaje

```http
POST /characters
```

Body:

```json
{
  "name": "Summer Smith",
  "status": "Alive",
  "species": "Human"
}
```

---

# Rutas personalizadas

---

## Health Check

```http
GET /health
```

---

## Personajes vivos

```http
GET /characters/alive
```

---

## Buscar personaje

```http
GET /characters/search?name=rick
```

---

# Reescritura de rutas

También puedes usar:

```http
GET /api/characters
```

---

# Estructura del proyecto

```txt
mi-json-server/
│
├── package.json
├── server.js
├── db.json
└── README.md
```

---

# Tecnologías utilizadas

- Node.js
- JSON Server
- ES Modules

---