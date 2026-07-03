const express = require('express');
const router = express.Router();
const certificatesCtrl = require('../controllers/certificates.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/me', requireAuth, certificatesCtrl.myCertificates);
router.get('/verify/:code', certificatesCtrl.verifyCertificate);
router.get('/:code/download', requireAuth, certificatesCtrl.downloadCertificate);

module.exports = router;
