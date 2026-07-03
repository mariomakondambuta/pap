const express = require('express');
const router = express.Router();
const walletCtrl = require('../controllers/wallet.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.use(requireAuth);

router.get('/me', walletCtrl.getWallet);
router.get('/payout-accounts', walletCtrl.listPayoutAccounts);
router.post('/payout-accounts', walletCtrl.addPayoutAccount);
router.delete('/payout-accounts/:id', walletCtrl.deletePayoutAccount);
router.post('/withdrawals', walletCtrl.requestWithdrawal);
router.get('/withdrawals/me', walletCtrl.myWithdrawals);

module.exports = router;
