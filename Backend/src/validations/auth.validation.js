import Joi from "joi";

// Register validation
export const registerSchema = Joi.object({
  schoolName: Joi.string().required(),

  schoolCode: Joi.string().required(),

  name: Joi.string().required(),

  email: Joi.string().email().required(),

  password: Joi.string().min(6).required()
});


// Login validation
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),

  password: Joi.string().required()
});