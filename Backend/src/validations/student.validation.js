import Joi from "joi";

export const createStudentSchema = Joi.object({
  name: Joi.string().trim().min(1).required(),

  className: Joi.string().trim().min(1).required(),

  section: Joi.string().trim().min(1).required(),

  rollNumber: Joi.string().trim().min(1).required(),

  guardianName: Joi.string().trim().min(1).required(),

  guardianPhone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be 10 digits"
    })
});