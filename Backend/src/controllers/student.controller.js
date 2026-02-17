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

// Update Student
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

// Delete Student (soft delete)
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
