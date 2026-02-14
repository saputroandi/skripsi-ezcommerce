const Joi = require('joi');

module.exports = Joi.object({
  body: Joi.object({
    gameId: Joi.number().optional(),
    voucherPackageId: Joi.number().required(),
    uid: Joi.string().required(),
    whatsapp: Joi.string()
      .trim()
      .pattern(/^\+?\d{9,15}$/)
      .required()
      .messages({
        'string.pattern.base': 'whatsapp must be a valid phone number (digits only, optional +, length 9-15)'
      })
  })
});
