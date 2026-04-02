const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { Game, VoucherPackage, Order, Genre, UserAddress, Cart, CartItem, OrderItem } = require('../models');
const { Sequelize } = require('sequelize');
const pageAuth = require('../middleware/pageAuth');

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

function getTokenFromReq(req) {
  const cookies = parseCookies(req.headers.cookie || '');
  return cookies.token || '';
}

async function renderProfilePage(req, res, options = {}) {
  const addresses = await UserAddress.findAll({
    where: { userId: req.user.id },
    order: [['isDefault', 'DESC'], ['id', 'DESC']]
  });
  res.render('profile', {
    title: 'Alamat',
    addresses,
    errors: options.errors || {},
    form: options.form || {},
    notice: options.notice || '',
    returnTo: options.returnTo || ''
  });
}

router.get('/', async (req,res)=>{
  const games = await Game.findAll({
    where: { isActive: true },
    include: [
      // only show games that have at least 1 voucher package
      { model: VoucherPackage, required: true, attributes: [] },
      { model: Genre, through: { attributes: [] } }
    ]
  });
  res.render('index', { games });
});

router.get('/products', async (req,res)=>{
  const games = await Game.findAll({
    where: { isActive: true },
    include: [
      { model: VoucherPackage, required: true, attributes: [] },
      { model: Genre, through: { attributes: [] } }
    ]
  });
  res.render('games', { games });
});

router.get('/products/:id/buy', async (req,res)=>{
  const game = await Game.findOne({
    where: { id: req.params.id, isActive: true },
    include: [
      // required: true => prevent direct access to buy page when no packages
      { model: VoucherPackage, required: true },
      { model: Genre, through: { attributes: [] } }
    ]
  });
  if(!game) return res.status(404).send('Not found');
  res.render('buy', { game });
  // Note: Swagger documentation for this route is not necessary as it is server-side rendered (SSR).
});

router.get('/checkout', pageAuth, async (req, res, next) => {
  try {
    const isDirect = ['1', 'true', 'yes'].includes(String(req.query.direct || '').toLowerCase());
    const rawItemIds = req.query.itemIds;
    const itemIds = (Array.isArray(rawItemIds) ? rawItemIds : typeof rawItemIds === 'string' ? rawItemIds.split(',') : [])
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id));
    const hasItemFilter = itemIds.length > 0;

    const [addresses, cart] = await Promise.all([
      UserAddress.findAll({ where: { userId: req.user.id }, order: [['isDefault', 'DESC'], ['id', 'DESC']] }),
      Cart.findOne({ where: { userId: req.user.id } })
    ]);

    if (!addresses.length) {
      const returnUrl = encodeURIComponent(req.originalUrl || '/checkout');
      return res.redirect(`/profile?from=checkout&return=${returnUrl}`);
    }

    if (isDirect) {
      const voucherPackageId = Number(req.query.voucherPackageId);
      const quantity = Math.min(999, Math.max(1, parseInt(req.query.quantity, 10) || 1));
      if (!Number.isFinite(voucherPackageId)) return res.redirect('/products');

      const voucherPackage = await VoucherPackage.findByPk(voucherPackageId, { include: [Game] });
      if (!voucherPackage || !voucherPackage.Game) return res.redirect('/products');

      const uidRaw = String(req.query.uid || '').trim();
      const uid = uidRaw || [voucherPackage.Game?.name, voucherPackage.name].filter(Boolean).join(' ');
      const totalPrice = Number(voucherPackage.price) * quantity;
      const items = [{ VoucherPackage: voucherPackage, quantity }];

      return res.render('checkout', {
        title: 'Checkout',
        items,
        totalPrice,
        addresses,
        returnTo: req.originalUrl || '/checkout',
        direct: true,
        directPayload: { voucherPackageId, quantity, uid },
        selectedItemIds: []
      });
    }

    const items = cart
      ? await CartItem.findAll({
          where: hasItemFilter ? { cartId: cart.id, id: itemIds } : { cartId: cart.id },
          include: [{ model: VoucherPackage, include: [Game] }],
          order: [['id', 'ASC']]
        })
      : [];

    if (!items.length) return res.redirect('/cart');

    const totalPrice = items.reduce((sum, item) => {
      const price = Number(item.VoucherPackage?.price) || 0;
      return sum + price * (item.quantity || 1);
    }, 0);

    res.render('checkout', {
      title: 'Checkout',
      items,
      totalPrice,
      addresses,
      returnTo: req.originalUrl || '/checkout',
      direct: false,
      directPayload: null,
      selectedItemIds: hasItemFilter ? itemIds : []
    });
  } catch (e) {
    next(e);
  }
});

