const router = require('express').Router();
const ctrl = require('../controllers/voucher.controller');
const auth = require('../middleware/auth');

/**
 * @openapi
 * /api/vouchers:
 *   get:
 *     tags: [Vouchers]
 *     responses: { 200: { description: 'List vouchers' } }
 */
router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', auth('admin'), ctrl.create);
router.put('/:id', auth('admin'), ctrl.update);
router.delete('/:id', auth('admin'), ctrl.remove);

module.exports = router;
