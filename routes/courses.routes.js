const express = require('express');
const router = express.Router();
const coursesCtrl = require('../controllers/courses.controller');
const lessonsCtrl = require('../controllers/lessons.controller');
const { enroll } = require('../controllers/enrollments.controller');
const { requireAuth, requireAdmin, optionalAuth } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

router.get('/', coursesCtrl.listPublicCourses);
router.get('/admin/all', requireAuth, requireAdmin, coursesCtrl.listAllCoursesAdmin);
router.get('/:id', optionalAuth, coursesCtrl.getCourseById);

router.post('/', requireAuth, requireAdmin, coursesCtrl.createCourse);
router.put('/:id', requireAuth, requireAdmin, coursesCtrl.updateCourse);
router.delete('/:id', requireAuth, requireAdmin, coursesCtrl.deleteCourse);

router.post('/:id/enroll', requireAuth, enroll);

router.post(
  '/:courseId/lessons',
  requireAuth,
  requireAdmin,
  upload.single('file'),
  lessonsCtrl.addLesson
);

module.exports = router;
