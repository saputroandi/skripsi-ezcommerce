const { Game, Genre, VoucherPackage } = require('../models');
const { Sequelize } = require('sequelize');
const path = require('path');

exports.listPage = async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();

    const where = {};
    if (q) {
      where[Sequelize.Op.or] = [
        { name: { [Sequelize.Op.iLike]: `%${q}%` } },
        { slug: { [Sequelize.Op.iLike]: `%${q}%` } },
      ];
    }

    const [games, genres] = await Promise.all([
      Game.findAll({
        where,
        order: [['createdAt', 'DESC']],
        include: [
          { model: Genre, through: { attributes: [] } },
          { model: VoucherPackage }
        ]
      }),
      Genre.findAll({ order: [['name', 'ASC']] })
    ]);

    res.render('admin/games', {
      title: 'Admin - Game Management',
      games,
      genres,
      q
    });
  } catch (e) {
    next(e);
  }
};

exports.createGame = async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const slug = String(req.body.slug || '').trim();

    // allow both URL input and file upload
    const thumbnailUrlRaw = String(req.body.thumbnailUrl || '').trim();
    const thumbnailFromFile = req.file ? `/uploads/thumbnails/${path.basename(req.file.path)}` : null;
    const thumbnailUrl = thumbnailFromFile || (thumbnailUrlRaw || null);

    const description = String(req.body.description || '').trim();
    const isActive = String(req.body.isActive || 'true') === 'true';

    let genreIds = req.body.genreIds || [];
    if (!Array.isArray(genreIds)) genreIds = [genreIds].filter(Boolean);
    genreIds = genreIds.map(v => Number(v)).filter(v => Number.isFinite(v));

    if (!name || !slug) {
      const [games, genres] = await Promise.all([
        Game.findAll({
          order: [['createdAt', 'DESC']],
          include: [
            { model: Genre, through: { attributes: [] } },
            { model: VoucherPackage }
          ]
        }),
        Genre.findAll({ order: [['name', 'ASC']] })
      ]);

      return res.status(400).render('admin/games', {
        title: 'Admin - Game Management',
        games,
        genres,
        q: '',
        error: 'name & slug wajib diisi'
      });
    }

    const g = await Game.create({
      name,
      slug,
      thumbnailUrl,
      description: description || null,
      isActive
    });
    await g.setGenres(genreIds);

    res.redirect('/admin/games');
  } catch (e) {
    next(e);
  }
};

exports.updateGame = async (req, res, next) => {
  try {
    const id = req.params.id;
    const g = await Game.findByPk(id);
    if (!g) return res.status(404).send('Not found');

    const name = String(req.body.name || '').trim();
    const slug = String(req.body.slug || '').trim();

    const thumbnailUrlRaw = String(req.body.thumbnailUrl || '').trim();
    const thumbnailFromFile = req.file ? `/uploads/thumbnails/${path.basename(req.file.path)}` : null;
    const thumbnailUrl = thumbnailFromFile || (thumbnailUrlRaw || null);

    const description = String(req.body.description || '').trim();
    const isActive = String(req.body.isActive || 'true') === 'true';

    let genreIds = req.body.genreIds || [];
    if (!Array.isArray(genreIds)) genreIds = [genreIds].filter(Boolean);
    genreIds = genreIds.map(v => Number(v)).filter(v => Number.isFinite(v));

    await g.update({
      name: name || g.name,
      slug: slug || g.slug,
      thumbnailUrl: thumbnailUrl || null,
      description: description || null,
      isActive
    });

    await g.setGenres(genreIds);

    res.redirect('/admin/games');
  } catch (e) {
    next(e);
  }
};

exports.softToggle = async (req, res, next) => {
  try {
    const id = req.params.id;
    const g = await Game.findByPk(id);
    if (!g) return res.status(404).send('Not found');

    g.isActive = !g.isActive;
    await g.save();

    res.redirect('/admin/games');
  } catch (e) {
    next(e);
  }
};

exports.deleteGame = async (req, res, next) => {
  try {
    const id = req.params.id;
    const g = await Game.findByPk(id);
    if (!g) return res.status(404).send('Not found');

    await g.destroy();
    res.redirect('/admin/games');
  } catch (e) {
    next(e);
  }
};