router.get('/cart', pageAuth, async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    const items = cart
      ? await CartItem.findAll({
          where: { cartId: cart.id },
          include: [{ model: VoucherPackage, include: [Game] }],
          order: [['id', 'DESC']]
        })
      : [];

    const totalPrice = items.reduce((sum, item) => {
      const price = Number(item.VoucherPackage?.price) || 0;
      return sum + price * (item.quantity || 1);
    }, 0);

    res.render('cart', {
      title: 'Keranjang',
      items,
      totalPrice
    });
  } catch (e) {
    next(e);
  }
});

router.get('/login', (req, res) => {
  const token = getTokenFromReq(req);
  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      return res.redirect('/');
    } catch {}
  }
  const redirect = String(req.query.redirect || '').trim();
  res.render('login', { redirect });
});

router.get('/profile', pageAuth, async (req, res, next) => {
  try {
    const notice = req.query.from === 'checkout'
      ? 'Tambahkan alamat terlebih dahulu sebelum checkout.'
      : '';
    const returnTo = typeof req.query.return === 'string' ? req.query.return : '';
    await renderProfilePage(req, res, { notice, returnTo });
  } catch (e) {
    next(e);
  }
});

router.post('/profile/addresses', pageAuth, async (req, res, next) => {
  try {
    const recipientName = String(req.body.recipientName || '').trim();
    const contactNumber = String(req.body.contactNumber || '').trim().replace(/\s+/g, '');
    const label = String(req.body.label || '').trim();
    const address = String(req.body.address || '').trim();
    const city = String(req.body.city || '').trim();
    const postalCode = String(req.body.postalCode || '').trim();
    const notes = String(req.body.notes || '').trim();
    const returnTo = String(req.body.returnTo || '').trim();
    const errors = {};
    if (!recipientName) errors.recipientName = 'Nama penerima wajib diisi';
    if (!address) errors.address = 'Alamat wajib diisi';
    if (contactNumber && !/^\+?\d{9,15}$/.test(contactNumber)) {
      errors.contactNumber = 'Format nomor tidak valid';
    }
    if (Object.keys(errors).length) {
      res.status(400);
      return renderProfilePage(req, res, {
        errors,
        form: {
          addressRecipientName: recipientName,
          addressContactNumber: contactNumber,
          addressLabel: label,
          addressCity: city,
          addressPostalCode: postalCode,
          addressNotes: notes,
          addressText: address,
        },
        returnTo,
      });
    }
    const existingDefault = await UserAddress.findOne({
      where: { userId: req.user.id, isDefault: true }
    });
    await UserAddress.create({
      userId: req.user.id,
      recipientName,
      isDefault: !existingDefault,
      contactNumber: contactNumber || null,
      label: label || null,
      address,
      city: city || null,
      postalCode: postalCode || null,
      notes: notes || null,
    });
    if (returnTo && returnTo.startsWith('/')) return res.redirect(returnTo);
    res.redirect('/profile');
  } catch (e) {
    next(e);
  }
});

