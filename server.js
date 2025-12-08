const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const port = 3000;

// 👇 Middleware para leer JSON en las peticiones (obligatorio para PUT/POST)
app.use(express.json());

// 👇 Middleware para permitir CORS (¡importante para Live Server!)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// 👇 Conexión a tu base de datos MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'aSdF_010503',        // ← Tu contraseña
  database: 'cotizaciones_db'     // ← Tu nombre de base de datos
});

// Verificar conexión
db.connect(err => {
  if (err) {
    console.error('❌ Error al conectar a MySQL:', err);
    return;
  }
  console.log('✅ Conectado a la base de datos MySQL');
});

// 👇 Servir archivos estáticos (index.html, styles.css, script.js, etc.)
app.use(express.static(path.join(__dirname)));

// ───────────────────────────────────────
// RUTAS DE LA API
// ───────────────────────────────────────

// Obtener todos los ítems
app.get('/api/get_items', (req, res) => {
  // AHORA (ordenado por ID numérico)
  const query = 'SELECT itm_id, itm_descripcion, itm_precio FROM items ORDER BY itm_id ASC';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error en consulta SQL:', err);
      return res.status(500).json({ error: 'Error al obtener los ítems' });
    }
    res.json(results);
  });
});

// Actualizar un ítem por ID
app.put('/api/update_item/:id', (req, res) => {
  const { id } = req.params;
  const { itm_descripcion, itm_precio } = req.body;

  // Validación básica
  if (!itm_descripcion || itm_precio === undefined) {
    return res.status(400).json({ error: 'Faltan campos: itm_descripcion o itm_precio' });
  }

  const query = 'UPDATE items SET itm_descripcion = ?, itm_precio = ? WHERE itm_id = ?';
  db.query(query, [itm_descripcion, itm_precio, id], (err, result) => {
    if (err) {
      console.error('Error al actualizar:', err);
      return res.status(500).json({ error: 'No se pudo actualizar el ítem' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Ítem no encontrado' });
    }

    res.json({ message: 'Ítem actualizado correctamente' });
  });
});

// Crear un ítem nuevo
app.post('/api/add_item', (req, res) => {
  const { itm_descripcion, itm_precio } = req.body;

  if (!itm_descripcion || itm_precio === undefined) {
    return res.status(400).json({ error: 'Faltan campos: itm_descripcion o itm_precio' });
  }

  const query = 'INSERT INTO items (itm_descripcion, itm_precio) VALUES (?, ?)';
  db.query(query, [itm_descripcion, itm_precio], (err, result) => {
    if (err) {
      console.error('❌ Error al insertar ítem:', err);
      return res.status(500).json({ error: 'Error al crear ítem' });
    }

    res.json({
      message: 'Ítem creado correctamente',
      itm_id: result.insertId
    });
  });
});

// ───────────────────────────────────────
// INICIAR SERVIDOR
// ───────────────────────────────────────

app.listen(3000, "0.0.0.0", () => {
  console.log("Servidor escuchando en todas las interfaces en el puerto 3000");
});

