const router = require('express').Router();
/**
 * @openapi
 * /api/payments/simulate:
 *   post:
 *     tags: [Orders]
 *     security: [ { bearerAuth: [] } ]
 *     responses: { 200: { description: 'Payment simulated' } }
 */
const ctrl = require('../controllers/payment.controller');
const auth = require('../middleware/auth');

// Only admin can simulate payments (status changes)
router.post('/simulate', auth('admin'), ctrl.simulate);

module.exports = router;
