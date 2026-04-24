# Nela – Galería de Fotos con Base de Datos

Página personal de **Nela** con un sistema completo de galería de fotos gestionado mediante una API REST con Node.js, Express y SQLite.

## Requisitos

- [Node.js](https://nodejs.org/) (versión LTS recomendada)

## Instalación

```bash
# 1. Entra en la carpeta del proyecto
cd WebIndividual

# 2. Instala las dependencias
npm install

# 3. Inicia el servidor
node server.js
```

Abre tu navegador en **http://localhost:3000**

## Funcionalidades

- 📷 Subir nuevas fotos de Nela con título y descripción
- 🗄️ Las fotos se almacenan en `img/` y sus datos en SQLite (`database.db`)
- 🖼️ Galería dinámica cargada desde la base de datos
- 🔍 Overlay con título y descripción al pasar el ratón
- 🗑️ Eliminar fotos (archivo + registro en BD)
- 💬 Sistema de comentarios persistente
- 📱 Diseño responsivo

## Estructura del proyecto

```
WebIndividual/
├── img/              → imágenes subidas
├── public/
│   └── script.js     → JavaScript del cliente
├── nela.html         → página principal
├── styles.css        → estilos
├── server.js         → servidor Node.js / API REST
├── package.json      → dependencias npm
└── database.db       → base de datos SQLite (se crea automáticamente)
```

## Endpoints de la API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/fotos` | Listar todas las fotos |
| POST | `/api/fotos` | Subir nueva foto (multipart/form-data) |
| DELETE | `/api/fotos/:id` | Eliminar foto por ID |
| GET | `/api/comentarios` | Listar comentarios |
| POST | `/api/comentarios` | Crear comentario |
