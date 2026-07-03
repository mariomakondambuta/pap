const express = require('express');
const router = express.Router();
const productsCtrl = require('../controllers/products.controller');
const lessonsCtrl = require('../controllers/lessons.controller');
const { enrollFree } = require('../controllers/enrollments.controller');
const { requireAuth, requireAdmin, optionalAuth } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

router.get('/', productsCtrl.listPublicProducts);
router.get('/mine', requireAuth, productsCtrl.listMyProducts);
router.get('/admin/all', requireAuth, requireAdmin, productsCtrl.listAllProductsAdmin);
router.get('/:id', optionalAuth, productsCtrl.getProductById);

router.post('/', requireAuth, productsCtrl.createProduct);
router.put('/:id', requireAuth, productsCtrl.updateProduct);
router.delete('/:id', requireAuth, productsCtrl.deleteProduct);

router.post('/:id/enroll', requireAuth, enrollFree);

router.post(
  '/:productId/lessons',
  requireAuth,
  upload.single('file'),
  lessonsCtrl.addLesson
);

module.exports = router;
