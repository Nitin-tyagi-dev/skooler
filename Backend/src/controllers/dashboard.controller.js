import Student from "../models/Student.js";
import User from "../models/User.js";
import Subject from "../models/Subject.js";
import Attendance from "../models/Attendance.js";
import Result from "../models/Result.js";
import FeeLedger from "../models/FeeLedger.js";
import mongoose from "mongoose";

const normalizeDate = (date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

export const getAdminDashboard = async (req, res) => {
  try {
    const { academicYear } = req.params;
    const schoolId = new mongoose.Types.ObjectId(req.schoolId);
    const today = normalizeDate(new Date());

    const [
      totalStudents,
      studentsByClass,
      totalTeachers,
      totalSubjects,
      totalResults,
      attendanceToday,
      feeLedgers,
    ] = await Promise.all([
      Student.countDocuments({ schoolId, active: true }),
      Student.aggregate([
        { $match: { schoolId, active: true } },
        { $group: { _id: "$className", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      User.countDocuments({ schoolId, role: "teacher", active: true }),
      Subject.countDocuments({ schoolId, active: true }),
      Result.countDocuments({ schoolId, academicYear }),
      Attendance.find({ schoolId, date: today }),
      FeeLedger.find({ schoolId, academicYear }),
    ]);

    let totalExpected = 0;
    let totalCollected = 0;

    for (const ledger of feeLedgers) {
      totalExpected += ledger.totalFee;

      const paid = ledger.payments.reduce(
        (sum, payment) =>
          sum + (payment.type === "refund" ? -payment.amount : payment.amount),
        0
      );

      totalCollected += paid;
    }

    const attendanceSummary = attendanceToday.reduce(
      (acc, record) => {
        acc[record.status] = (acc[record.status] || 0) + 1;
        return acc;
      },
      { present: 0, absent: 0, late: 0, half_day: 0 }
    );

    res.json({
      academicYear,
      students: {
        total: totalStudents,
        byClass: studentsByClass.map((item) => ({
          className: item._id,
          count: item.count,
        })),
      },
      teachers: { total: totalTeachers },
      subjects: { total: totalSubjects },
      results: { total: totalResults },
      fees: {
        totalExpected,
        totalCollected,
        totalPending: totalExpected - totalCollected,
      },
      attendanceToday: {
        date: today,
        totalMarked: attendanceToday.length,
        summary: attendanceSummary,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
