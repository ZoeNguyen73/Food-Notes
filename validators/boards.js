const Joi = require('joi');

const validators = {

  create: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    name: Joi.string().alphanum().min(3).max(30).required(),
    description: Joi.string(),
    isPublic: Joi.boolean().required(),
  }),
    
};

module.exports = validators;