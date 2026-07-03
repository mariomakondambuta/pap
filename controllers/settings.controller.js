const pool = require('../config/db');
const { isStripeConfigured } = require('../utils/stripe');

async function getPlatformSettings() {
  const [[settings]] = await pool.query('SELECT * FROM platform_settings WHERE id = 1');
  return settings;
}

async function getSettings(req, res) {
  try {
    const settings = await getPlatformSettings();
    res.json({
      platform_name: settings.platform_name,
      commission_percent: Number(settings.commission_percent),
      currency: settings.currency,
      stripe_enabled: isStripeConfigured(),
    });
  } catch (err) {
    console.error('Erro ao obter definições:', err);
    res.status(500).json({ error: 'Erro ao carregar definições.' });
  }
}

async function updateSettings(req, res) {
  try {
    const { platform_name, commission_percent } = req.body;
    const percent = Number(commission_percent);
    if (Number.isNaN(percent) || percent < 0 || percent > 100) {
      return res.status(400).json({ error: 'A comissão deve ser um valor entre 0 e 100.' });
    }

    await pool.query(
      'UPDATE platform_settings SET platform_name = ?, commission_percent = ? WHERE id = 1',
      [platform_name?.trim() || 'EduWeb', percent]
    );

    const settings = await getPlatformSettings();
    res.json({ settings });
  } catch (err) {
    console.error('Erro ao atualizar definições:', err);
    res.status(500).json({ error: 'Erro ao atualizar definições.' });
  }
}

module.exports = { getSettings, updateSettings, getPlatformSettings };
