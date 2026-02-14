const { Genre } = require('../models');

exports.list = async (req, res, next) => {
  try {
    const rows = await Genre.findAll({ order: [['name', 'ASC']] });
    res.json(rows);
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ message: 'name is required' });

    const row = await Genre.create({ name });
    res.json(row);
  } catch (e) {
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = req.params.id;
    const row = await Genre.findByPk(id);
    if (!row) return res.status(404).json({ message: 'Not found' });
    await row.destroy();
    res.json({ message: 'Deleted' });
  } catch (e) {
    next(e);
  }
};
