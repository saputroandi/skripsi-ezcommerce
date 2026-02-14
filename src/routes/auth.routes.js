const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validation/auth.schema');
const auth = require('../middleware/auth');

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               name: { type: string }
 *     responses:
 *       200: { description: Registered }
 */
router.post('/register', validate(registerSchema), ctrl.register);
/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     responses:
 *       200: { description: Token }
 */
router.post('/login', validate(loginSchema), ctrl.login);

router.get('/me', auth(), ctrl.me);

module.exports = router;
