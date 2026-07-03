const pool = require('../config/db');

function withComputedFields(product) {
  return {
    ...product,
    is_free: product.price_cents === 0,
  };
}

async function listPublicProducts(req, res) {
  try {
    const { search, category, format, price } = req.query;
    const conditions = ['p.published = 1'];
    const params = [];

    if (search) {
      conditions.push('(p.title LIKE ? OR p.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      conditions.push('p.category = ?');
      params.push(category);
    }
    if (format) {
      conditions.push('p.format = ?');
      params.push(format);
    }
    if (price === 'gratis') {
      conditions.push('p.price_cents = 0');
    } else if (price === 'pago') {
      conditions.push('p.price_cents > 0');
    }

    const [rows] = await pool.query(
      `SELECT p.id, p.title, p.description, p.category, p.format, p.level, p.price_cents, p.currency,
              p.thumbnail_url, p.created_at, u.name AS seller_name,
              COUNT(DISTINCT l.id) AS lesson_count,
              COUNT(DISTINCT e.id) AS student_count
       FROM products p
       JOIN users u ON u.id = p.seller_id
       LEFT JOIN lessons l ON l.product_id = p.id
       LEFT JOIN enrollments e ON e.product_id = p.id
       WHERE ${conditions.join(' AND ')}
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      params
    );

    res.json({ products: rows.map(withComputedFields) });
  } catch (err) {
    console.error('Erro ao listar produtos:', err);
    res.status(500).json({ error: 'Erro ao carregar produtos.' });
  }
}

async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const [[product]] = await pool.query(
      `SELECT p.*, u.name AS seller_name, u.bio AS seller_bio,
              COUNT(DISTINCT e.id) AS student_count
       FROM products p
       JOIN users u ON u.id = p.seller_id
       LEFT JOIN enrollments e ON e.product_id = p.id
       WHERE p.id = ?
       GROUP BY p.id`,
      [id]
    );

    const isOwner = req.user && product && req.user.id === product.seller_id;
    const isAdmin = req.user?.role === 'admin';
    if (!product || (!product.published && !isOwner && !isAdmin)) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }

    const [lessons] = await pool.query(
      `SELECT id, title, description, type, order_index, duration_minutes
       FROM lessons WHERE product_id = ? ORDER BY order_index ASC, id ASC`,
      [id]
    );

    let hasAccess = isOwner || isAdmin;
    let progress = null;
    let pendingOrderId = null;

    if (req.user) {
      const [[enrollment]] = await pool.query(
        'SELECT id FROM enrollments WHERE user_id = ? AND product_id = ?',
        [req.user.id, id]
      );
      if (enrollment) hasAccess = true;

      if (hasAccess && lessons.length > 0) {
        const [completedRows] = await pool.query(
          `SELECT lp.lesson_id FROM lesson_progress lp
           JOIN lessons l ON l.id = lp.lesson_id
           WHERE lp.user_id = ? AND l.product_id = ? AND lp.completed = 1`,
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

      if (!hasAccess && product.price_cents > 0) {
        const [[pendingOrder]] = await pool.query(
          `SELECT id FROM orders WHERE buyer_id = ? AND product_id = ? AND status = 'pending'
           ORDER BY created_at DESC LIMIT 1`,
          [req.user.id, id]
        );
        pendingOrderId = pendingOrder?.id || null;
      }
    }

    res.json({ product: withComputedFields(product), lessons, hasAccess, progress, pendingOrderId, isOwner });
  } catch (err) {
    console.error('Erro ao obter produto:', err);
    res.status(500).json({ error: 'Erro ao carregar produto.' });
  }
}

async function listMyProducts(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, COUNT(DISTINCT l.id) AS lesson_count, COUNT(DISTINCT e.id) AS student_count
       FROM products p
       LEFT JOIN lessons l ON l.product_id = p.id
       LEFT JOIN enrollments e ON e.product_id = p.id
       WHERE p.seller_id = ?
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json({ products: rows.map(withComputedFields) });
  } catch (err) {
    console.error('Erro ao listar os meus produtos:', err);
    res.status(500).json({ error: 'Erro ao carregar os seus produtos.' });
  }
}

async function listAllProductsAdmin(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, u.name AS seller_name, COUNT(DISTINCT l.id) AS lesson_count, COUNT(DISTINCT e.id) AS student_count
       FROM products p
       JOIN users u ON u.id = p.seller_id
       LEFT JOIN lessons l ON l.product_id = p.id
       LEFT JOIN enrollments e ON e.product_id = p.id
       GROUP BY p.id
       ORDER BY p.created_at DESC`
    );
    res.json({ products: rows.map(withComputedFields) });
  } catch (err) {
    console.error('Erro ao listar produtos (admin):', err);
    res.status(500).json({ error: 'Erro ao carregar produtos.' });
  }
}

const VALID_FORMATS = ['curso', 'ebook', 'planilha', 'template', 'pack', 'outro'];
const VALID_LEVELS = ['iniciante', 'intermedio', 'avancado'];

async function createProduct(req, res) {
  try {
    const { title, description, category, format, level, price, thumbnail_url, published } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'O título do produto é obrigatório.' });
    }
    const priceCents = Math.round(Number(price) * 100) || 0;
    if (priceCents < 0) {
      return res.status(400).json({ error: 'O preço não pode ser negativo.' });
    }

    const [result] = await pool.query(
      `INSERT INTO products (seller_id, title, description, category, format, level, price_cents, thumbnail_url, published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        title.trim(),
        description || null,
        category || 'Geral',
        VALID_FORMATS.includes(format) ? format : 'curso',
        VALID_LEVELS.includes(level) ? level : 'iniciante',
        priceCents,
        thumbnail_url || null,
        published ? 1 : 0,
      ]
    );

    const [[product]] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.status(201).json({ product: withComputedFields(product) });
  } catch (err) {
    console.error('Erro ao criar produto:', err);
    res.status(500).json({ error: 'Erro ao criar produto.' });
  }
}

async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { title, description, category, format, level, price, thumbnail_url, published } = req.body;

    const [[existing]] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }
    if (existing.seller_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão para editar este produto.' });
    }

    const priceCents = price !== undefined ? Math.round(Number(price) * 100) || 0 : existing.price_cents;

    await pool.query(
      `UPDATE products SET title = ?, description = ?, category = ?, format = ?, level = ?,
       price_cents = ?, thumbnail_url = ?, published = ? WHERE id = ?`,
      [
        title?.trim() || existing.title,
        description ?? existing.description,
        category || existing.category,
        VALID_FORMATS.includes(format) ? format : existing.format,
        VALID_LEVELS.includes(level) ? level : existing.level,
        priceCents,
        thumbnail_url ?? existing.thumbnail_url,
        published !== undefined ? (published ? 1 : 0) : existing.published,
        id,
      ]
    );

    const [[product]] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    res.json({ product: withComputedFields(product) });
  } catch (err) {
    console.error('Erro ao atualizar produto:', err);
    res.status(500).json({ error: 'Erro ao atualizar produto.' });
  }
}

async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const [[existing]] = await pool.query('SELECT seller_id FROM products WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }
    if (existing.seller_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão para eliminar este produto.' });
    }
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao eliminar produto:', err);
    res.status(500).json({ error: 'Erro ao eliminar produto.' });
  }
}

module.exports = {
  listPublicProducts,
  getProductById,
  listMyProducts,
  listAllProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
};
