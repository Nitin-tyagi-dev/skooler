import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    className: {
      type: String,
      required: true,
      trim: true,
    },

    section: {
      type: String,
      required: true, // ✅ now required
      trim: true,
    },

    rollNumber: {
      type: String,
      required: true,
      trim: true,
    },

    guardianName: {
      type: String,
      required: true, // ✅ now required
      trim: true,
    },

    guardianPhone: {
      type: String,
      required: true, // ✅ now required
      trim: true,
    },

    photo: {
      type: String,
      default: "",
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

studentSchema.index(
  { schoolId: 1, className: 1, rollNumber: 1 },
  { unique: true }
);

const Student = mongoose.model("Student", studentSchema);
export default Student;