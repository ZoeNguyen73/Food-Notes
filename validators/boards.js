const Joi = require('joi');

const validators = {
  create: Joi.object({
    name: Joi.string().required().max(35),
    description: Joi.string().empty('').default('').max(150),
    public_setting: Joi.string().required(),
  }),

  edit: Joi.object({
    name: Joi.string().required().max(35),
    description: Joi.string().empty('').default('').max(150),
    public_setting: Joi.string().required(),
  }),
    
};

module.exports = validators;