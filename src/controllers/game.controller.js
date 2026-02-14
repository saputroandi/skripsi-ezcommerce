const { Game, VoucherPackage, Genre } = require('../models');
/**
 * @openapi
 * components:
 *   schemas:
 *     Game:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         name: { type: string }
 *         slug: { type: string }
 */

exports.list = async (req,res,next)=>{
  try {
    const games = await Game.findAll({
      where: { isActive: true },
      include: [
        { model: VoucherPackage, required: true },
        { model: Genre, through: { attributes: [] } }
      ]
    });
    res.json(games);
  } catch(e){ next(e); }
};

exports.get = async (req,res,next)=>{
  try {
    const game = await Game.findOne({
      where: { id: req.params.id, isActive: true },
      include: [
        { model: VoucherPackage, required: true },
        { model: Genre, through: { attributes: [] } }
      ]
    });
    if(!game) return res.status(404).json({ message: 'Not found' });
    res.json(game);
  } catch(e){ next(e); }
};

exports.create = async (req,res,next)=>{
  try {
    const { genreIds, ...gamePayload } = req.body || {};
    const g = await Game.create(gamePayload);

    if (Array.isArray(genreIds)) {
      await g.setGenres(genreIds);
    }

    const out = await Game.findByPk(g.id, { include: [VoucherPackage, { model: Genre, through: { attributes: [] } }] });
    res.json(out);
  } catch(e){ next(e); }
};

exports.update = async (req,res,next)=>{
  try {
    const g = await Game.findByPk(req.params.id);
    if(!g) return res.status(404).json({ message: 'Not found' });

    const { genreIds, ...gamePayload } = req.body || {};
    await g.update(gamePayload);

    if (Array.isArray(genreIds)) {
      await g.setGenres(genreIds);
    }

    const out = await Game.findByPk(g.id, { include: [VoucherPackage, { model: Genre, through: { attributes: [] } }] });
    res.json(out);
  } catch(e){ next(e); }
};

exports.remove = async (req,res,next)=>{
  try {
    const g = await Game.findByPk(req.params.id);
    if(!g) return res.status(404).json({ message: 'Not found' });
    await g.destroy();
    res.json({ message: 'Deleted' });
  } catch(e){ next(e); }
};
