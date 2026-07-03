const pool = require('../config/db');

async function enroll(req, res) {
  try {
    const { id: courseId } = req.params;
    const [[course]] = await pool.query('SELECT id, published FROM courses WHERE id = ?', [courseId]);
    if (!course || !course.published) {
      return res.status(404).json({ error: 'Curso não encontrado.' });
    }

    const [[existing]] = await pool.query(
      'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
      [req.user.id, courseId]
    );
    if (existing) {
      return res.status(409).json({ error: 'Já está inscrito neste curso.' });
    }

    await pool.query('INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)', [req.user.id, courseId]);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Erro ao inscrever:', err);
    res.status(500).json({ error: 'Erro ao inscrever no curso.' });
  }
}

async function myEnrollments(req, res) {
  try {
    const [courses] = await pool.query(
      `SELECT c.id, c.title, c.thumbnail_url, c.category, c.level, e.enrolled_at,
              COUNT(DISTINCT l.id) AS total_lessons,
              COUNT(DISTINCT CASE WHEN lp.completed = 1 THEN lp.id END) AS completed_lessons,
              cert.certificate_code
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       LEFT JOIN lessons l ON l.course_id = c.id
       LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.user_id = e.user_id
       LEFT JOIN certificates cert ON cert.course_id = c.id AND cert.user_id = e.user_id
       WHERE e.user_id = ?
       GROUP BY c.id, e.enrolled_at, cert.certificate_code
       ORDER BY e.enrolled_at DESC`,
      [req.user.id]
    );

    const withProgress = courses.map((c) => ({
      ...c,
      progress_percent: c.total_lessons > 0 ? Math.round((c.completed_lessons / c.total_lessons) * 100) : 0,
    }));

    res.json({ courses: withProgress });
  } catch (err) {
    console.error('Erro ao listar inscrições:', err);
    res.status(500).json({ error: 'Erro ao carregar as suas inscrições.' });
  }
}

module.exports = { enroll, myEnrollments };
