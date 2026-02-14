const router = require('express').Router();
/**
 * @openapi
 * /api/flash-sales:
 *   get:
 *     tags: [FlashSales]
 *     responses: { 200: { description: 'List flash sales' } }
 */
const ctrl = require('../controllers/flashsale.controller');
const auth = require('../middleware/auth');

router.get('/', ctrl.list);
router.post('/', auth('admin'), ctrl.create);
router.put('/:id', auth('admin'), ctrl.update);
router.delete('/:id', auth('admin'), ctrl.remove);

module.exports = router;
