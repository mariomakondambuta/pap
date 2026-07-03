const express = require('express');
const router = express.Router();
const { myEnrollments } = require('../controllers/enrollments.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/me', requireAuth, myEnrollments);

module.exports = router;
