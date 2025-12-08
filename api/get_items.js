// Ejemplo: /api/get_items.js
import mysql from 'mysql2/promise'; // 👈 Usamos la versión "promise" para async/await

export default async function handler(req, res) {
  // Configurar CORS (igual que en tu server.js)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Si es preflight (OPTIONS), responder inmediatamente
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Solo permitimos método GET
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'aSdF_010503',
      database: process.env.DB_NAME || 'cotizaciones_db',
    });

    const [results] = await connection.execute(
      'SELECT itm_id, itm_descripcion, itm_precio FROM items ORDER BY itm_id ASC'
    );

    res.status(200).json(results);
  } catch (err) {
    console.error('❌ Error en get_items:', err);
    res.status(500).json({ error: 'Error al obtener los ítems' });
  } finally {
    if (connection) await connection.end();
  }
}