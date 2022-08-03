const Joi = require('joi');

const validators = {
  create: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().empty('').default(''),
    public_setting: Joi.string().required(),
  }),
    
};

module.exports = validators;