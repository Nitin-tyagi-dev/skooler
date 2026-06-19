import mongoose from "mongoose";

const feeStructureSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
      index: true,
    },

    className: {
      type: String,
      required: true,
    },

    academicYear: {
      type: String,
      required: true,
    },

    components: [
      {
        name: String,   // Tuition, Transport, etc.
        amount: Number,
      }
    ],

    totalAmount: {
      type: Number,
      required: true,
    }
  },
  { timestamps: true }
);

// Prevent duplicate structure per class + year + school
feeStructureSchema.index(
  { schoolId: 1, className: 1, academicYear: 1 },
  { unique: true }
);

const FeeStructure = mongoose.model("FeeStructure", feeStructureSchema);
export default FeeStructure;
