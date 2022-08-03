const Joi = require('joi');

const validators = {

  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email_address: Joi.string().email({minDomainSegments: 2, tlds: {allow: ['com', 'net']}}).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).min(7).required(),
    confirm_password: Joi.ref('password')
  }),

  login: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).min(7).required(),
  })
    
};

module.exports = validators;