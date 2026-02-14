const router = require('express').Router();
const ctrl = require('../controllers/order.controller');
const uploadCtrl = require('../controllers/orderUpload.controller');
const adminCtrl = require('../controllers/orderAdmin.controller');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const orderSchema = require('../validation/order.schema');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'proofs');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const safeExt = ['.png', '.jpg', '.jpeg', '.webp', '.pdf'].includes(ext) ? ext : '';
    cb(null, `proof-${Date.now()}-${Math.random().toString(16).slice(2)}${safeExt}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/**
 * @openapi
 * /api/orders:
 *   post:
 *     tags: [Orders]
 *     security: [ { bearerAuth: [] } ]
 *     responses: { 200: { description: 'Order created' } }
 *   get:
 *     tags: [Orders]
 *     security: [ { bearerAuth: [] } ]
 *     responses: { 200: { description: 'List user orders' } }
 * /api/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     security: [ { bearerAuth: [] } ]
 *     parameters: [ { in: path, name: id, required: true, schema: { type: integer } } ]
 *     responses: { 200: { description: 'Invoice' } }
 * /api/orders/{id}/pay:
 *   post:
 *     tags: [Orders]
 *     security: [ { bearerAuth: [] } ]
 *     parameters: [ { in: path, name: id, required: true, schema: { type: integer } } ]
 *     responses: { 200: { description: 'Paid order' } }
 */
router.post('/', auth(), validate(orderSchema), ctrl.create);
router.get('/', auth(), ctrl.list);

// Upload payment proof (user/admin who owns the order)
router.post('/:id/payment-proof', auth(), upload.single('file'), uploadCtrl.uploadPaymentProof);

// Only admin can change status
router.post('/:id/pay', auth('admin'), ctrl.pay);
router.patch('/:id/status', auth('admin'), adminCtrl.updateStatus);

router.get('/:id', auth(), ctrl.invoice);

module.exports = router;
