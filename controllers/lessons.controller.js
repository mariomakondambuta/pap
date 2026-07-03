const fs = require('fs');
const path = require('path');
const pool = require('../config/db');
const { publicUrlFor } = require('../middleware/upload.middleware');

function isYouTubeUrl(url) {
  return /youtube\.com|youtu\.be/i.test(url);
}

function removeLocalFileIfAny(contentUrl) {
  if (!contentUrl || !contentUrl.startsWith('/uploads/')) return;
  const filePath = path.join(__dirname, '..', contentUrl);
  fs.unlink(filePath, () => {});
}

async function assertProductOwnerOrAdmin(productId, user) {
  const [[product]] = await pool.query('SELECT id, seller_id FROM products WHERE id = ?', [productId]);
  if (!product) return { error: 'Produto não encontrado.', status: 404 };
  if (product.seller_id !== user.id && user.role !== 'admin') {
    return { error: 'Sem permissão para gerir este produto.', status: 403 };
  }
  return { product };
}

async function addLesson(req, res) {
  try {
    const { productId } = req.params;
    const { title, description, type, order_index, duration_minutes, content_url } = req.body;

    const check = await assertProductOwnerOrAdmin(productId, req.user);
    if (check.error) return res.status(check.status).json({ error: check.error });

    if (!title || !type) {
      return res.status(400).json({ error: 'Título e tipo do conteúdo são obrigatórios.' });
    }
    if (!['video', 'pdf', 'file'].includes(type)) {
      return res.status(400).json({ error: 'Tipo de conteúdo inválido.' });
    }

    let finalUrl = content_url;
    if (req.file) {
      finalUrl = publicUrlFor(req.file);
    }
    if (!finalUrl) {
      return res.status(400).json({ error: 'Envie um ficheiro ou indique um URL para o conteúdo.' });
    }
    if (type === 'video' && !req.file && !isYouTubeUrl(finalUrl)) {
      return res.status(400).json({ error: 'Para vídeo, envie um ficheiro ou um link do YouTube.' });
    }

    const [result] = await pool.query(
      `INSERT INTO lessons (product_id, title, description, type, content_url, order_index, duration_minutes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [productId, title.trim(), description || null, type, finalUrl, order_index || 0, duration_minutes || 0]
    );

    const [[lesson]] = await pool.query('SELECT * FROM lessons WHERE id = ?', [result.insertId]);
    res.status(201).json({ lesson });
  } catch (err) {
    console.error('Erro ao adicionar conteúdo:', err);
    res.status(500).json({ error: 'Erro ao adicionar conteúdo.' });
  }
}

async function updateLesson(req, res) {
  try {
    const { id } = req.params;
    const { title, description, type, order_index, duration_minutes, content_url } = req.body;

    const [[lesson]] = await pool.query('SELECT * FROM lessons WHERE id = ?', [id]);
    if (!lesson) {
      return res.status(404).json({ error: 'Conteúdo não encontrado.' });
    }
    const check = await assertProductOwnerOrAdmin(lesson.product_id, req.user);
    if (check.error) return res.status(check.status).json({ error: check.error });

    let finalUrl = content_url || lesson.content_url;
    if (req.file) {
      finalUrl = publicUrlFor(req.file);
      removeLocalFileIfAny(lesson.content_url);
    }

    await pool.query(
      `UPDATE lessons SET title = ?, description = ?, type = ?, content_url = ?,
       order_index = ?, duration_minutes = ? WHERE id = ?`,
      [
        title?.trim() || lesson.title,
        description ?? lesson.description,
        type || lesson.type,
        finalUrl,
        order_index ?? lesson.order_index,
        duration_minutes ?? lesson.duration_minutes,
        id,
      ]
    );

    const [[updated]] = await pool.query('SELECT * FROM lessons WHERE id = ?', [id]);
    res.json({ lesson: updated });
  } catch (err) {
    console.error('Erro ao atualizar conteúdo:', err);
    res.status(500).json({ error: 'Erro ao atualizar conteúdo.' });
  }
}

async function deleteLesson(req, res) {
  try {
    const { id } = req.params;
    const [[lesson]] = await pool.query('SELECT * FROM lessons WHERE id = ?', [id]);
    if (!lesson) {
      return res.status(404).json({ error: 'Conteúdo não encontrado.' });
    }
    const check = await assertProductOwnerOrAdmin(lesson.product_id, req.user);
    if (check.error) return res.status(check.status).json({ error: check.error });

    await pool.query('DELETE FROM lessons WHERE id = ?', [id]);
    removeLocalFileIfAny(lesson.content_url);
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao eliminar conteúdo:', err);
    res.status(500).json({ error: 'Erro ao eliminar conteúdo.' });
  }
}

async function getLesson(req, res) {
  try {
    const { id } = req.params;
    const [[lesson]] = await pool.query(
      `SELECT l.*, p.title AS product_title, p.seller_id FROM lessons l
       JOIN products p ON p.id = l.product_id WHERE l.id = ?`,
      [id]
    );
    if (!lesson) {
      return res.status(404).json({ error: 'Conteúdo não encontrado.' });
    }

    const isOwnerOrAdmin = req.user.role === 'admin' || req.user.id === lesson.seller_id;
    if (!isOwnerOrAdmin) {
      const [[enrollment]] = await pool.query(
        'SELECT id FROM enrollments WHERE user_id = ? AND product_id = ?',
        [req.user.id, lesson.product_id]
      );
      if (!enrollment) {
        return res.status(403).json({ error: 'Precisa de aceder a este produto para ver este conteúdo.' });
      }
    }

    const [siblings] = await pool.query(
      `SELECT id, title, order_index FROM lessons WHERE product_id = ? ORDER BY order_index ASC, id ASC`,
      [lesson.product_id]
    );
    const index = siblings.findIndex((l) => l.id === lesson.id);
    const previousLesson = index > 0 ? siblings[index - 1] : null;
    const nextLesson = index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null;

    const [[progress]] = await pool.query(
      'SELECT completed FROM lesson_progress WHERE user_id = ? AND lesson_id = ?',
      [req.user.id, lesson.id]
    );

    res.json({
      lesson,
      completed: Boolean(progress?.completed),
      previousLesson,
      nextLesson,
      position: { index: index + 1, total: siblings.length },
    });
  } catch (err) {
    console.error('Erro ao obter conteúdo:', err);
    res.status(500).json({ error: 'Erro ao carregar conteúdo.' });
  }
}

module.exports = { addLesson, updateLesson, deleteLesson, getLesson };
