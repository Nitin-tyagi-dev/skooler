import School from "../models/School.js";

export const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Logo file is required" });
    }

    const logoPath = `/uploads/logos/${req.file.filename}`;

    const school = await School.findByIdAndUpdate(
      req.schoolId,
      { logo: logoPath },
      { new: true }
    );

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    res.json({
      message: "School logo uploaded successfully",
      logo: school.logo,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getSchoolProfile = async (req, res) => {
  try {
    const school = await School.findById(req.schoolId);

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    res.json(school);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateSchoolProfile = async (req, res) => {
  try {
    const { name, address, contact, academicYears } = req.body;

    const school = await School.findByIdAndUpdate(
      req.schoolId,
      { name, address, contact, academicYears },
      { new: true }
    );

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    res.json(school);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
