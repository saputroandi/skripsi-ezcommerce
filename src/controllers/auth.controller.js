const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { User, Role } = require('../models');
const { hash, compare } = require('../utils/password');

function signToken(user, roleName) {
  return jwt.sign(
    { id: user.id, role: roleName, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

function getGoogleClient(req) {
  const redirectUri = process.env.GOOGLE_REDIRECT_URI
    || `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );
}

function parseCookies(header) {
  const list = {};
  if (!header) return list;
  header.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const key = parts.shift()?.trim();
    if (!key) return;
    list[key] = decodeURIComponent(parts.join('='));
  });
  return list;
}

function safeRedirectPath(path) {
  if (!path || typeof path !== 'string') return '/';
  return path.startsWith('/') ? path : '/';
}

function renderAuthSuccess(res, token, redirectPath) {
  const target = safeRedirectPath(redirectPath);
  const html = `
<!doctype html>
<html>
  <head><meta charset="utf-8"><title>Login Berhasil</title></head>
  <body>
    <script>
      (function(){
        try {
          localStorage.setItem('token', ${JSON.stringify(token)});
          document.cookie = "token=" + encodeURIComponent(${JSON.stringify(token)}) + "; Path=/; Max-Age=" + (60*60*24);
        } catch (e) {}
        window.location.replace(${JSON.stringify(target)});
      })();
    </script>
  </body>
</html>`;
  return res.status(200).send(html);
}

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
    const token = signToken(user, roleName);
    res.setHeader('Set-Cookie', `token=${encodeURIComponent(token)}; Path=/; Max-Age=${60*60*24}`);
    return res.json({ token });
  } catch (e) { next(e); }
};

exports.me = async (req, res, next) => {
  try {
    res.json({ id: req.user.id, email: req.user.email, role: req.user.role });
  } catch (e) { next(e); }
};

exports.googleStart = async (req, res, next) => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(500).json({ message: 'Google OAuth env missing' });
    }
    const cookies = parseCookies(req.headers.cookie || '');
    if (cookies.token) {
      try {
        jwt.verify(cookies.token, process.env.JWT_SECRET);
        const redirect = safeRedirectPath(req.query.redirect);
        return res.redirect(redirect || '/');
      } catch {}
    }
    const client = getGoogleClient(req);
    const redirect = safeRedirectPath(req.query.redirect);
    const state = Buffer.from(JSON.stringify({ redirect })).toString('base64url');
    const url = client.generateAuthUrl({
      access_type: 'offline',
      scope: ['openid', 'email', 'profile'],
      prompt: 'select_account',
      state,
    });
    return res.redirect(url);
  } catch (e) { next(e); }
};

exports.googleCallback = async (req, res, next) => {
  try {
    const client = getGoogleClient(req);
    const { code, state } = req.query;
    if (!code) return res.status(400).json({ message: 'Missing code' });

    let redirect = '/';
    if (state) {
      try {
        const parsed = JSON.parse(Buffer.from(String(state), 'base64url').toString('utf-8'));
        redirect = safeRedirectPath(parsed.redirect);
      } catch {}
    }

    const { tokens } = await client.getToken(code);
    if (!tokens.id_token) return res.status(400).json({ message: 'Missing id_token' });

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload?.email;
    const name = payload?.name || (email ? email.split('@')[0] : 'User');
    const googleId = payload?.sub;
    if (!email) return res.status(400).json({ message: 'Email not available' });

    let user = await User.findOne({ where: { email }, include: [Role] });
    if (!user) {
      const roleUser = await Role.findOne({ where: { name: 'user' } });
      if (!roleUser) return res.status(500).json({ message: 'Role seed missing (user)' });
      const randomPass = await hash(`${Date.now()}-${Math.random()}`);
      user = await User.create({
        email,
        name,
        password: randomPass,
        roleId: roleUser.id,
        googleId,
      });
      user = await User.findOne({ where: { id: user.id }, include: [Role] });
    } else if (!user.googleId && googleId) {
      user.googleId = googleId;
      if (!user.name) user.name = name;
      await user.save();
    }

    const roleName = user.Role?.name || 'user';
    const token = signToken(user, roleName);
    return renderAuthSuccess(res, token, redirect);
  } catch (e) { next(e); }
};
