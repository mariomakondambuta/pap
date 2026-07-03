const express = require('express');
const router = express.Router();
const lessonsCtrl = require('../controllers/lessons.controller');
const { markLessonComplete } = require('../controllers/certificates.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

router.get('/:id', requireAuth, lessonsCtrl.getLesson);
router.put('/:id', requireAuth, upload.single('file'), lessonsCtrl.updateLesson);
router.delete('/:id', requireAuth, lessonsCtrl.deleteLesson);
router.post('/:id/complete', requireAuth, markLessonComplete);

module.exports = router;
