const pool = require('../config/db');

async function grantAccess(userId, productId, source = 'free') {
  await pool.query(
    `INSERT INTO enrollments (user_id, product_id, source) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE source = source`,
    [userId, productId, source]
  );
}

async function enrollFree(req, res) {
  try {
    const { id: productId } = req.params;
    const [[product]] = await pool.query('SELECT id, published, price_cents FROM products WHERE id = ?', [productId]);
    if (!product || !product.published) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }
    if (product.price_cents > 0) {
      return res.status(400).json({ error: 'Este produto é pago. Utilize o checkout para o adquirir.' });
    }

    const [[existing]] = await pool.query(
      'SELECT id FROM enrollments WHERE user_id = ? AND product_id = ?',
      [req.user.id, productId]
    );
    if (existing) {
      return res.status(409).json({ error: 'Já tem acesso a este produto.' });
    }

    await grantAccess(req.user.id, productId, 'free');
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Erro ao aceder ao produto:', err);
    res.status(500).json({ error: 'Erro ao aceder ao produto.' });
  }
}

async function myLibrary(req, res) {
  try {
    const [products] = await pool.query(
      `SELECT p.id, p.title, p.thumbnail_url, p.category, p.format, p.level, p.price_cents, p.currency,
              e.enrolled_at, e.source,
              COUNT(DISTINCT l.id) AS total_lessons,
              COUNT(DISTINCT CASE WHEN lp.completed = 1 THEN lp.id END) AS completed_lessons,
              cert.certificate_code
       FROM enrollments e
       JOIN products p ON p.id = e.product_id
       LEFT JOIN lessons l ON l.product_id = p.id
       LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.user_id = e.user_id
       LEFT JOIN certificates cert ON cert.product_id = p.id AND cert.user_id = e.user_id
       WHERE e.user_id = ?
       GROUP BY p.id, e.enrolled_at, e.source, cert.certificate_code
       ORDER BY e.enrolled_at DESC`,
      [req.user.id]
    );

    const withProgress = products.map((p) => ({
      ...p,
      progress_percent: p.total_lessons > 0 ? Math.round((p.completed_lessons / p.total_lessons) * 100) : 0,
    }));

    res.json({ products: withProgress });
  } catch (err) {
    console.error('Erro ao listar biblioteca:', err);
    res.status(500).json({ error: 'Erro ao carregar a sua biblioteca.' });
  }
}

module.exports = { enrollFree, myLibrary, grantAccess };
