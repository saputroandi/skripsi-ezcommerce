const path = require('path');
const { Game } = require('../models');

exports.uploadThumbnail = async (req, res, next) => {
  try {
    const id = req.params.id;
    const file = req.file;

    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const game = await Game.findByPk(id);
    if (!game) return res.status(404).json({ message: 'Not found' });

    // Store public-facing URL (served from /uploads)
    const publicUrl = `/uploads/thumbnails/${path.basename(file.path)}`;

    game.thumbnailUrl = publicUrl;
    await game.save();

    res.json({
      message: 'Thumbnail uploaded',
      thumbnailUrl: game.thumbnailUrl,
      game,
    });
  } catch (e) {
    next(e);
  }
};
