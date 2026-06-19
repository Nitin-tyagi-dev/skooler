import FeeStructure from "../models/FeeStructure.js";
import FeeLedger from "../models/FeeLedger.js";
import Student from "../models/Student.js";



// ===============================
// CREATE FEE STRUCTURE
// ===============================
export const createFeeStructure = async (req, res) => {
  try {
    const { className, academicYear, components } = req.body;

    const totalAmount = components.reduce(
      (sum, comp) => sum + Number(comp.amount),
      0
    );

    const structure = await FeeStructure.create({
      schoolId: req.schoolId,
      className,
      academicYear,
      components,
      totalAmount,
    });

    res.status(201).json(structure);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};



// ===============================
// ADD PAYMENT
// ===============================
export const addPayment = async (req, res) => {
  try {
    // req.body.studentId validated by paymentSchema (objectIdField)
    const { studentId, academicYear } = req.body;
    const amount = Number(req.body.amount);

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid payment amount" });
    }

    let ledger = await FeeLedger.findOne({
      schoolId: req.schoolId,
      studentId,
      academicYear,
    });

    // Create ledger if not exists
    if (!ledger) {
      const student = await Student.findOne({
        _id: studentId,
        schoolId: req.schoolId,
      });

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const structure = await FeeStructure.findOne({
        schoolId: req.schoolId,
        className: student.className,
        academicYear,
      });

      if (!structure) {
        return res.status(404).json({ message: "Fee structure not found" });
      }

      ledger = await FeeLedger.create({
        schoolId: req.schoolId,
        studentId,
        academicYear,
        totalFee: structure.totalAmount,
        payments: [],
      });
    }

    // Calculate total paid including refunds
    const totalPaid = ledger.payments.reduce(
      (sum, p) =>
        sum + (p.type === "refund" ? -p.amount : p.amount),
      0
    );

    const balance = ledger.totalFee - totalPaid;

    if (amount > balance) {
      return res.status(400).json({
        message: `Payment exceeds balance. Remaining balance: ${balance}`,
      });
    }

    const receiptNumber = `RCPT-${Date.now()}`;

    ledger.payments.push({
      receiptNumber,
      amount,
      type: "payment",
      collectedBy: req.user.id,
    });

    await ledger.save();

    const updatedTotalPaid = totalPaid + amount;

    res.json({
      message: "Payment added successfully",
      receiptNumber,
      totalFee: ledger.totalFee,
      totalPaid: updatedTotalPaid,
      balance: ledger.totalFee - updatedTotalPaid,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};



// ===============================
// GET LEDGER SUMMARY
// ===============================
export const getLedger = async (req, res) => {
  try {
    const { studentId, academicYear } = req.params;

    const student = await Student.findOne({
      _id: studentId,
      schoolId: req.schoolId,
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const structure = await FeeStructure.findOne({
      schoolId: req.schoolId,
      className: student.className,
      academicYear,
    });

    let ledger = await FeeLedger.findOne({
      schoolId: req.schoolId,
      studentId,
      academicYear,
    });

    if (!ledger) {
      if (!structure) {
        return res.status(404).json({ message: "Fee structure not configured for this class level" });
      }

      ledger = await FeeLedger.create({
        schoolId: req.schoolId,
        studentId,
        academicYear,
        totalFee: structure.totalAmount,
        payments: [],
      });
    }

    const totalPaid = ledger.payments.reduce(
      (sum, p) =>
        sum + (p.type === "refund" ? -p.amount : p.amount),
      0
    );

    const balance = ledger.totalFee - totalPaid;

    res.json({
      ledger: {
        totalFee: ledger.totalFee,
        structure,
      },
      totalFee: ledger.totalFee,
      totalPaid,
      balance,
      payments: ledger.payments,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};



// ===============================
// FINANCIAL DASHBOARD
// ===============================
export const getFinancialDashboard = async (req, res) => {
  try {
    const { academicYear } = req.params;

    // Fetch all active students
    const students = await Student.find({
      schoolId: req.schoolId,
      active: true,
    });

    // Fetch all fee structures
    const structures = await FeeStructure.find({
      schoolId: req.schoolId,
      academicYear,
    });

    // Map className to structure
    const structureMap = {};
    structures.forEach((s) => {
      structureMap[s.className] = s;
    });

    // Fetch all ledgers
    const ledgers = await FeeLedger.find({
      schoolId: req.schoolId,
      academicYear,
    });

    // Map studentId to ledger
    const ledgerMap = {};
    ledgers.forEach((l) => {
      ledgerMap[l.studentId.toString()] = l;
    });

    // Compute expected fees based on students' class allocations
    let totalExpected = 0;
    const classStats = {}; // className -> { expected, collected }

    // Initialize class stats with structures
    structures.forEach((s) => {
      classStats[s.className] = { expected: 0, collected: 0 };
    });

    students.forEach((student) => {
      const struct = structureMap[student.className];
      if (struct) {
        totalExpected += struct.totalAmount;
        if (!classStats[student.className]) {
          classStats[student.className] = { expected: 0, collected: 0 };
        }
        classStats[student.className].expected += struct.totalAmount;
      }
    });

    let totalCollected = 0;
    let collectedToday = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Sum up actual transactions from existing ledgers
    ledgers.forEach((ledger) => {
      const paid = ledger.payments.reduce(
        (sum, p) => sum + (p.type === "refund" ? -p.amount : p.amount),
        0
      );
      totalCollected += paid;

      // Find which class this student belongs to
      const studentIdStr = ledger.studentId.toString();
      const student = students.find((s) => s._id.toString() === studentIdStr);
      if (student && classStats[student.className]) {
        classStats[student.className].collected += paid;
      }

      ledger.payments.forEach((p) => {
        const pDate = new Date(p.date);
        pDate.setHours(0, 0, 0, 0);
        if (pDate.getTime() === today.getTime()) {
          collectedToday += p.type === "refund" ? -p.amount : p.amount;
        }
      });
    });

    const totalPending = totalExpected - totalCollected;
    const byClassStats = Object.keys(classStats).map((className) => ({
      className,
      expected: classStats[className].expected,
      collected: classStats[className].collected,
    }));

    res.json({
      academicYear,
      summary: {
        totalStudents: students.length,
        totalExpected,
        totalCollected,
        totalPending,
        collectedToday,
      },
      byClass: byClassStats,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};



// ===============================
// GET PENDING STUDENTS
// ===============================
export const getPendingStudents = async (req, res) => {
  try {
    const { academicYear } = req.params;

    const students = await Student.find({
      schoolId: req.schoolId,
      active: true,
    });

    const structures = await FeeStructure.find({
      schoolId: req.schoolId,
      academicYear,
    });

    const structureMap = {};
    structures.forEach((s) => {
      structureMap[s.className] = s;
    });

    const ledgers = await FeeLedger.find({
      schoolId: req.schoolId,
      academicYear,
    });

    const ledgerMap = {};
    ledgers.forEach((l) => {
      ledgerMap[l.studentId.toString()] = l;
    });

    const pendingList = [];

    for (let student of students) {
      const ledger = ledgerMap[student._id.toString()];
      const structure = structureMap[student.className];

      if (!ledger && !structure) continue;

      const totalFee = ledger ? ledger.totalFee : structure.totalAmount;
      const payments = ledger ? ledger.payments : [];

      const totalPaid = payments.reduce(
        (sum, p) =>
          sum + (p.type === "refund" ? -p.amount : p.amount),
        0
      );

      const balance = totalFee - totalPaid;

      if (balance > 0) {
        pendingList.push({
          studentId: {
            _id: student._id,
            name: student.name,
            className: student.className,
            section: student.section,
            rollNumber: student.rollNumber,
          },
          totalFee,
          totalPaid,
          balance,
        });
      }
    }

    res.json(pendingList);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};



// ===============================
// REFUND PAYMENT
// ===============================
export const refundPayment = async (req, res) => {
  try {
    // req.body.studentId validated by refundSchema (objectIdField)
    const { studentId, academicYear, receiptNumber } = req.body;

    const ledger = await FeeLedger.findOne({
      schoolId: req.schoolId,
      studentId,
      academicYear,
    });

    if (!ledger) {
      return res.status(404).json({ message: "Ledger not found" });
    }

    const originalPayment = ledger.payments.find(
      (p) =>
        p.receiptNumber === receiptNumber &&
        p.type === "payment"
    );

    if (!originalPayment) {
      return res.status(404).json({ message: "Original payment not found" });
    }

    const refundReceipt = `RFND-${Date.now()}`;

    ledger.payments.push({
      receiptNumber: refundReceipt,
      amount: originalPayment.amount,
      type: "refund",
      referenceReceipt: receiptNumber,
      collectedBy: req.user.id,
    });

    await ledger.save();

    res.json({
      message: "Refund processed successfully",
      refundReceipt,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};