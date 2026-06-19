import Joi from "joi";

export const createSubjectSchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
  code: Joi.string().trim().allow(""),
  className: Joi.string().trim().allow(""),
});

export const updateSubjectSchema = Joi.object({
  name: Joi.string().trim().min(1),
  code: Joi.string().trim().allow(""),
  className: Joi.string().trim().allow(""),
}).min(1);
