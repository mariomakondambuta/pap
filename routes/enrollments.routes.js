const express = require('express');
const router = express.Router();
const { myLibrary } = require('../controllers/enrollments.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/me', requireAuth, myLibrary);

module.exports = router;
