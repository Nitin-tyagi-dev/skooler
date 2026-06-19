import Subject from "../models/Subject.js";

export const createSubject = async (req, res) => {
  try {
    const subject = await Subject.create({
      ...req.body,
      schoolId: req.schoolId,
    });

    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getSubjects = async (req, res) => {
  try {
    const filter = {
      schoolId: req.schoolId,
      active: true,
    };

    if (req.query.className) {
      filter.className = req.query.className;
    }

    const subjects = await Subject.find(filter).sort({ name: 1 });

    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getSubjectById = async (req, res) => {
  try {
    // req.params.id validated by validateObjectIdParam middleware
    const subject = await Subject.findOne({
      _id: req.params.id,
      schoolId: req.schoolId,
      active: true,
    });

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateSubject = async (req, res) => {
  try {
    // req.params.id validated by validateObjectIdParam middleware
    const subject = await Subject.findOneAndUpdate(
      {
        _id: req.params.id,
        schoolId: req.schoolId,
        active: true,
      },
      req.body,
      { new: true }
    );

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    // req.params.id validated by validateObjectIdParam middleware
    const subject = await Subject.findOneAndUpdate(
      {
        _id: req.params.id,
        schoolId: req.schoolId,
      },
      { active: false },
      { new: true }
    );

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.json({ message: "Subject deactivated" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
