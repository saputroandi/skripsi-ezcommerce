const router = require('express').Router();
/**
 * @openapi
 * /api/articles:
 *   get:
 *     tags: [Articles]
 *     responses: { 200: { description: 'List articles' } }
 */
const ctrl = require('../controllers/article.controller');
const auth = require('../middleware/auth');

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', auth(['admin']), ctrl.create);
router.put('/:id', auth(['admin']), ctrl.update);
router.delete('/:id', auth(['admin']), ctrl.remove);

module.exports = router;
