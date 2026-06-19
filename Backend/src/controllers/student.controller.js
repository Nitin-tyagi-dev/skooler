import Student from "../models/Student.js";

// Create Student
export const createStudent = async (req, res) => {
  try {
    const student = await Student.create({
      ...req.body,
      schoolId: req.schoolId,
    });

    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get All Students
export const getStudents = async (req, res) => {
  try {
    const students = await Student.find({
      schoolId: req.schoolId,
      active: true,
    });

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update Student — ObjectId validated by route middleware before this runs
export const updateStudent = async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      {
        _id: req.params.id,
        schoolId: req.schoolId,
      },
      req.body,
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Student (soft delete) — ObjectId validated by route middleware
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      {
        _id: req.params.id,
        schoolId: req.schoolId,
      },
      { active: false },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Student deactivated" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ObjectId validated by route middleware before this runs
export const uploadStudentPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Photo file is required" });
    }

    const photoPath = `/uploads/students/${req.file.filename}`;

    const student = await Student.findOneAndUpdate(
      {
        _id: req.params.id,
        schoolId: req.schoolId,
        active: true,
      },
      { photo: photoPath },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      message: "Student photo uploaded successfully",
      photo: student.photo,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
