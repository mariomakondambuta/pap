const pool = require('../config/db');

async function getStats(req, res) {
  try {
    const [[{ totalUsers }]] = await pool.query("SELECT COUNT(*) AS totalUsers FROM users WHERE role = 'user'");
    const [[{ totalProducts }]] = await pool.query('SELECT COUNT(*) AS totalProducts FROM products');
    const [[{ publishedProducts }]] = await pool.query(
      'SELECT COUNT(*) AS publishedProducts FROM products WHERE published = 1'
    );
    const [[{ totalSellers }]] = await pool.query('SELECT COUNT(DISTINCT seller_id) AS totalSellers FROM products');
    const [[{ totalEnrollments }]] = await pool.query('SELECT COUNT(*) AS totalEnrollments FROM enrollments');
    const [[{ totalCertificates }]] = await pool.query('SELECT COUNT(*) AS totalCertificates FROM certificates');
    const [[{ totalSales, totalRevenueCents, totalCommissionCents }]] = await pool.query(
      `SELECT COUNT(*) AS totalSales,
              COALESCE(SUM(amount_cents), 0) AS totalRevenueCents,
              COALESCE(SUM(platform_fee_cents), 0) AS totalCommissionCents
       FROM orders WHERE status = 'paid'`
    );
    const [[{ pendingWithdrawals, pendingWithdrawalsCents }]] = await pool.query(
      `SELECT COUNT(*) AS pendingWithdrawals, COALESCE(SUM(amount_cents), 0) AS pendingWithdrawalsCents
       FROM withdrawal_requests WHERE status = 'pending'`
    );

    const [recentSales] = await pool.query(
      `SELECT u.name AS buyer_name, s.name AS seller_name, p.title AS product_title, o.amount_cents, o.currency, o.paid_at
       FROM orders o
       JOIN users u ON u.id = o.buyer_id
       JOIN users s ON s.id = o.seller_id
       JOIN products p ON p.id = o.product_id
       WHERE o.status = 'paid'
       ORDER BY o.paid_at DESC LIMIT 8`
    );

    res.json({
      totalUsers,
      totalProducts,
      publishedProducts,
      totalSellers,
      totalEnrollments,
      totalCertificates,
      totalSales,
      totalRevenueCents,
      totalCommissionCents,
      pendingWithdrawals,
      pendingWithdrawalsCents,
      recentSales,
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
    if (!['admin', 'user'].includes(role)) {
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

async function listOrders(req, res) {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, p.title AS product_title, u.name AS buyer_name, s.name AS seller_name
       FROM orders o
       JOIN products p ON p.id = o.product_id
       JOIN users u ON u.id = o.buyer_id
       JOIN users s ON s.id = o.seller_id
       ORDER BY o.created_at DESC LIMIT 200`
    );
    res.json({ orders });
  } catch (err) {
    console.error('Erro ao listar transações:', err);
    res.status(500).json({ error: 'Erro ao carregar transações.' });
  }
}

async function listWithdrawals(req, res) {
  try {
    const [withdrawals] = await pool.query(
      `SELECT w.*, u.name AS user_name, u.email AS user_email, pa.method, pa.iban, pa.phone, pa.holder_name
       FROM withdrawal_requests w
       JOIN users u ON u.id = w.user_id
       LEFT JOIN payout_accounts pa ON pa.id = w.payout_account_id
       ORDER BY w.requested_at DESC`
    );
    res.json({ withdrawals });
  } catch (err) {
    console.error('Erro ao listar levantamentos:', err);
    res.status(500).json({ error: 'Erro ao carregar levantamentos.' });
  }
}

async function processWithdrawal(req, res) {
  try {
    const { id } = req.params;
    const { status, admin_note } = req.body;
    if (!['approved', 'paid', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Estado inválido.' });
    }

    const [[withdrawal]] = await pool.query('SELECT * FROM withdrawal_requests WHERE id = ?', [id]);
    if (!withdrawal) {
      return res.status(404).json({ error: 'Pedido de levantamento não encontrado.' });
    }

    await pool.query(
      'UPDATE withdrawal_requests SET status = ?, admin_note = ?, processed_at = NOW() WHERE id = ?',
      [status, admin_note || null, id]
    );

    if (status === 'rejected' && withdrawal.status !== 'rejected') {
      await pool.query(
        `INSERT INTO wallet_ledger (user_id, type, amount_cents, withdrawal_id, description)
         VALUES (?, 'reversal', ?, ?, ?)`,
        [withdrawal.user_id, withdrawal.amount_cents, withdrawal.id, `Levantamento #${withdrawal.id} rejeitado`]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao processar levantamento:', err);
    res.status(500).json({ error: 'Erro ao processar levantamento.' });
  }
}

module.exports = {
  getStats,
  listUsers,
  updateUserRole,
  deleteUser,
  listOrders,
  listWithdrawals,
  processWithdrawal,
};
