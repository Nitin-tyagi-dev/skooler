import mongoose from "mongoose";

const schoolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    address: {
      type: String,
      default: "",
    },

    contact: {
      phone: String,
      email: String,
    },

    academicYears: {
      type: [String], // e.g. ["2023-24", "2024-25"]
      default: [],
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const School = mongoose.model("School", schoolSchema);
export default School;
