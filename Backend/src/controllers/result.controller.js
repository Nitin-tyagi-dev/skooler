import Result from "../models/Result.js";
import PDFDocument from "pdfkit";
import { processResultSubjects } from "../utils/grade.js";

export const createResult = async (req, res) => {
  try {
    // req.body.studentId validated by createResultSchema (objectIdField)
    const { studentId, academicYear, subjects } = req.body;
    const calculated = processResultSubjects(subjects);

    const result = await Result.create({
      schoolId: req.schoolId,
      studentId,
      academicYear,
      ...calculated,
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateResult = async (req, res) => {
  try {
    // req.params.id validated by validateObjectIdParam middleware
    const { subjects } = req.body;
    const calculated = processResultSubjects(subjects);

    const result = await Result.findOneAndUpdate(
      {
        _id: req.params.id,
        schoolId: req.schoolId,
      },
      calculated,
      { new: true }
    ).populate("studentId", "name className section rollNumber");

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const downloadResultPDF = async (req, res) => {
  try {
    // req.params.id validated by validateObjectIdParam middleware
    const result = await Result.findOne({
      _id: req.params.id,
      schoolId: req.schoolId,
    }).populate("studentId");

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=result-${result.studentId.name}.pdf`
    );

    doc.pipe(res);

    doc
      .fontSize(18)
      .fillColor("#2c3e50")
      .text("STUDENT REPORT CARD", { align: "center" });

    doc.moveDown();

    doc.fontSize(12).fillColor("black");
    doc.text(`Name: ${result.studentId.name}`);
    doc.text(`Class: ${result.studentId.className || "-"}`);
    doc.text(`Academic Year: ${result.academicYear}`);

    doc.moveDown(1.5);

    const startX = 50;
    let y = doc.y;

    doc
      .fontSize(12)
      .fillColor("white")
      .rect(startX, y, 500, 25)
      .fill("#3498db");

    doc.fillColor("white");
    doc.text("Subject", startX + 10, y + 7);
    doc.text("Mid Term", startX + 120, y + 7);
    doc.text("End Term", startX + 220, y + 7);
    doc.text("Grade", startX + 340, y + 7);
    doc.text("Average", startX + 420, y + 7);

    y += 25;

    result.subjects.forEach((sub, index) => {
      if (index % 2 === 0) {
        doc.rect(startX, y, 500, 25).fill("#ecf0f1");
      }

      doc.fillColor("black");

      const mid = sub.midTerm
        ? `${sub.midTerm.marksObtained}/${sub.midTerm.maxMarks}`
        : "";

      const end = sub.endTerm
        ? `${sub.endTerm.marksObtained}/${sub.endTerm.maxMarks}`
        : "";

      let avg = "";

      if (sub.midTerm && sub.endTerm) {
        avg = (
          (sub.midTerm.marksObtained + sub.endTerm.marksObtained) / 2
        ).toFixed(2);
      } else if (sub.midTerm) {
        avg = String(sub.midTerm.marksObtained);
      } else if (sub.endTerm) {
        avg = String(sub.endTerm.marksObtained);
      }

      doc.text(sub.subject, startX + 10, y + 7);
      doc.text(mid, startX + 120, y + 7);
      doc.text(end, startX + 220, y + 7);
      doc.text(sub.grade || "-", startX + 340, y + 7);
      doc.text(avg, startX + 420, y + 7);

      y += 25;
    });

    doc.moveDown(2);

    doc.rect(50, y, 500, 80).stroke("#bdc3c7");

    doc.text(`Total Marks Obtained: ${result.totalMarks}`, 60, y + 10);
    doc.text(`Percentage: ${result.percentage.toFixed(2)}%`, 60, y + 30);
    doc.text(`Grade: ${result.grade || "-"}`, 60, y + 50);
    doc.text(`Result: ${result.result || "-"}`, 300, y + 50);

    doc.moveDown(3);

    doc.text("Teacher Signature", 60);
    doc.text("Principal Signature", 350);

    doc.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getStudentResult = async (req, res) => {
  try {
    const { studentId, academicYear } = req.params;
    const result = await Result.findOne({
      schoolId: req.schoolId,
      studentId,
      academicYear,
    }).populate("studentId", "name className section rollNumber");

    if (!result) {
      return res.status(404).json({ message: "Result card not found" });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
