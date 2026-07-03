const pool = require('../config/db');

const MIN_WITHDRAWAL_CENTS = 1000; // 10.00

async function getBalance(userId) {
  const [[{ balance }]] = await pool.query(
    'SELECT COALESCE(SUM(amount_cents), 0) AS balance FROM wallet_ledger WHERE user_id = ?',
    [userId]
  );
  return balance;
}

async function getWallet(req, res) {
  try {
    const [[{ totalEarned }]] = await pool.query(
      "SELECT COALESCE(SUM(amount_cents), 0) AS totalEarned FROM wallet_ledger WHERE user_id = ? AND type = 'sale'",
      [req.user.id]
    );
    const balance = await getBalance(req.user.id);

    const [pendingWithdrawals] = await pool.query(
      "SELECT COALESCE(SUM(amount_cents), 0) AS pending FROM withdrawal_requests WHERE user_id = ? AND status = 'pending'",
      [req.user.id]
    );

    const [ledger] = await pool.query(
      `SELECT * FROM wallet_ledger WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
      [req.user.id]
    );

    res.json({
      balance_cents: balance,
      total_earned_cents: totalEarned,
      pending_withdrawals_cents: pendingWithdrawals[0].pending,
      ledger,
    });
  } catch (err) {
    console.error('Erro ao obter carteira:', err);
    res.status(500).json({ error: 'Erro ao carregar a carteira.' });
  }
}

async function listPayoutAccounts(req, res) {
  try {
    const [accounts] = await pool.query(
      'SELECT * FROM payout_accounts WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [req.user.id]
    );
    res.json({ accounts });
  } catch (err) {
    console.error('Erro ao listar contas de pagamento:', err);
    res.status(500).json({ error: 'Erro ao carregar contas de pagamento.' });
  }
}

async function addPayoutAccount(req, res) {
  try {
    const { method, holder_name, iban, phone } = req.body;
    if (!['iban', 'mbway'].includes(method)) {
      return res.status(400).json({ error: 'Método de pagamento inválido.' });
    }
    if (!holder_name) {
      return res.status(400).json({ error: 'Indique o nome do titular.' });
    }
    if (method === 'iban' && !iban) {
      return res.status(400).json({ error: 'Indique o IBAN.' });
    }
    if (method === 'mbway' && !phone) {
      return res.status(400).json({ error: 'Indique o número de telemóvel para MB WAY.' });
    }

    const [[{ count }]] = await pool.query(
      'SELECT COUNT(*) AS count FROM payout_accounts WHERE user_id = ?',
      [req.user.id]
    );

    const [result] = await pool.query(
      `INSERT INTO payout_accounts (user_id, method, holder_name, iban, phone, is_default)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, method, holder_name.trim(), iban || null, phone || null, count === 0 ? 1 : 0]
    );

    const [[account]] = await pool.query('SELECT * FROM payout_accounts WHERE id = ?', [result.insertId]);
    res.status(201).json({ account });
  } catch (err) {
    console.error('Erro ao adicionar conta de pagamento:', err);
    res.status(500).json({ error: 'Erro ao adicionar conta de pagamento.' });
  }
}

async function deletePayoutAccount(req, res) {
  try {
    const { id } = req.params;
    const [[account]] = await pool.query('SELECT * FROM payout_accounts WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!account) {
      return res.status(404).json({ error: 'Conta de pagamento não encontrada.' });
    }
    await pool.query('DELETE FROM payout_accounts WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao remover conta de pagamento:', err);
    res.status(500).json({ error: 'Erro ao remover conta de pagamento.' });
  }
}

async function requestWithdrawal(req, res) {
  try {
    const { amount_cents, payout_account_id } = req.body;
    const amount = Number(amount_cents);

    if (!amount || amount < MIN_WITHDRAWAL_CENTS) {
      return res.status(400).json({ error: `O valor mínimo de levantamento é de ${(MIN_WITHDRAWAL_CENTS / 100).toFixed(2)} €.` });
    }

    const [[account]] = await pool.query(
      'SELECT id FROM payout_accounts WHERE id = ? AND user_id = ?',
      [payout_account_id, req.user.id]
    );
    if (!account) {
      return res.status(400).json({ error: 'Escolha uma conta de pagamento válida.' });
    }

    const balance = await getBalance(req.user.id);
    if (amount > balance) {
      return res.status(400).json({ error: 'Saldo insuficiente para este levantamento.' });
    }

    const [result] = await pool.query(
      `INSERT INTO withdrawal_requests (user_id, amount_cents, payout_account_id) VALUES (?, ?, ?)`,
      [req.user.id, amount, payout_account_id]
    );

    await pool.query(
      `INSERT INTO wallet_ledger (user_id, type, amount_cents, withdrawal_id, description)
       VALUES (?, 'withdrawal', ?, ?, ?)`,
      [req.user.id, -amount, result.insertId, `Levantamento #${result.insertId}`]
    );

    const [[withdrawal]] = await pool.query('SELECT * FROM withdrawal_requests WHERE id = ?', [result.insertId]);
    res.status(201).json({ withdrawal });
  } catch (err) {
    console.error('Erro ao pedir levantamento:', err);
    res.status(500).json({ error: 'Erro ao pedir levantamento.' });
  }
}

async function myWithdrawals(req, res) {
  try {
    const [withdrawals] = await pool.query(
      `SELECT w.*, pa.method, pa.iban, pa.phone
       FROM withdrawal_requests w
       LEFT JOIN payout_accounts pa ON pa.id = w.payout_account_id
       WHERE w.user_id = ? ORDER BY w.requested_at DESC`,
      [req.user.id]
    );
    res.json({ withdrawals });
  } catch (err) {
    console.error('Erro ao listar levantamentos:', err);
    res.status(500).json({ error: 'Erro ao carregar levantamentos.' });
  }
}

module.exports = {
  getWallet,
  listPayoutAccounts,
  addPayoutAccount,
  deletePayoutAccount,
  requestWithdrawal,
  myWithdrawals,
  getBalance,
  MIN_WITHDRAWAL_CENTS,
};
