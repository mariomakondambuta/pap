const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/admin.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');

router.use(requireAuth, requireAdmin);

router.get('/stats', adminCtrl.getStats);
router.get('/users', adminCtrl.listUsers);
router.put('/users/:id/role', adminCtrl.updateUserRole);
router.delete('/users/:id', adminCtrl.deleteUser);

module.exports = router;
