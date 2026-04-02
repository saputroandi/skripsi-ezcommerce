const { VoucherPackage, Game } = require('../models');

exports.createForGame = async (req, res, next) => {
  try {
    const gameId = Number(req.params.gameId);
    if (!Number.isFinite(gameId)) return res.status(400).send('Invalid game id');

    const game = await Game.findByPk(gameId);
    if (!game) return res.status(404).send('Game not found');

    const name = String(req.body.name || '').trim();
    const denominationRaw = String(req.body.denomination || '').trim();
    const denomination = Number(denominationRaw);
    const price = String(req.body.price || '').trim();

    if (!name) return res.status(400).send('name required');
    if (!Number.isFinite(denomination) || denomination <= 0) return res.status(400).send('denomination must be a positive number');
    if (!price) return res.status(400).send('price required');

    await VoucherPackage.create({
      gameId,
      name,
      denomination,
      price,
    });

    res.redirect('/admin/products');
  } catch (e) {
    next(e);
  }
};

exports.deleteVoucher = async (req, res, next) => {
  try {
    const id = req.params.id;
    const vp = await VoucherPackage.findByPk(id);
    if (!vp) return res.status(404).send('Not found');

    await vp.destroy();
    res.redirect('/admin/products');
  } catch (e) {
    next(e);
  }
};
