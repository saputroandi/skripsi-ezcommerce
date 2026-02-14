const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const { hash, compare } = require('../utils/password');

/**
 * @openapi
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required: [email, password, name]
 *       properties:
 *         email: { type: string }
 *         password: { type: string }
 *         name: { type: string }
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email: { type: string }
 *         password: { type: string }
 */

exports.register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: 'Email exists' });

    const roleUser = await Role.findOne({ where: { name: 'user' } });
    if (!roleUser) return res.status(500).json({ message: 'Role seed missing (user)' });

    const hashed = await hash(password);
    const user = await User.create({ email, password: hashed, name, roleId: roleUser.id });
    return res.json({ id: user.id, email: user.email });
  } catch (e) { next(e); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email }, include: [Role] });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const roleName = user.Role?.name || 'user';
    const token = jwt.sign(
      { id: user.id, role: roleName, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );
    return res.json({ token });
  } catch (e) { next(e); }
};

exports.me = async (req, res, next) => {
  try {
    res.json({ id: req.user.id, email: req.user.email, role: req.user.role });
  } catch (e) { next(e); }
};
