const router = require('express').Router();
/**
 * @openapi
 * /admin/orders:
 *   get:
 *     tags: [Orders]
 *     security: [ { bearerAuth: [] } ]
 *     responses: { 200: { description: 'List all orders (admin)' } }
 */
const auth = require('../middleware/auth');
const adminPageAuth = require('../middleware/adminPageAuth');
const { Order, Game, VoucherPackage, User } = require('../models');
const { Sequelize } = require('sequelize');
const adminGamePage = require('../controllers/adminGamePage.controller');
const adminVoucherPage = require('../controllers/adminVoucherPage.controller');

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const thumbUploadCtrl = require('../controllers/gameThumbnailUpload.controller');

const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'thumbnails');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const thumbStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const safeExt = ['.png', '.jpg', '.jpeg', '.webp'].includes(ext) ? ext : '';
    cb(null, `thumb-${Date.now()}-${Math.random().toString(16).slice(2)}${safeExt}`);
  }
});

const uploadThumb = multer({
  storage: thumbStorage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
});

router.get('/orders', auth('admin'), async (req,res,next)=>{ try { res.json(await Order.findAll()); } catch(e){ next(e); }});

// SSR Admin Dashboard (table orders)
router.get('/dashboard', adminPageAuth, async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();

    const baseQuery = {
      order: [['createdAt', 'DESC']],
      include: [
        { model: VoucherPackage, include: [Game] },
        { model: User, attributes: ['id', 'email'] }
      ]
    };

    if (q) {
      baseQuery.where = { transactionCode: { [Sequelize.Op.iLike]: `%${q}%` } };
    }

    // Determine if DB schema has whatsapp/paymentProof columns
    const orderTableDesc = await Order.sequelize.getQueryInterface().describeTable('orders');
    const hasWhatsappColumn = !!orderTableDesc.whatsapp;
    const hasPaymentProofColumn = !!orderTableDesc.paymentProof || !!orderTableDesc.payment_proof;

    let orders;
    try {
      orders = await Order.findAll(baseQuery);
    } catch (err) {
      const msg = String(err?.message || '');
      const attrExclude = [];
      if (msg.includes('whatsapp') && msg.includes('does not exist')) attrExclude.push('whatsapp');
      if (msg.includes('payment') && msg.includes('does not exist')) {
        // best effort: exclude both camel fields in model
        attrExclude.push('paymentProof', 'paymentProofUploadedAt');
      }

      if (attrExclude.length) {
        orders = await Order.findAll({
          ...baseQuery,
          attributes: { exclude: attrExclude }
        });
      } else {
        throw err;
      }
    }

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      orders,
      schemaWarning: !hasWhatsappColumn,
      paymentProofWarning: !hasPaymentProofColumn,
      q
    });
  } catch (e) {
    next(e);
  }
});

// SSR Admin - Game management
router.get('/games', adminPageAuth, adminGamePage.listPage);
router.post('/games', adminPageAuth, uploadThumb.single('thumbnailFile'), adminGamePage.createGame);
router.post('/games/:id', adminPageAuth, uploadThumb.single('thumbnailFile'), adminGamePage.updateGame);
router.post('/games/:id/toggle', adminPageAuth, adminGamePage.softToggle);
router.post('/games/:id/delete', adminPageAuth, adminGamePage.deleteGame);

// Upload thumbnail for a game (admin-only)
router.post('/games/:id/thumbnail', adminPageAuth, uploadThumb.single('file'), thumbUploadCtrl.uploadThumbnail);

// SSR Admin - Voucher management (from game management page)
router.post('/games/:gameId/vouchers', adminPageAuth, adminVoucherPage.createForGame);
router.post('/vouchers/:id/delete', adminPageAuth, adminVoucherPage.deleteVoucher);

module.exports = router;
