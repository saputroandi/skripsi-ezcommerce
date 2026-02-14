const router = require('express').Router();
const ctrl = require('../controllers/genre.controller');
const auth = require('../middleware/auth');

/**
 * @openapi
 * /api/genres:
 *   get:
 *     tags: [Genres]
 *     responses:
 *       200:
 *         description: List genres
 *   post:
 *     tags: [Genres]
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
 *         description: Create genre
 * /api/genres/{id}:
 *   delete:
 *     tags: [Genres]
 *     security: [ { bearerAuth: [] } ]
 *     parameters: [ { in: path, name: id, required: true, schema: { type: integer } } ]
 *     responses:
 *       200:
 *         description: Delete genre
 */

router.get('/', ctrl.list);
router.post('/', auth('admin'), ctrl.create);
router.delete('/:id', auth('admin'), ctrl.remove);

module.exports = router;
