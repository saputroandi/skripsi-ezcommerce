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
const { Order, Game, VoucherPackage, User, OrderItem } = require('../models');
const { Sequelize } = require('sequelize');
const adminGamePage = require('../controllers/adminGamePage.controller');
const adminVoucherPage = require('../controllers/adminVoucherPage.controller');
const { toCsv } = require('../utils/csv');

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
    const startDate = String(req.query.startDate || '').trim(); // YYYY-MM-DD
    const endDate = String(req.query.endDate || '').trim(); // YYYY-MM-DD

    const pageSize = 20;
    const page = Math.max(1, parseInt(req.query.page || '1', 10) || 1);

    const parseDateOnly = (s) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(s || ''))) return null;
      const [y, m, d] = String(s).split('-').map((n) => parseInt(n, 10));
      const dt = new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
      return Number.isNaN(dt.getTime()) ? null : dt;
    };

    const start = parseDateOnly(startDate);
    const endRaw = parseDateOnly(endDate);
    const end = endRaw
      ? new Date(endRaw.getFullYear(), endRaw.getMonth(), endRaw.getDate(), 23, 59, 59, 999)
      : null;

    // forgiving: if user swaps the date inputs
    let rangeStart = start;
    let rangeEnd = end;
    if (rangeStart && rangeEnd && rangeStart.getTime() > rangeEnd.getTime()) {
      const tmp = rangeStart;
      rangeStart = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), rangeEnd.getDate(), 0, 0, 0, 0);
      rangeEnd = new Date(tmp.getFullYear(), tmp.getMonth(), tmp.getDate(), 23, 59, 59, 999);
    }

    const baseQuery = {
      order: [['createdAt', 'DESC']],
      include: [
        { model: VoucherPackage, include: [Game] },
        { model: User, attributes: ['id', 'email'] },
        { model: OrderItem, include: [{ model: VoucherPackage, include: [Game] }] }
      ],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      distinct: true,
    };

    const whereClauses = [];
    if (q) {
      whereClauses.push({ transactionCode: { [Sequelize.Op.iLike]: `%${q}%` } });
    }
    if (rangeStart || rangeEnd) {
      const createdAt = {};
      if (rangeStart) createdAt[Sequelize.Op.gte] = rangeStart;
      if (rangeEnd) createdAt[Sequelize.Op.lte] = rangeEnd;
      whereClauses.push({ createdAt });
    }
    if (whereClauses.length) {
      baseQuery.where = { [Sequelize.Op.and]: whereClauses };
    }

    // Determine if DB schema has whatsapp/paymentProof columns
    const orderTableDesc = await Order.sequelize.getQueryInterface().describeTable('orders');
    const hasWhatsappColumn = !!orderTableDesc.whatsapp;
    const hasPaymentProofColumn = !!orderTableDesc.paymentProof || !!orderTableDesc.payment_proof;

    let orders;
    let totalCount;
    try {
      const result = await Order.findAndCountAll(baseQuery);
      orders = result.rows;
      totalCount = result.count;
    } catch (err) {
      const msg = String(err?.message || '');
      const attrExclude = [];
      if (msg.includes('whatsapp') && msg.includes('does not exist')) attrExclude.push('whatsapp');
      if (msg.includes('payment') && msg.includes('does not exist')) {
        // best effort: exclude both camel fields in model
        attrExclude.push('paymentProof', 'paymentProofUploadedAt');
      }

      if (attrExclude.length) {
        const result = await Order.findAndCountAll({
          ...baseQuery,
          attributes: { exclude: attrExclude },
        });
        orders = result.rows;
        totalCount = result.count;
      } else {
        throw err;
      }
    }

    const totalPages = Math.max(1, Math.ceil((totalCount || 0) / pageSize));

    if ((totalCount || 0) > 0 && page > totalPages) {
      const params = [];
      if (q) params.push('q=' + encodeURIComponent(q));
      if (startDate) params.push('startDate=' + encodeURIComponent(startDate));
      if (endDate) params.push('endDate=' + encodeURIComponent(endDate));
      if (totalPages !== 1) params.push('page=' + totalPages);
      return res.redirect('/admin/dashboard' + (params.length ? ('?' + params.join('&')) : ''));
    }

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      orders,
      totalCount: totalCount || 0,
      page,
      pageSize,
      totalPages,
      schemaWarning: !hasWhatsappColumn,
      paymentProofWarning: !hasPaymentProofColumn,
      q,
      startDate,
      endDate,
    });
  } catch (e) {
    next(e);
  }
});

