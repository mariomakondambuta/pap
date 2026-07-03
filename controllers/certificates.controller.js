const pool = require('../config/db');
const { generateCertificateCode, renderCertificatePdf } = require('../utils/certificate');

async function markLessonComplete(req, res) {
  try {
    const { id: lessonId } = req.params;
    const [[lesson]] = await pool.query('SELECT * FROM lessons WHERE id = ?', [lessonId]);
    if (!lesson) {
      return res.status(404).json({ error: 'Aula não encontrada.' });
    }

    const [[enrollment]] = await pool.query(
      'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
      [req.user.id, lesson.course_id]
    );
    if (!enrollment) {
      return res.status(403).json({ error: 'Não está inscrito neste curso.' });
    }

    await pool.query(
      `INSERT INTO lesson_progress (user_id, lesson_id, completed, completed_at)
       VALUES (?, ?, 1, NOW())
       ON DUPLICATE KEY UPDATE completed = 1, completed_at = NOW()`,
      [req.user.id, lessonId]
    );

    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM lessons WHERE course_id = ?',
      [lesson.course_id]
    );
    const [[{ completed }]] = await pool.query(
      `SELECT COUNT(*) AS completed FROM lesson_progress lp
       JOIN lessons l ON l.id = lp.lesson_id
       WHERE lp.user_id = ? AND l.course_id = ? AND lp.completed = 1`,
      [req.user.id, lesson.course_id]
    );

    let certificate = null;
    if (total > 0 && completed >= total) {
      const [[existingCert]] = await pool.query(
        'SELECT * FROM certificates WHERE user_id = ? AND course_id = ?',
        [req.user.id, lesson.course_id]
      );
      if (existingCert) {
        certificate = existingCert;
      } else {
        const code = generateCertificateCode();
        await pool.query(
          'INSERT INTO certificates (user_id, course_id, certificate_code) VALUES (?, ?, ?)',
          [req.user.id, lesson.course_id, code]
        );
        const [[newCert]] = await pool.query('SELECT * FROM certificates WHERE certificate_code = ?', [code]);
        certificate = newCert;
      }
    }

    res.json({ success: true, progress: { completed, total }, certificate });
  } catch (err) {
    console.error('Erro ao concluir aula:', err);
    res.status(500).json({ error: 'Erro ao registar progresso.' });
  }
}

async function myCertificates(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT cert.certificate_code, cert.issued_at, c.id AS course_id, c.title AS course_title
       FROM certificates cert
       JOIN courses c ON c.id = cert.course_id
       WHERE cert.user_id = ?
       ORDER BY cert.issued_at DESC`,
      [req.user.id]
    );
    res.json({ certificates: rows });
  } catch (err) {
    console.error('Erro ao listar certificados:', err);
    res.status(500).json({ error: 'Erro ao carregar certificados.' });
  }
}

async function downloadCertificate(req, res) {
  try {
    const { code } = req.params;
    const [[cert]] = await pool.query(
      `SELECT cert.*, u.name AS student_name, c.title AS course_title
       FROM certificates cert
       JOIN users u ON u.id = cert.user_id
       JOIN courses c ON c.id = cert.course_id
       WHERE cert.certificate_code = ?`,
      [code]
    );
    if (!cert) {
      return res.status(404).json({ error: 'Certificado não encontrado.' });
    }
    if (cert.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão para aceder a este certificado.' });
    }

    renderCertificatePdf(
      {
        studentName: cert.student_name,
        courseTitle: cert.course_title,
        issuedAt: cert.issued_at,
        code: cert.certificate_code,
      },
      res
    );
  } catch (err) {
    console.error('Erro ao gerar certificado:', err);
    res.status(500).json({ error: 'Erro ao gerar certificado.' });
  }
}

async function verifyCertificate(req, res) {
  try {
    const { code } = req.params;
    const [[cert]] = await pool.query(
      `SELECT cert.certificate_code, cert.issued_at, u.name AS student_name, c.title AS course_title
       FROM certificates cert
       JOIN users u ON u.id = cert.user_id
       JOIN courses c ON c.id = cert.course_id
       WHERE cert.certificate_code = ?`,
      [code]
    );
    if (!cert) {
      return res.status(404).json({ valid: false, error: 'Certificado não encontrado.' });
    }
    res.json({ valid: true, certificate: cert });
  } catch (err) {
    console.error('Erro ao verificar certificado:', err);
    res.status(500).json({ error: 'Erro ao verificar certificado.' });
  }
}

module.exports = { markLessonComplete, myCertificates, downloadCertificate, verifyCertificate };
