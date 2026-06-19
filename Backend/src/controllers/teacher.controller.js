import User from "../models/User.js";
import { hashPassword } from "../utils/hash.js";

export const createTeacher = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await hashPassword(password);

    const teacher = await User.create({
      schoolId: req.schoolId,
      name,
      email,
      password: hashedPassword,
      role: "teacher",
    });

    const response = teacher.toObject();
    delete response.password;

    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({
      schoolId: req.schoolId,
      role: "teacher",
      active: true,
    }).select("-password");

    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getTeacherById = async (req, res) => {
  try {
    // req.params.id validated by validateObjectIdParam middleware
    const teacher = await User.findOne({
      _id: req.params.id,
      schoolId: req.schoolId,
      role: "teacher",
      active: true,
    }).select("-password");

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateTeacher = async (req, res) => {
  try {
    // req.params.id validated by validateObjectIdParam middleware
    const updates = { ...req.body };

    if (updates.password) {
      updates.password = await hashPassword(updates.password);
    }

    const teacher = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        schoolId: req.schoolId,
        role: "teacher",
        active: true,
      },
      updates,
      { new: true }
    ).select("-password");

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteTeacher = async (req, res) => {
  try {
    // req.params.id validated by validateObjectIdParam middleware
    const teacher = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        schoolId: req.schoolId,
        role: "teacher",
      },
      { active: false },
      { new: true }
    );

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.json({ message: "Teacher deactivated" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
