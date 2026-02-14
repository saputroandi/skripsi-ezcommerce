const Joi = require('joi');

module.exports = (schema) => (req, res, next) => {
  const data = { body: req.body, params: req.params, query: req.query };
  const { error } = schema.validate(data, { allowUnknown: true });
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};
