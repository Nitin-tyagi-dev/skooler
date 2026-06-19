import Joi from "joi";
import { objectIdField } from "./objectId.validation.js";

export const paymentSchema = Joi.object({
  studentId: objectIdField("student").required(),

  academicYear: Joi.string()
    .pattern(/^\d{4}-\d{2}$/)
    .required()
    .messages({
      "string.pattern.base": "Academic year must be like 2024-25"
    }),

  amount: Joi.number()
    .positive()
    .required()
    .messages({
      "number.positive": "Amount must be greater than 0"
    })
});

export const feeStructureSchema = Joi.object({
  className: Joi.string().required(),

  academicYear: Joi.string()
    .pattern(/^\d{4}-\d{2}$/)
    .required(),

  components: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        amount: Joi.number().positive().required()
      })
    )
    .min(1)
    .required()
});

export const refundSchema = Joi.object({
  studentId: objectIdField("student").required(),

  academicYear: Joi.string()
    .pattern(/^\d{4}-\d{2}$/)
    .required()
    .messages({
      "string.pattern.base": "Academic year must be like 2024-25",
    }),

  receiptNumber: Joi.string().trim().min(1).required(),
});