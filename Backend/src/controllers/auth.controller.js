import jwt from "jsonwebtoken";
import User from "../models/User.js";
import School from "../models/School.js";
import { hashPassword, comparePassword } from "../utils/hash.js";

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Register School Admin (creates school + admin user)
export const registerSchoolAdmin = async (req, res) => {
  try {
    const { schoolName, schoolCode, name, email, password } = req.body;

    // check existing school
    const existingSchool = await School.findOne({ code: schoolCode });
    if (existingSchool) {
      return res.status(400).json({ message: "School already exists" });
    }

    // create school
    const school = await School.create({
      name: schoolName,
      code: schoolCode,
    });

    // hash password
    const hashedPassword = await hashPassword(password);

    // create admin user
    const user = await User.create({
      schoolId: school._id,
      name,
      email,
      password: hashedPassword,
      role: "school_admin",
    });

    const token = generateToken(user);

    res.status(201).json({
      message: "School registered successfully",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.active) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
