import Joi from "joi";
import { objectIdField } from "./objectId.validation.js";

const termMarksSchema = Joi.object({
  marksObtained: Joi.number().min(0).required(),
  maxMarks: Joi.number().min(1).required(),
});

const subjectMarksSchema = Joi.object({
  subject: Joi.string().trim().min(1).required(),
  midTerm: termMarksSchema,
  endTerm: termMarksSchema,
}).or("midTerm", "endTerm");

export const createResultSchema = Joi.object({
  studentId: objectIdField("student").required(),
  academicYear: Joi.string()
    .pattern(/^\d{4}-\d{2}$/)
    .required()
    .messages({
      "string.pattern.base": "Academic year must be in format YYYY-YY",
    }),
  subjects: Joi.array().items(subjectMarksSchema).min(1).required(),
});

export const updateResultSchema = Joi.object({
  subjects: Joi.array().items(subjectMarksSchema).min(1).required(),
});
