const router = require('express').Router();
/**
 * @openapi
 * /api/products:
 *   get:
 *     tags: [Products]
 *     responses: { 200: { description: 'List products' } }
 *   post:
 *     tags: [Products]
 *     security: [ { bearerAuth: [] } ]
 *     responses: { 200: { description: 'Create product' } }
 */
const ctrl = require('../controllers/game.controller');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const gameSchema = require('../validation/game.schema');

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', auth('admin'), validate(gameSchema), ctrl.create);
router.put('/:id', auth('admin'), validate(gameSchema), ctrl.update);
router.delete('/:id', auth('admin'), ctrl.remove);

module.exports = router;
