const pool = require('../config/db');
const { splitAmount } = require('../utils/money');
const { isStripeConfigured, getStripeClient } = require('../utils/stripe');
const { getPlatformSettings } = require('./settings.controller');
const { grantAccess } = require('./enrollments.controller');

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

async function creditSeller(order) {
  const [[seller]] = await pool.query('SELECT stripe_account_id FROM users WHERE id = ?', [order.seller_id]);
  // Se o produtor tem conta Stripe Connect ligada, o valor já foi transferido
  // diretamente pela Stripe (destination charge) — não duplicar na carteira interna.
  if (seller?.stripe_account_id && order.payment_provider === 'stripe') return;

  await pool.query(
    `INSERT INTO wallet_ledger (user_id, type, amount_cents, order_id, description)
     VALUES (?, 'sale', ?, ?, ?)`,
    [order.seller_id, order.seller_net_cents, order.id, `Venda #${order.id}`]
  );
}

async function markOrderPaid(orderId, extra = {}) {
  const [[order]] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
  if (!order || order.status === 'paid') return order;

  await pool.query(
    `UPDATE orders SET status = 'paid', paid_at = NOW(), stripe_payment_intent_id = ? WHERE id = ?`,
    [extra.stripePaymentIntentId || order.stripe_payment_intent_id, orderId]
  );
  await grantAccess(order.buyer_id, order.product_id, 'purchase');

  const updatedOrder = { ...order, status: 'paid', payment_provider: extra.paymentProvider || order.payment_provider };
  await creditSeller(updatedOrder);
  return updatedOrder;
}

async function createCheckout(req, res) {
  try {
    const { product_id } = req.body;
    const [[product]] = await pool.query('SELECT * FROM products WHERE id = ?', [product_id]);
    if (!product || !product.published) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }
    if (product.price_cents <= 0) {
      return res.status(400).json({ error: 'Este produto é gratuito. Utilize o acesso gratuito em vez do checkout.' });
    }
    if (product.seller_id === req.user.id) {
      return res.status(400).json({ error: 'Não pode comprar o seu próprio produto.' });
    }

    const [[existingAccess]] = await pool.query(
      'SELECT id FROM enrollments WHERE user_id = ? AND product_id = ?',
      [req.user.id, product_id]
    );
    if (existingAccess) {
      return res.status(409).json({ error: 'Já tem acesso a este produto.' });
    }

    const [[pending]] = await pool.query(
      `SELECT * FROM orders WHERE buyer_id = ? AND product_id = ? AND status = 'pending' ORDER BY created_at DESC LIMIT 1`,
      [req.user.id, product_id]
    );

    const settings = await getPlatformSettings();
    const { platformFeeCents, sellerNetCents } = splitAmount(product.price_cents, Number(settings.commission_percent));

    let order = pending;
    if (!order) {
      const [result] = await pool.query(
        `INSERT INTO orders (buyer_id, product_id, seller_id, amount_cents, currency, platform_fee_cents, seller_net_cents, payment_provider)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.id,
          product_id,
          product.seller_id,
          product.price_cents,
          product.currency,
          platformFeeCents,
          sellerNetCents,
          isStripeConfigured() ? 'stripe' : 'simulated',
        ]
      );
      const [[created]] = await pool.query('SELECT * FROM orders WHERE id = ?', [result.insertId]);
      order = created;
    }

    if (!isStripeConfigured()) {
      return res.json({ orderId: order.id, simulated: true });
    }

    const stripe = getStripeClient();
    const [[seller]] = await pool.query('SELECT stripe_account_id FROM users WHERE id = ?', [product.seller_id]);

    const sessionParams = {
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: product.currency.toLowerCase(),
            product_data: { name: product.title },
            unit_amount: product.price_cents,
          },
          quantity: 1,
        },
      ],
      success_url: `${APP_URL}/checkout-sucesso.html?order=${order.id}`,
      cancel_url: `${APP_URL}/checkout.html?order=${order.id}`,
      customer_email: req.user.email,
      metadata: { order_id: String(order.id) },
    };

    if (seller?.stripe_account_id) {
      sessionParams.payment_intent_data = {
        application_fee_amount: platformFeeCents,
        transfer_data: { destination: seller.stripe_account_id },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    await pool.query('UPDATE orders SET stripe_session_id = ? WHERE id = ?', [session.id, order.id]);

    res.json({ orderId: order.id, simulated: false, checkoutUrl: session.url });
  } catch (err) {
    console.error('Erro ao criar checkout:', err);
    res.status(500).json({ error: 'Erro ao iniciar o pagamento.' });
  }
}

async function simulatePayment(req, res) {
  try {
    if (isStripeConfigured()) {
      return res.status(400).json({ error: 'A Stripe está ativa; utilize o checkout real.' });
    }
    const { id } = req.params;
    const [[order]] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (!order || order.buyer_id !== req.user.id) {
      return res.status(404).json({ error: 'Encomenda não encontrada.' });
    }
    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Esta encomenda já foi processada.' });
    }

    const paidOrder = await markOrderPaid(order.id, { paymentProvider: 'simulated' });
    res.json({ success: true, order: paidOrder });
  } catch (err) {
    console.error('Erro ao simular pagamento:', err);
    res.status(500).json({ error: 'Erro ao confirmar o pagamento.' });
  }
}

async function stripeWebhook(req, res) {
  const stripe = getStripeClient();
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } else {
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error('Assinatura do webhook Stripe inválida:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.order_id;
    if (orderId) {
      await markOrderPaid(orderId, {
        paymentProvider: 'stripe',
        stripePaymentIntentId: session.payment_intent,
      });
    }
  }

  res.json({ received: true });
}

async function getOrder(req, res) {
  try {
    const { id } = req.params;
    const [[order]] = await pool.query(
      `SELECT o.*, p.title AS product_title, p.thumbnail_url
       FROM orders o JOIN products p ON p.id = o.product_id WHERE o.id = ?`,
      [id]
    );
    if (!order) {
      return res.status(404).json({ error: 'Encomenda não encontrada.' });
    }
    const isParty = [order.buyer_id, order.seller_id].includes(req.user.id);
    if (!isParty && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão para ver esta encomenda.' });
    }
    res.json({ order, stripeEnabled: isStripeConfigured() });
  } catch (err) {
    console.error('Erro ao obter encomenda:', err);
    res.status(500).json({ error: 'Erro ao carregar encomenda.' });
  }
}

async function myPurchases(req, res) {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, p.title AS product_title, p.thumbnail_url
       FROM orders o JOIN products p ON p.id = o.product_id
       WHERE o.buyer_id = ? ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json({ orders });
  } catch (err) {
    console.error('Erro ao listar compras:', err);
    res.status(500).json({ error: 'Erro ao carregar compras.' });
  }
}

async function mySales(req, res) {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, p.title AS product_title, u.name AS buyer_name
       FROM orders o
       JOIN products p ON p.id = o.product_id
       JOIN users u ON u.id = o.buyer_id
       WHERE o.seller_id = ? ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json({ orders });
  } catch (err) {
    console.error('Erro ao listar vendas:', err);
    res.status(500).json({ error: 'Erro ao carregar vendas.' });
  }
}

module.exports = { createCheckout, simulatePayment, stripeWebhook, getOrder, myPurchases, mySales };
