const Joi = require('joi');

const registerSchema = Joi.object({ body: Joi.object({ email: Joi.string().email().required(), password: Joi.string().min(6).required(), name: Joi.string().required() }) });
const loginSchema = Joi.object({ body: Joi.object({ email: Joi.string().email().required(), password: Joi.string().required() }) });

module.exports = { registerSchema, loginSchema };
