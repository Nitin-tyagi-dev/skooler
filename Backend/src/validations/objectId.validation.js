import Joi from "joi";
import { isValidObjectId } from "../utils/objectId.js";

/**
 * Joi helper for MongoDB ObjectId fields in request bodies.
 * Returns 400 via validate middleware when the value is not a valid ObjectId.
 */
export const objectIdField = (resourceLabel) =>
  Joi.string()
    .custom((value, helpers) => {
      if (!isValidObjectId(value)) {
        return helpers.error("objectId.invalid");
      }
      return value;
    })
    .messages({
      "objectId.invalid": `Invalid ${resourceLabel} ID`,
    });
