import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
      index: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    academicYear: {
      type: String,
      required: true,
    },

    subjects: [
      {
        subject: {
          type: String,
          required: true,
        },

        midTerm: {
          marksObtained: Number,
          maxMarks: Number,
        },

        endTerm: {
          marksObtained: Number,
          maxMarks: Number,
        },

        grade: String,
      }
    ],

    totalMarks: Number,
    percentage: Number,
    grade: String,
    result: {
      type: String,
      enum: ["Pass", "Fail"],
    },
  },
  { timestamps: true }
);

resultSchema.index(
  { schoolId: 1, studentId: 1, academicYear: 1 },
  { unique: true }
);

const Result = mongoose.model("Result", resultSchema);
export default Result;