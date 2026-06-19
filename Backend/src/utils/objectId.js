import mongoose from "mongoose";

/**
 * Checks whether a value is a valid MongoDB ObjectId.
 * Use before any query that filters by _id or a ref field.
 */
export const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Sends 400 when the ID is malformed; returns false so the caller can exit early.
 */
export const rejectInvalidObjectId = (res, id, resourceLabel) => {
  if (!isValidObjectId(id)) {
    res.status(400).json({ message: `Invalid ${resourceLabel} ID` });
    return false;
  }
  return true;
};
