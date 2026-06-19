import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { 
  Award,
  CheckCircle,
  AlertCircle,
  FileText,
  Plus,
  Edit,
  Download,
  BookOpen
} from "lucide-react";
import Button from "../components/UI/Button";
import Input from "../components/UI/Input";
import Modal from "../components/UI/Modal";

const Results = () => {
  const { user, academicYear } = useAuth();
  
  // Selection filters
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  
  // State
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [resultCard, setResultCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  
  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState("create"); // 'create' or 'edit'
  
  // Dynamic form rows: array of { subjectName, midObtained, midMax, endObtained, endMax }
  const [formSubjects, setFormSubjects] = useState([]);

  // Feedbacks
  const [notification, setNotification] = useState({ type: "", message: "" });
  const [formError, setFormError] = useState("");

  const isEligible = user && (user.role === "school_admin" || user.role === "teacher");

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: "", message: "" }), 4000);
  };

  const loadInitialData = async () => {
    try {
      const s = await api.students.getAll();
      setStudents(s);
      
      const sub = await api.subjects.getAll();
      setSubjects(sub);
    } catch (err) {
      console.error(err);
      showNotification("danger", "Failed to retrieve student and subject catalogs.");
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
    setSelectedStudentId("");
    setResultCard(null);
    setLoaded(false);
  };

  const handleStudentChange = async (e) => {
    const sId = e.target.value;
    setSelectedStudentId(sId);
    setResultCard(null);
    setLoaded(false);
    if (!sId) return;

    setLoading(true);
    try {
      const res = await api.get(`/results/student/${sId}/${academicYear}`);
      setResultCard(res);
      setLoaded(true);
    } catch (err) {
      // 404 is normal if no report card created
      setResultCard(null);
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = () => {
    setFormError("");
    
    // Find subjects configured for this class level
    const classSubjects = subjects.filter(
      (sub) => sub.className === selectedClass && sub.active
    );

    if (resultCard) {
      // Edit mode: populate existing values
      setFormType("edit");
      const rows = resultCard.subjects.map((s) => ({
        subject: s.subject,
        midObtained: s.midTerm?.marksObtained ?? "",
        midMax: s.midTerm?.maxMarks ?? "",
        endObtained: s.endTerm?.marksObtained ?? "",
        endMax: s.endTerm?.maxMarks ?? "",
      }));
      setFormSubjects(rows);
    } else {
      // Create mode: pre-populate with target class subjects
      setFormType("create");
      const rows = classSubjects.map((sub) => ({
        subject: sub.name,
        midObtained: "",
        midMax: 100,
        endObtained: "",
        endMax: 100,
      }));
      setFormSubjects(rows.length > 0 ? rows : [{ subject: "", midObtained: "", midMax: 100, endObtained: "", endMax: 100 }]);
    }
    setIsFormOpen(true);
  };

  const handleFormRowChange = (index, field, value) => {
    setFormSubjects((prev) => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  const addFormRow = () => {
    setFormSubjects((prev) => [
      ...prev,
      { subject: "", midObtained: "", midMax: 100, endObtained: "", endMax: 100 },
    ]);
  };

  const removeFormRow = (index) => {
    if (formSubjects.length === 1) return;
    setFormSubjects((prev) => prev.filter((_, i) => i !== index));
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setFormError("");
    setLoading(true);

    // Format subjects list
    const subjectsPayload = formSubjects.map((row) => {
      const entry = { subject: row.subject };
      
      if (row.midObtained !== "") {
        entry.midTerm = {
          marksObtained: parseFloat(row.midObtained),
          maxMarks: parseFloat(row.midMax),
        };
      }
      if (row.endObtained !== "") {
        entry.endTerm = {
          marksObtained: parseFloat(row.endObtained),
          maxMarks: parseFloat(row.endMax),
        };
      }
      return entry;
    });

    try {
      if (formType === "create") {
        await api.results.create({
          studentId: selectedStudentId,
          academicYear,
          subjects: subjectsPayload,
        });
        showNotification("success", "Student report card created.");
      } else {
        await api.results.update(resultCard._id, {
          subjects: subjectsPayload,
        });
        showNotification("success", "Student report card updated.");
      }
      setIsFormOpen(false);
      
      // Reload student data
      handleStudentChange({ target: { value: selectedStudentId } });
    } catch (err) {
      setFormError(err.message || "Failed to save exam results. Verify max marks.");
    } finally {
      setLoading(false);
    }
  };

  const triggerPDFDownload = async () => {
    if (!resultCard) return;
    try {
      const blob = await api.results.downloadPDFBlob(resultCard._id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      // Get student name from selection
      const student = students.find((s) => s._id === selectedStudentId);
      link.setAttribute("download", `ReportCard-${student?.name || "Student"}-${academicYear}.pdf`);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      showNotification("success", "Report Card PDF downloaded.");
    } catch (err) {
      showNotification("danger", "Failed to generate Report Card PDF.");
    }
  };

  // Filter students based on selected class
  const classStudents = students.filter(
    (s) => s.className === selectedClass && s.active
  );
  const classesList = [...new Set(students.map((s) => s.className))].sort();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Gradebook & Examinations</h1>
          <p className="page-subtitle">Input marks, display grading distributions and generate PDF report cards</p>
        </div>
      </div>

      {/* Floating notifications */}
      {notification.message && (
        <div className={`alert-box alert-${notification.type === "success" ? "success" : "default"}`} style={{ position: "fixed", top: "20px", right: "20px", zIndex: 1050, width: "320px", boxShadow: "var(--shadow-lg)" }}>
          {notification.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="filters-bar">
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Student Class</label>
          <select className="form-control" value={selectedClass} onChange={handleClassChange}>
            <option value="">Choose Class</option>
            {classesList.map((c) => (
              <option key={c} value={c}>Class {c}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Student Name</label>
          <select className="form-control" value={selectedStudentId} onChange={handleStudentChange} disabled={!selectedClass}>
            <option value="">Choose Student</option>
            {classStudents.map((s) => (
              <option key={s._id} value={s._id}>{s.name} (Roll: {s.rollNumber})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Workspace */}
      {loading ? (
        <div>Retrieving examination grades...</div>
      ) : loaded ? (
        resultCard ? (
          <div>
            {/* Action Bar */}
            <div className="card mb-16" style={{ padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", fontWeight: 700 }}>
                Status: <span className="badge badge-success">{resultCard.result}</span>
              </span>
              
              <div className="gap-8">
                <Button variant="secondary" size="sm" onClick={triggerPDFDownload} className="gap-8">
                  <Download size={14} /> Download PDF
                </Button>
                {isEligible && (
                  <Button size="sm" onClick={handleOpenForm} className="gap-8">
                    <Edit size={14} /> Modify Grades
                  </Button>
                )}
              </div>
            </div>

            {/* Results Table */}
            <div className="grid-3" style={{ gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Mid Term</th>
                      <th>End Term</th>
                      <th>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultCard.subjects.map((sub, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{sub.subject}</td>
                        <td>
                          {sub.midTerm 
                            ? `${sub.midTerm.marksObtained} / ${sub.midTerm.maxMarks}`
                            : "—"}
                        </td>
                        <td>
                          {sub.endTerm 
                            ? `${sub.endTerm.marksObtained} / ${sub.endTerm.maxMarks}`
                            : "—"}
                        </td>
                        <td>
                          <span className="badge badge-default" style={{ fontSize: "11px", fontWeight: 700 }}>
                            {sub.grade || "N/A"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary standings */}
              <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <h4 style={{ fontSize: "15px", fontWeight: 700, borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}>
                  Aggregate Standings
                </h4>
                
                <div className="flex-between">
                  <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Total Obtained</span>
                  <span style={{ fontWeight: 700 }}>{resultCard.totalMarks} Marks</span>
                </div>
                <div className="flex-between">
                  <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Percentage</span>
                  <span style={{ fontWeight: 700 }}>{resultCard.percentage?.toFixed(2)}%</span>
                </div>
                <div className="flex-between">
                  <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Class Grade</span>
                  <span style={{ fontWeight: 700 }}>{resultCard.grade || "—"}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <Award className="empty-state-icon" size={40} />
            <h3 className="empty-state-title">No Grade Card Found</h3>
            <p style={{ fontSize: "14px", marginBottom: "16px" }}>
              There is no report card recorded for this student for Academic Year {academicYear}.
            </p>
            {isEligible && (
              <Button onClick={handleOpenForm} className="gap-8">
                <Plus size={16} /> Create Report Card
              </Button>
            )}
          </div>
        )
      ) : (
        <div className="empty-state">
          <Award className="empty-state-icon" size={40} />
          <h3 className="empty-state-title">Select Student Parameters</h3>
          <p style={{ fontSize: "14px" }}>Choose a class and student profile to display the academic grading card.</p>
        </div>
      )}

      {/* Grade Entry Form Modal */}
      <Modal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        title={formType === "create" ? "Initialize Student Grade Card" : "Modify Exam Grades"}
        maxWidth="800px"
        footer={
          <div className="gap-12" style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button onClick={submitForm}>Submit Results</Button>
          </div>
        }
      >
        {formError && <div className="alert-box alert-danger">{formError}</div>}
        <form onSubmit={submitForm}>
          <div style={{ maxHeight: "400px", overflowY: "auto", paddingRight: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase" }}>Curriculum Items</span>
              <Button variant="secondary" size="sm" onClick={addFormRow} className="gap-8">
                <Plus size={12} /> Add Row
              </Button>
            </div>

            {formSubjects.map((row, idx) => (
              <div 
                key={idx} 
                className="grid-2 mb-16" 
                style={{ 
                  gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr auto", 
                  alignItems: "flex-end",
                  backgroundColor: "var(--bg-secondary)",
                  padding: "12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-color)"
                }}
              >
                <Input
                  label={idx === 0 ? "Subject Name" : ""}
                  id={`sub-name-${idx}`}
                  placeholder="Mathematics"
                  value={row.subject}
                  onChange={(e) => handleFormRowChange(idx, "subject", e.target.value)}
                  required
                />
                <Input
                  label={idx === 0 ? "Mid-Term Ob." : ""}
                  id={`mid-ob-${idx}`}
                  type="number"
                  min="0"
                  placeholder="85"
                  value={row.midObtained}
                  onChange={(e) => handleFormRowChange(idx, "midObtained", e.target.value)}
                />
                <Input
                  label={idx === 0 ? "Mid Max" : ""}
                  id={`mid-max-${idx}`}
                  type="number"
                  min="1"
                  placeholder="100"
                  value={row.midMax}
                  onChange={(e) => handleFormRowChange(idx, "midMax", e.target.value)}
                />
                <Input
                  label={idx === 0 ? "End-Term Ob." : ""}
                  id={`end-ob-${idx}`}
                  type="number"
                  min="0"
                  placeholder="92"
                  value={row.endObtained}
                  onChange={(e) => handleFormRowChange(idx, "endObtained", e.target.value)}
                />
                <Input
                  label={idx === 0 ? "End Max" : ""}
                  id={`end-max-${idx}`}
                  type="number"
                  min="1"
                  placeholder="100"
                  value={row.endMax}
                  onChange={(e) => handleFormRowChange(idx, "endMax", e.target.value)}
                />
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => removeFormRow(idx)}
                  disabled={formSubjects.length === 1}
                  style={{ marginBottom: "20px", padding: "8px", backgroundColor: "rgba(243, 18, 96, 0.1)", color: "var(--accent-error)" }}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Results;
