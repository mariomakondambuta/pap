const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/admin.controller');
const { updateSettings } = require('../controllers/settings.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');

router.use(requireAuth, requireAdmin);

router.get('/stats', adminCtrl.getStats);
router.get('/users', adminCtrl.listUsers);
router.put('/users/:id/role', adminCtrl.updateUserRole);
router.delete('/users/:id', adminCtrl.deleteUser);

router.get('/orders', adminCtrl.listOrders);
router.get('/withdrawals', adminCtrl.listWithdrawals);
router.put('/withdrawals/:id', adminCtrl.processWithdrawal);

router.put('/settings', updateSettings);

module.exports = router;
