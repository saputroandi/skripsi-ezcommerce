const Joi = require('joi');

// Allow admin to set genres via IDs (existing genres).
module.exports = Joi.object({
  name: Joi.string().min(2).required(),
  slug: Joi.string().min(2).required(),
  thumbnailUrl: Joi.string().uri().allow('', null),
  description: Joi.string().allow('', null),
  genreIds: Joi.array().items(Joi.number().integer()).default([])
});
