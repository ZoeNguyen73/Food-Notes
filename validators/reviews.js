const Joi = require('joi');

const validators = {
  create: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    content: Joi.string().empty('').default('').max(250),
  }),
};

module.exports = validators;