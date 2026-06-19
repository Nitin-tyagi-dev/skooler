import Attendance from "../models/Attendance.js";
import Student from "../models/Student.js";

const normalizeDate = (date) => {
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const sectionFilter = (section) => ({
  $regex: new RegExp(`^${section.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
});

export const markAttendance = async (req, res) => {
  try {
    // records[].studentId validated by markAttendanceSchema (objectIdField)
    const { date, className, section, records } = req.body;
    const attendanceDate = normalizeDate(date);
    const results = [];

    for (const record of records) {
      const student = await Student.findOne({
        _id: record.studentId,
        schoolId: req.schoolId,
        className,
        section: sectionFilter(section),
        active: true,
      });

      if (!student) {
        return res.status(404).json({
          message: `Student ${record.studentId} not found in ${className}-${section}`,
        });
      }

      const attendance = await Attendance.findOneAndUpdate(
        {
          schoolId: req.schoolId,
          studentId: record.studentId,
          date: attendanceDate,
        },
        {
          status: record.status,
          markedBy: req.user.id,
          className,
          section: student.section,
        },
        { new: true, upsert: true }
      );

      results.push(attendance);
    }

    res.status(201).json({
      message: "Attendance marked successfully",
      date: attendanceDate,
      count: results.length,
      records: results,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getStudentAttendance = async (req, res) => {
  try {
    // req.params.studentId validated by validateObjectIdParam middleware
    const { studentId } = req.params;
    const { month, year } = req.query;

    const student = await Student.findOne({
      _id: studentId,
      schoolId: req.schoolId,
      active: true,
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const filter = {
      schoolId: req.schoolId,
      studentId,
    };

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }

    const records = await Attendance.find(filter)
      .sort({ date: 1 })
      .populate("markedBy", "name");

    const summary = records.reduce(
      (acc, record) => {
        acc[record.status] = (acc[record.status] || 0) + 1;
        return acc;
      },
      { present: 0, absent: 0, late: 0, half_day: 0 }
    );

    res.json({
      student: {
        id: student._id,
        name: student.name,
        className: student.className,
        section: student.section,
      },
      summary,
      records,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getClassAttendanceReport = async (req, res) => {
  try {
    const { className, date } = req.params;
    const { section } = req.query;
    const attendanceDate = normalizeDate(date);

    const filter = {
      schoolId: req.schoolId,
      className,
      date: attendanceDate,
    };

    if (section) {
      filter.section = sectionFilter(section);
    }

    const records = await Attendance.find(filter)
      .populate("studentId", "name rollNumber section")
      .sort({ "studentId.rollNumber": 1 });

    const summary = records.reduce(
      (acc, record) => {
        acc[record.status] = (acc[record.status] || 0) + 1;
        return acc;
      },
      { present: 0, absent: 0, late: 0, half_day: 0 }
    );

    res.json({
      className,
      section: section || "all",
      date: attendanceDate,
      summary,
      totalMarked: records.length,
      records,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
