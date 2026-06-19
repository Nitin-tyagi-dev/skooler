import mongoose from "mongoose";

const paymentEntrySchema = new mongoose.Schema({
  receiptNumber: {
    type: String,
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },

  type: {
    type: String,
    enum: ["payment", "refund"],
    default: "payment",
  },

  referenceReceipt: {
    type: String, // used when refunding
  },

  date: {
    type: Date,
    default: Date.now,
  },

  collectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const feeLedgerSchema = new mongoose.Schema(
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

    totalFee: {
      type: Number,
      required: true,
    },

    payments: [paymentEntrySchema],
  },
  { timestamps: true }
);

// One ledger per student per academic year
feeLedgerSchema.index(
  { schoolId: 1, studentId: 1, academicYear: 1 },
  { unique: true }
);

const FeeLedger = mongoose.model("FeeLedger", feeLedgerSchema);
export default FeeLedger;
