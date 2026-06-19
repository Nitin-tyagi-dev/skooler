import Joi from "joi";
import { objectIdField } from "./objectId.validation.js";

const attendanceRecordSchema = Joi.object({
  studentId: objectIdField("student").required(),
  status: Joi.string()
    .valid("present", "absent", "late", "half_day")
    .required(),
});

export const markAttendanceSchema = Joi.object({
  date: Joi.date().required(),
  className: Joi.string().trim().min(1).required(),
  section: Joi.string().trim().min(1).required(),
  records: Joi.array().items(attendanceRecordSchema).min(1).required(),
});
