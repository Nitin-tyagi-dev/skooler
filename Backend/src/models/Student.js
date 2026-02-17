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
    },

    section: {
      type: String,
      default: "",
    },

    rollNumber: {
      type: String,
      required: true,
    },

    guardianName: {
      type: String,
      default: "",
    },

    guardianPhone: {
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

const Student = mongoose.model("Student", studentSchema);
export default Student;

studentSchema.index(
  { schoolId: 1, className: 1, rollNumber: 1 },
  { unique: true }
);

