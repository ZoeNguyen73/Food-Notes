const Joi = require('joi');

const validators = {
  create: Joi.object({
    name: Joi.string().required().min(1).max(30),
  }),
};

module.exports = validators;