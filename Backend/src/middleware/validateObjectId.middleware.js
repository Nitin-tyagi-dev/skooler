import { isValidObjectId } from "../utils/objectId.js";

/**
 * Route middleware: reject malformed MongoDB ObjectIds before DB queries run.
 * Valid shape → next(); invalid → 400 with "Invalid <resource> ID".
 *
 * @param {string} paramName - key on req.params (e.g. "id", "studentId")
 * @param {string} resourceLabel - label for the error message (e.g. "student")
 */
export const validateObjectIdParam = (paramName, resourceLabel) => {
  return (req, res, next) => {
    const id = req.params[paramName];

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: `Invalid ${resourceLabel} ID`,
      });
    }

    next();
  };
};

/**
 * Validate multiple ObjectId route parameters in one middleware.
 *
 * @param {Array<{ param: string, label: string }>} definitions
 */
export const validateObjectIdParams = (definitions) => {
  return (req, res, next) => {
    for (const { param, label } of definitions) {
      if (!isValidObjectId(req.params[param])) {
        return res.status(400).json({
          message: `Invalid ${label} ID`,
        });
      }
    }
    next();
  };
};

export default validateObjectIdParam;
