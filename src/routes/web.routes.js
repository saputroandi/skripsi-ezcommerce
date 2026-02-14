const router = require('express').Router();
const { Game, VoucherPackage, Order, Genre } = require('../models');
const { Sequelize } = require('sequelize');
const pageAuth = require('../middleware/pageAuth');

router.get('/', async (req,res)=>{
  const games = await Game.findAll({
    where: { isActive: true },
    limit: 6,
    include: [
      // only show games that have at least 1 voucher package
      { model: VoucherPackage, required: true, attributes: [] },
      { model: Genre, through: { attributes: [] } }
    ]
  });
  res.render('index', { games });
});

router.get('/games', async (req,res)=>{
  const games = await Game.findAll({
    where: { isActive: true },
    include: [
      { model: VoucherPackage, required: true, attributes: [] },
      { model: Genre, through: { attributes: [] } }
    ]
  });
  res.render('games', { games });
});

router.get('/games/:id/buy', async (req,res)=>{
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

router.get('/orders', pageAuth, async (req, res, next) => {
  try {
    if (req.user?.role === 'admin') {
      return res.redirect('/admin/dashboard');
    }

    const q = String(req.query.q || '').trim();

    const where = { userId: req.user.id };
    if (q) {
      where.transactionCode = { [Sequelize.Op.iLike]: `%${q}%` };
    }

    const orders = await Order.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [
        { model: VoucherPackage, include: [Game] }
      ]
    });

    res.render('orders', { title: 'Transaksi Saya', orders, q });
  } catch (e) {
    next(e);
  }
});

router.get('/payment/bca', (req, res) => {
  res.render('payment-bca', { title: 'Instruksi Pembayaran BCA' });
});

module.exports = router;
