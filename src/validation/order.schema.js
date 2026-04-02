const Joi = require('joi');

module.exports = Joi.object({
  body: Joi.object({
    gameId: Joi.number().optional(),
    voucherPackageId: Joi.number().required(),
    addressId: Joi.number().required(),
    quantity: Joi.number().integer().min(1).max(999).required(),
    uid: Joi.string().required(),
    whatsapp: Joi.string()
      .trim()
      .pattern(/^\+?\d{9,15}$/)
      .optional()
      .allow('')
      .messages({
        'string.pattern.base': 'whatsapp must be a valid phone number (digits only, optional +, length 9-15)'
      })
  })
});