// Download CSV report for admin dashboard transactions
router.get('/dashboard/report.csv', adminPageAuth, async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    const startDate = String(req.query.startDate || '').trim(); // YYYY-MM-DD
    const endDate = String(req.query.endDate || '').trim(); // YYYY-MM-DD

    const parseDateOnly = (s) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(s || ''))) return null;
      const [y, m, d] = String(s).split('-').map((n) => parseInt(n, 10));
      const dt = new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
      return Number.isNaN(dt.getTime()) ? null : dt;
    };

    const start = parseDateOnly(startDate);
    const endRaw = parseDateOnly(endDate);
    const end = endRaw
      ? new Date(endRaw.getFullYear(), endRaw.getMonth(), endRaw.getDate(), 23, 59, 59, 999)
      : null;

    let rangeStart = start;
    let rangeEnd = end;
    if (rangeStart && rangeEnd && rangeStart.getTime() > rangeEnd.getTime()) {
      const tmp = rangeStart;
      rangeStart = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), rangeEnd.getDate(), 0, 0, 0, 0);
      rangeEnd = new Date(tmp.getFullYear(), tmp.getMonth(), tmp.getDate(), 23, 59, 59, 999);
    }

    const baseQuery = {
      order: [['createdAt', 'DESC']],
      include: [
        { model: VoucherPackage, include: [Game] },
        { model: User, attributes: ['id', 'email'] },
        { model: OrderItem, include: [{ model: VoucherPackage, include: [Game] }] },
      ],
    };

    const whereClauses = [];
    if (q) {
      whereClauses.push({ transactionCode: { [Sequelize.Op.iLike]: `%${q}%` } });
    }
    if (rangeStart || rangeEnd) {
      const createdAt = {};
      if (rangeStart) createdAt[Sequelize.Op.gte] = rangeStart;
      if (rangeEnd) createdAt[Sequelize.Op.lte] = rangeEnd;
      whereClauses.push({ createdAt });
    }
    if (whereClauses.length) {
      baseQuery.where = { [Sequelize.Op.and]: whereClauses };
    }

    const orders = await Order.findAll(baseQuery);

    const headers = [
      { key: 'transactionCode', label: 'transaction_code' },
      { key: 'createdAt', label: 'created_at' },
      { key: 'userEmail', label: 'user_email' },
      { key: 'gameName', label: 'game' },
      { key: 'packageName', label: 'package' },
      { key: 'quantity', label: 'quantity' },
      { key: 'uid', label: 'uid' },
      { key: 'whatsapp', label: 'whatsapp' },
      { key: 'finalPrice', label: 'final_price' },
      { key: 'status', label: 'status' },
    ];

    const rows = (orders || []).map((o) => {
      const items = o.OrderItems || [];
      const totalQty = items.length
        ? items.reduce((sum, it) => sum + (it.quantity || 1), 0)
        : (o.quantity ?? 1);
      const primary = items[0];
      const gameName = primary?.VoucherPackage?.Game?.name || o.VoucherPackage?.Game?.name || '';
      const packageName = items.length > 1
        ? `${primary?.VoucherPackage?.name || ''} +${items.length - 1} item`
        : (primary?.VoucherPackage?.name || o.VoucherPackage?.name || '');
      return {
        transactionCode: o.transactionCode || `#${o.id}`,
        createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : '',
        userEmail: o.User?.email || '',
        gameName,
        packageName,
        quantity: totalQty,
        uid: o.uid || '',
        whatsapp: o.whatsapp || '',
        finalPrice: o.finalPrice ?? '',
        status: o.status || 'pending',
      };
    });

    const csv = toCsv(rows, headers);

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="transactions-${stamp}.csv"`);
    return res.status(200).send(csv);
  } catch (e) {
    next(e);
  }
});

// SSR Admin - Game management
router.get('/products', adminPageAuth, adminGamePage.listPage);
router.post('/products', adminPageAuth, uploadThumb.single('thumbnailFile'), adminGamePage.createGame);
router.post('/products/:id', adminPageAuth, uploadThumb.single('thumbnailFile'), adminGamePage.updateGame);
router.post('/products/:id/toggle', adminPageAuth, adminGamePage.softToggle);
router.post('/products/:id/delete', adminPageAuth, adminGamePage.deleteGame);

// Upload thumbnail for a game (admin-only)
router.post('/products/:id/thumbnail', adminPageAuth, uploadThumb.single('file'), thumbUploadCtrl.uploadThumbnail);

// SSR Admin - Voucher management (from game management page)
router.post('/products/:productId/variants', adminPageAuth, adminVoucherPage.createForGame);
router.post('/variants/:id/delete', adminPageAuth, adminVoucherPage.deleteVoucher);

module.exports = router;
