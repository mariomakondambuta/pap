const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { signToken } = require('../utils/jwt');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeUser(user) {
  const { password_hash, ...rest } = user;
  return rest;
}

async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e password são obrigatórios.' });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: 'Email inválido.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'A password deve ter pelo menos 6 caracteres.' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Já existe uma conta com este email.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), passwordHash, 'user']
    );

    const [[user]] = await pool.query(
      'SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    const token = signToken({ id: user.id, role: user.role, name: user.name });
    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Erro no registo:', err);
    res.status(500).json({ error: 'Erro ao criar conta.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e password são obrigatórios.' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const token = signToken({ id: user.id, role: user.role, name: user.name });
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro ao iniciar sessão.' });
  }
}

async function me(req, res) {
  try {
    const [[user]] = await pool.query(
      'SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado.' });
    }
    res.json({ user });
  } catch (err) {
    console.error('Erro ao obter utilizador:', err);
    res.status(500).json({ error: 'Erro ao obter dados do utilizador.' });
  }
}

module.exports = { register, login, me };