router.post('/profile/addresses/:id/update', pageAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).send('Invalid id');
    const addressRecord = await UserAddress.findOne({ where: { id, userId: req.user.id } });
    if (!addressRecord) return res.status(404).send('Not found');

    const recipientName = String(req.body.recipientName || '').trim();
    const contactNumber = String(req.body.contactNumber || '').trim().replace(/\s+/g, '');
    const label = String(req.body.label || '').trim();
    const address = String(req.body.address || '').trim();
    const city = String(req.body.city || '').trim();
    const postalCode = String(req.body.postalCode || '').trim();
    const notes = String(req.body.notes || '').trim();
    const returnTo = String(req.body.returnTo || '').trim();
    const errors = {};
    if (!recipientName) errors.recipientName = 'Nama penerima wajib diisi';
    if (!address) errors.address = 'Alamat wajib diisi';
    if (contactNumber && !/^\+?\d{9,15}$/.test(contactNumber)) {
      errors.contactNumber = 'Format nomor tidak valid';
    }
    if (Object.keys(errors).length) {
      res.status(400);
      return renderProfilePage(req, res, {
        errors,
        form: {
          addressId: id,
          addressRecipientName: recipientName,
          addressContactNumber: contactNumber,
          addressLabel: label,
          addressCity: city,
          addressPostalCode: postalCode,
          addressNotes: notes,
          addressText: address,
        },
        returnTo,
      });
    }

    addressRecord.recipientName = recipientName;
    addressRecord.contactNumber = contactNumber || null;
    addressRecord.label = label || null;
    addressRecord.address = address;
    addressRecord.city = city || null;
    addressRecord.postalCode = postalCode || null;
    addressRecord.notes = notes || null;
    await addressRecord.save();

    if (returnTo && returnTo.startsWith('/')) return res.redirect(returnTo);
    res.redirect('/profile');
  } catch (e) {
    next(e);
  }
});

router.post('/profile/addresses/:id/default', pageAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).send('Invalid id');
    const address = await UserAddress.findOne({ where: { id, userId: req.user.id } });
    if (!address) return res.status(404).send('Not found');

    await UserAddress.update(
      { isDefault: false },
      { where: { userId: req.user.id } }
    );

    address.isDefault = true;
    await address.save();

    const returnTo = String(req.body.returnTo || '').trim();
    if (returnTo && returnTo.startsWith('/')) return res.redirect(returnTo);
    res.redirect('/profile');
  } catch (e) {
    next(e);
  }
});

router.post('/profile/addresses/:id/delete', pageAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).send('Invalid id');
    const address = await UserAddress.findOne({ where: { id, userId: req.user.id } });
    if (!address) return res.redirect('/profile');
    await UserAddress.destroy({ where: { id, userId: req.user.id } });
    if (address.isDefault) {
      const nextDefault = await UserAddress.findOne({
        where: { userId: req.user.id },
        order: [['id', 'DESC']]
      });
      if (nextDefault) {
        nextDefault.isDefault = true;
        await nextDefault.save();
      }
    }
    res.redirect('/profile');
  } catch (e) {
    next(e);
  }
});

router.get('/orders', pageAuth, async (req, res, next) => {
  try {
    if (req.user?.role === 'admin') {
      return res.redirect('/admin/dashboard');
    }

    const q = String(req.query.q || '').trim();

    const pageSize = 10;
    const page = Math.max(1, parseInt(req.query.page || '1', 10) || 1);

    const where = { userId: req.user.id };
    if (q) {
      where.transactionCode = { [Sequelize.Op.iLike]: `%${q}%` };
    }

    const result = await Order.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [
        { model: VoucherPackage, include: [Game] },
        { model: UserAddress },
        { model: OrderItem, include: [{ model: VoucherPackage, include: [Game] }] }
      ],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      distinct: true,
    });

    const orders = result.rows;
    const totalCount = result.count;
    const totalPages = Math.max(1, Math.ceil((totalCount || 0) / pageSize));

    if ((totalCount || 0) > 0 && page > totalPages) {
      const params = [];
      if (q) params.push('q=' + encodeURIComponent(q));
      if (totalPages !== 1) params.push('page=' + totalPages);
      return res.redirect('/orders' + (params.length ? ('?' + params.join('&')) : ''));
    }

    res.render('orders', { title: 'Transaksi Saya', orders, q, totalCount: totalCount || 0, page, pageSize, totalPages });
  } catch (e) {
    next(e);
  }
});

router.get('/payment/bca', (req, res) => {
  const orderId = req.query.orderId ? String(req.query.orderId) : '';
  res.render('payment-bca', { title: 'Instruksi Pembayaran BCA', orderId });
});

module.exports = router;
