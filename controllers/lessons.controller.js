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

async function addLesson(req, res) {
  try {
    const { courseId } = req.params;
    const { title, description, type, order_index, duration_minutes, content_url } = req.body;

    const [[course]] = await pool.query('SELECT id FROM courses WHERE id = ?', [courseId]);
    if (!course) {
      return res.status(404).json({ error: 'Curso não encontrado.' });
    }
    if (!title || !type) {
      return res.status(400).json({ error: 'Título e tipo da aula são obrigatórios.' });
    }
    if (!['video', 'pdf'].includes(type)) {
      return res.status(400).json({ error: 'Tipo de aula inválido.' });
    }

    let finalUrl = content_url;
    if (req.file) {
      finalUrl = publicUrlFor(req.file);
    }
    if (!finalUrl) {
      return res.status(400).json({ error: 'Envie um ficheiro ou indique um URL para o conteúdo da aula.' });
    }
    if (type === 'video' && !req.file && !isYouTubeUrl(finalUrl)) {
      return res.status(400).json({ error: 'Para vídeo, envie um ficheiro ou um link do YouTube.' });
    }

    const [result] = await pool.query(
      `INSERT INTO lessons (course_id, title, description, type, content_url, order_index, duration_minutes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [courseId, title.trim(), description || null, type, finalUrl, order_index || 0, duration_minutes || 0]
    );

    const [[lesson]] = await pool.query('SELECT * FROM lessons WHERE id = ?', [result.insertId]);
    res.status(201).json({ lesson });
  } catch (err) {
    console.error('Erro ao adicionar aula:', err);
    res.status(500).json({ error: 'Erro ao adicionar aula.' });
  }
}

async function updateLesson(req, res) {
  try {
    const { id } = req.params;
    const { title, description, type, order_index, duration_minutes, content_url } = req.body;

    const [[lesson]] = await pool.query('SELECT * FROM lessons WHERE id = ?', [id]);
    if (!lesson) {
      return res.status(404).json({ error: 'Aula não encontrada.' });
    }

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
    console.error('Erro ao atualizar aula:', err);
    res.status(500).json({ error: 'Erro ao atualizar aula.' });
  }
}

async function deleteLesson(req, res) {
  try {
    const { id } = req.params;
    const [[lesson]] = await pool.query('SELECT content_url FROM lessons WHERE id = ?', [id]);
    const [result] = await pool.query('DELETE FROM lessons WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Aula não encontrada.' });
    }
    removeLocalFileIfAny(lesson?.content_url);
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao eliminar aula:', err);
    res.status(500).json({ error: 'Erro ao eliminar aula.' });
  }
}

async function getLesson(req, res) {
  try {
    const { id } = req.params;
    const [[lesson]] = await pool.query(
      `SELECT l.*, c.title AS course_title FROM lessons l
       JOIN courses c ON c.id = l.course_id WHERE l.id = ?`,
      [id]
    );
    if (!lesson) {
      return res.status(404).json({ error: 'Aula não encontrada.' });
    }

    if (req.user.role !== 'admin') {
      const [[enrollment]] = await pool.query(
        'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
        [req.user.id, lesson.course_id]
      );
      if (!enrollment) {
        return res.status(403).json({ error: 'Precisa de se inscrever no curso para aceder a esta aula.' });
      }
    }

    const [siblings] = await pool.query(
      `SELECT id, title, order_index FROM lessons WHERE course_id = ? ORDER BY order_index ASC, id ASC`,
      [lesson.course_id]
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
    console.error('Erro ao obter aula:', err);
    res.status(500).json({ error: 'Erro ao carregar aula.' });
  }
}

module.exports = { addLesson, updateLesson, deleteLesson, getLesson };
