require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const productsRoutes = require('./routes/products.routes');
const lessonsRoutes = require('./routes/lessons.routes');
const enrollmentsRoutes = require('./routes/enrollments.routes');
const certificatesRoutes = require('./routes/certificates.routes');
const ordersRoutes = require('./routes/orders.routes');
const walletRoutes = require('./routes/wallet.routes');
const settingsRoutes = require('./routes/settings.routes');
const adminRoutes = require('./routes/admin.routes');
const { stripeWebhook } = require('./controllers/orders.controller');

const app = express();

app.use(cors());

// O webhook da Stripe precisa do corpo em bruto para verificar a assinatura,
// por isso é registado antes do parser JSON global.
app.post('/api/orders/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/enrollments', enrollmentsRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err && err.message) {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`EduWeb a correr em http://localhost:${PORT}`);
});
