// /api/add_item.js
import mysql from 'mysql2/promise';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Solo se permite POST' });
  }

  const { itm_descripcion, itm_precio } = req.body;

  if (!itm_descripcion || itm_precio === undefined) {
    return res.status(400).json({ error: 'Faltan campos' });
  }

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    const [result] = await connection.execute(
      'INSERT INTO items (itm_descripcion, itm_precio) VALUES (?, ?)',
      [itm_descripcion, itm_precio]
    );

    res.status(201).json({
      message: 'Ítem creado correctamente',
      itm_id: result.insertId
    });
  } catch (err) {
    console.error('❌ Error al crear ítem:', err);
    res.status(500).json({ error: 'Error al crear ítem' });
  } finally {
    if (connection) await connection.end();
  }
}