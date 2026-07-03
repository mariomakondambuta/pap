const pool = require('../config/db');

async function getStats(req, res) {
  try {
    const [[{ totalUsers }]] = await pool.query(
      "SELECT COUNT(*) AS totalUsers FROM users WHERE role = 'student'"
    );
    const [[{ totalCourses }]] = await pool.query('SELECT COUNT(*) AS totalCourses FROM courses');
    const [[{ publishedCourses }]] = await pool.query(
      'SELECT COUNT(*) AS publishedCourses FROM courses WHERE published = 1'
    );
    const [[{ totalEnrollments }]] = await pool.query('SELECT COUNT(*) AS totalEnrollments FROM enrollments');
    const [[{ totalCertificates }]] = await pool.query('SELECT COUNT(*) AS totalCertificates FROM certificates');

    const [recentEnrollments] = await pool.query(
      `SELECT u.name AS student_name, c.title AS course_title, e.enrolled_at
       FROM enrollments e
       JOIN users u ON u.id = e.user_id
       JOIN courses c ON c.id = e.course_id
       ORDER BY e.enrolled_at DESC LIMIT 8`
    );

    res.json({
      totalUsers,
      totalCourses,
      publishedCourses,
      totalEnrollments,
      totalCertificates,
      recentEnrollments,
    });
  } catch (err) {
    console.error('Erro ao obter estatísticas:', err);
    res.status(500).json({ error: 'Erro ao carregar estatísticas.' });
  }
}

async function listUsers(req, res) {
  try {
    const [users] = await pool.query(
      `SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC`
    );
    res.json({ users });
  } catch (err) {
    console.error('Erro ao listar utilizadores:', err);
    res.status(500).json({ error: 'Erro ao carregar utilizadores.' });
  }
}

async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['admin', 'student'].includes(role)) {
      return res.status(400).json({ error: 'Papel inválido.' });
    }
    if (Number(id) === req.user.id) {
      return res.status(400).json({ error: 'Não pode alterar o seu próprio papel.' });
    }
    const [result] = await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Utilizador não encontrado.' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao atualizar utilizador:', err);
    res.status(500).json({ error: 'Erro ao atualizar utilizador.' });
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    if (Number(id) === req.user.id) {
      return res.status(400).json({ error: 'Não pode eliminar a sua própria conta.' });
    }
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Utilizador não encontrado.' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao eliminar utilizador:', err);
    res.status(500).json({ error: 'Erro ao eliminar utilizador.' });
  }
}

module.exports = { getStats, listUsers, updateUserRole, deleteUser };
