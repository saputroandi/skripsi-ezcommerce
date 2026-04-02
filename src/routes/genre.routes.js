const router = require('express').Router();
const ctrl = require('../controllers/genre.controller');
const auth = require('../middleware/auth');

/**
 * @openapi
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List categories
 *   post:
 *     tags: [Categories]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *     responses:
 *       200:
 *         description: Create category
 * /api/categories/{id}:
 *   delete:
 *     tags: [Categories]
 *     security: [ { bearerAuth: [] } ]
 *     parameters: [ { in: path, name: id, required: true, schema: { type: integer } } ]
 *     responses:
 *       200:
 *         description: Delete category
 */

router.get('/', ctrl.list);
router.post('/', auth('admin'), ctrl.create);
router.delete('/:id', auth('admin'), ctrl.remove);

module.exports = router;
