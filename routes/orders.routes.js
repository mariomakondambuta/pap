const express = require('express');
const router = express.Router();
const ordersCtrl = require('../controllers/orders.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.post('/checkout', requireAuth, ordersCtrl.createCheckout);
router.post('/:id/simulate-pay', requireAuth, ordersCtrl.simulatePayment);
router.get('/me', requireAuth, ordersCtrl.myPurchases);
router.get('/sales/me', requireAuth, ordersCtrl.mySales);
router.get('/:id', requireAuth, ordersCtrl.getOrder);

module.exports = router;
