const pool = require('../config/db');

async function listPublicCourses(req, res) {
  try {
    const { search, category, level } = req.query;
    const conditions = ['c.published = 1'];
    const params = [];

    if (search) {
      conditions.push('(c.title LIKE ? OR c.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      conditions.push('c.category = ?');
      params.push(category);
    }
    if (level) {
      conditions.push('c.level = ?');
      params.push(level);
    }

    const [rows] = await pool.query(
      `SELECT c.id, c.title, c.description, c.category, c.level, c.thumbnail_url,
              c.instructor_name, c.created_at,
              COUNT(DISTINCT l.id) AS lesson_count,
              COUNT(DISTINCT e.id) AS student_count
       FROM courses c
       LEFT JOIN lessons l ON l.course_id = c.id
       LEFT JOIN enrollments e ON e.course_id = c.id
       WHERE ${conditions.join(' AND ')}
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
      params
    );

    res.json({ courses: rows });
  } catch (err) {
    console.error('Erro ao listar cursos:', err);
    res.status(500).json({ error: 'Erro ao carregar cursos.' });
  }
}

async function getCourseById(req, res) {
  try {
    const { id } = req.params;
    const [[course]] = await pool.query(
      `SELECT c.*, COUNT(DISTINCT e.id) AS student_count
       FROM courses c
       LEFT JOIN enrollments e ON e.course_id = c.id
       WHERE c.id = ?
       GROUP BY c.id`,
      [id]
    );

    if (!course || (!course.published && req.user?.role !== 'admin')) {
      return res.status(404).json({ error: 'Curso não encontrado.' });
    }

    const [lessons] = await pool.query(
      `SELECT id, title, description, type, order_index, duration_minutes
       FROM lessons WHERE course_id = ? ORDER BY order_index ASC, id ASC`,
      [id]
    );

    let isEnrolled = false;
    let progress = null;
    if (req.user) {
      const [[enrollment]] = await pool.query(
        'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
        [req.user.id, id]
      );
      isEnrolled = Boolean(enrollment);

      if (isEnrolled && lessons.length > 0) {
        const [completedRows] = await pool.query(
          `SELECT lp.lesson_id FROM lesson_progress lp
           JOIN lessons l ON l.id = lp.lesson_id
           WHERE lp.user_id = ? AND l.course_id = ? AND lp.completed = 1`,
          [req.user.id, id]
        );
        const completedIds = new Set(completedRows.map((r) => r.lesson_id));
        progress = {
          completed: completedIds.size,
          total: lessons.length,
          percent: Math.round((completedIds.size / lessons.length) * 100),
        };
        lessons.forEach((lesson) => {
          lesson.completed = completedIds.has(lesson.id);
        });
      }
    }

    res.json({ course, lessons, isEnrolled, progress });
  } catch (err) {
    console.error('Erro ao obter curso:', err);
    res.status(500).json({ error: 'Erro ao carregar curso.' });
  }
}

async function listAllCoursesAdmin(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, COUNT(DISTINCT l.id) AS lesson_count, COUNT(DISTINCT e.id) AS student_count
       FROM courses c
       LEFT JOIN lessons l ON l.course_id = c.id
       LEFT JOIN enrollments e ON e.course_id = c.id
       GROUP BY c.id
       ORDER BY c.created_at DESC`
    );
    res.json({ courses: rows });
  } catch (err) {
    console.error('Erro ao listar cursos (admin):', err);
    res.status(500).json({ error: 'Erro ao carregar cursos.' });
  }
}

async function createCourse(req, res) {
  try {
    const { title, description, category, level, thumbnail_url, instructor_name, published } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'O título do curso é obrigatório.' });
    }

    const [result] = await pool.query(
      `INSERT INTO courses (title, description, category, level, thumbnail_url, instructor_name, published, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        description || null,
        category || 'Geral',
        level || 'iniciante',
        thumbnail_url || null,
        instructor_name || null,
        published ? 1 : 0,
        req.user.id,
      ]
    );

    const [[course]] = await pool.query('SELECT * FROM courses WHERE id = ?', [result.insertId]);
    res.status(201).json({ course });
  } catch (err) {
    console.error('Erro ao criar curso:', err);
    res.status(500).json({ error: 'Erro ao criar curso.' });
  }
}

async function updateCourse(req, res) {
  try {
    const { id } = req.params;
    const { title, description, category, level, thumbnail_url, instructor_name, published } = req.body;

    const [[existing]] = await pool.query('SELECT id FROM courses WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Curso não encontrado.' });
    }

    await pool.query(
      `UPDATE courses SET title = ?, description = ?, category = ?, level = ?,
       thumbnail_url = ?, instructor_name = ?, published = ? WHERE id = ?`,
      [
        title?.trim(),
        description || null,
        category || 'Geral',
        level || 'iniciante',
        thumbnail_url || null,
        instructor_name || null,
        published ? 1 : 0,
        id,
      ]
    );

    const [[course]] = await pool.query('SELECT * FROM courses WHERE id = ?', [id]);
    res.json({ course });
  } catch (err) {
    console.error('Erro ao atualizar curso:', err);
    res.status(500).json({ error: 'Erro ao atualizar curso.' });
  }
}

async function deleteCourse(req, res) {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM courses WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Curso não encontrado.' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao eliminar curso:', err);
    res.status(500).json({ error: 'Erro ao eliminar curso.' });
  }
}

module.exports = {
  listPublicCourses,
  getCourseById,
  listAllCoursesAdmin,
  createCourse,
  updateCourse,
  deleteCourse,
};
