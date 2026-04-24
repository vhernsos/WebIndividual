const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Ensure img/ folder exists
const imgDir = path.join(__dirname, 'img');
if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));   // serves nela.html, styles.css, etc.
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(imgDir));

// Multer – store uploaded photos in img/
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, imgDir),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        const ok = allowed.test(path.extname(file.originalname).toLowerCase())
                && allowed.test(file.mimetype);
        ok ? cb(null, true) : cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
    }
});

// ─── Base de datos ─────────────────────────────────────────────────────────────

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) console.error('Error abriendo BD:', err.message);
    else console.log('✅ Base de datos conectada');
});

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS fotos (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo        TEXT    NOT NULL,
            descripcion   TEXT,
            archivo       TEXT    NOT NULL,
            fecha_subida  DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS comentarios (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre     TEXT    NOT NULL,
            email      TEXT    NOT NULL,
            comentario TEXT    NOT NULL,
            fecha      DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
});

// ─── Rutas – Fotos ─────────────────────────────────────────────────────────────

// GET /api/fotos – listar todas las fotos
app.get('/api/fotos', (req, res) => {
    db.all('SELECT * FROM fotos ORDER BY fecha_subida DESC', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST /api/fotos – subir nueva foto
app.post('/api/fotos', upload.single('foto'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No se ha subido ningún archivo' });

    const { titulo, descripcion } = req.body;
    if (!titulo) return res.status(400).json({ error: 'El título es obligatorio' });

    const archivo = req.file.filename;

    db.run(
        'INSERT INTO fotos (titulo, descripcion, archivo) VALUES (?, ?, ?)',
        [titulo, descripcion || '', archivo],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                id: this.lastID,
                titulo,
                descripcion: descripcion || '',
                archivo,
                fecha_subida: new Date().toISOString()
            });
        }
    );
});

// DELETE /api/fotos/:id – eliminar foto
app.delete('/api/fotos/:id', (req, res) => {
    const { id } = req.params;

    db.get('SELECT archivo FROM fotos WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Foto no encontrada' });

        const filePath = path.join(imgDir, row.archivo);
        db.run('DELETE FROM fotos WHERE id = ?', [id], (err2) => {
            if (err2) return res.status(500).json({ error: err2.message });

            // Remove the file (ignore errors if already gone)
            fs.unlink(filePath, () => {});
            res.json({ mensaje: 'Foto eliminada correctamente' });
        });
    });
});

// ─── Rutas – Comentarios ───────────────────────────────────────────────────────

// GET /api/comentarios
app.get('/api/comentarios', (req, res) => {
    db.all('SELECT * FROM comentarios ORDER BY fecha DESC', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST /api/comentarios
app.post('/api/comentarios', (req, res) => {
    const { nombre, email, comentario } = req.body;
    if (!nombre || !email || !comentario) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    db.run(
        'INSERT INTO comentarios (nombre, email, comentario) VALUES (?, ?, ?)',
        [nombre, email, comentario],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID, nombre, email, comentario });
        }
    );
});

// ─── Arrancar servidor ─────────────────────────────────────────────────────────

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
