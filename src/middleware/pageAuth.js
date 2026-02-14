const jwt = require('jsonwebtoken');

/**
 * SSR guard for logged-in pages.
 * Reads JWT from Authorization: Bearer <token> OR from cookie `token`.
 * Redirects to / when not authenticated.
 */
module.exports = (req, res, next) => {
  try {
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) token = authHeader.slice('Bearer '.length);

    if (!token) {
      const cookieHeader = req.headers.cookie || '';
      const m = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
      if (m) token = decodeURIComponent(m[1]);
    }

    if (!token) return res.redirect('/');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.redirect('/');
  }
};
