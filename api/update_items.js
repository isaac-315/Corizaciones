// /api/update_item/[id].js
import mysql from 'mysql2/promise';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Solo se permite PUT' });
  }

  const id = req.query.id; // 👈 Vercel pasa los parámetros en req.query
  const { itm_descripcion, itm_precio } = req.body;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }
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
      'UPDATE items SET itm_descripcion = ?, itm_precio = ? WHERE itm_id = ?',
      [itm_descripcion, itm_precio, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Ítem no encontrado' });
    }

    res.json({ message: 'Ítem actualizado correctamente' });
  } catch (err) {
    console.error('❌ Error al actualizar:', err);
    res.status(500).json({ error: 'Error al actualizar ítem' });
  } finally {
    if (connection) await connection.end();
  }
}