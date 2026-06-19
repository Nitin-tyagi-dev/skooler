import Joi from "joi";

export const createTeacherSchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const updateTeacherSchema = Joi.object({
  name: Joi.string().trim().min(1),
  email: Joi.string().email(),
  password: Joi.string().min(6),
}).min(1);
