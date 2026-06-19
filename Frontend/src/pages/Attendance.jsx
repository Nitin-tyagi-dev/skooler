import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { 
  CalendarCheck,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  UserCheck,
  Search,
} from "lucide-react";
import Button from "../components/UI/Button";

const Attendance = () => {
  const { user } = useAuth();
  
  // Selection filters
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  
  // State
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({}); // studentId -> status
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  
  // Feedback
  const [notification, setNotification] = useState({ type: "", message: "" });
  const [errorMsg, setErrorMsg] = useState("");

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: "", message: "" }), 4500);
  };

  // Load classes and sections on mount to populate filters
  const initializeFilters = async () => {
    try {
      const allStudents = await api.students.getAll();
      const uniqueClasses = [...new Set(allStudents.map((s) => s.className))].sort();
      const uniqueSections = [...new Set(allStudents.map((s) => s.section))].sort();
      setClasses(uniqueClasses);
      setSections(uniqueSections);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to initialize filter variables.");
    }
  };

  useEffect(() => {
    initializeFilters();
  }, []);

  const loadAttendanceSheet = async (e) => {
    if (e) e.preventDefault();
    if (!selectedClass || !selectedSection) {
      setErrorMsg("Please select a class and section first.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setLoaded(false);

    try {
      // 1. Fetch students belonging to the class & section
      const allStudents = await api.students.getAll();
      const targetStudents = allStudents.filter(
        (s) =>
          s.className === selectedClass &&
          s.section.toLowerCase() === selectedSection.toLowerCase() &&
          s.active
      );

      if (targetStudents.length === 0) {
        setErrorMsg("No active students found in the selected class and section.");
        setStudents([]);
        setLoading(false);
        return;
      }

      setStudents(targetStudents);

      // 2. Fetch existing attendance logs for this class/section and date
      const report = await api.attendance.getClassReport(selectedClass, selectedDate, {
        section: selectedSection,
      });

      // Map existing records
      const mappedRecords = {};
      
      // Seed default statuses for everyone to 'present'
      targetStudents.forEach((student) => {
        mappedRecords[student._id] = "present";
      });

      // Overwrite with already-marked database values
      if (report && report.records && report.records.length > 0) {
        report.records.forEach((record) => {
          // record.studentId can be populated object or just string ID. 
          // Let's resolve the ID.
          const sId = record.studentId?._id || record.studentId;
          mappedRecords[sId] = record.status;
        });
        showNotification("success", "Existing attendance records loaded.");
      } else {
        showNotification("default", "No attendance marked yet. Ready for input.");
      }

      setAttendanceRecords(mappedRecords);
      setLoaded(true);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to load student attendance logs.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, newStatus) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: newStatus,
    }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach((s) => {
      updated[s._id] = status;
    });
    setAttendanceRecords(updated);
  };

  const submitAttendance = async () => {
    setLoading(true);
    setErrorMsg("");

    const recordsPayload = Object.keys(attendanceRecords).map((sId) => ({
      studentId: sId,
      status: attendanceRecords[sId],
    }));

    try {
      await api.attendance.mark({
        date: selectedDate,
        className: selectedClass,
        section: selectedSection.trim(),
        records: recordsPayload,
      });
      showNotification("success", "Attendance saved successfully.");
      // Refresh sheet
      await loadAttendanceSheet();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to submit attendance logs.");
      setLoading(false);
    }
  };

  // Stats calculation
  const getStats = () => {
    let present = 0, absent = 0, late = 0, halfDay = 0;
    Object.values(attendanceRecords).forEach((status) => {
      if (status === "present") present++;
      else if (status === "absent") absent++;
      else if (status === "late") late++;
      else if (status === "half_day") halfDay++;
    });
    return { present, absent, late, halfDay, total: students.length };
  };

  const stats = getStats();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Daily Attendance</h1>
          <p className="page-subtitle">Mark and review student attendance sheets</p>
        </div>
      </div>

      {/* Floating Notifications */}
      {notification.message && (
        <div className={`alert-box alert-${notification.type === "success" ? "success" : "default"}`} style={{ position: "fixed", top: "20px", right: "20px", zIndex: 1050, width: "320px", boxShadow: "var(--shadow-lg)" }}>
          {notification.type === "success" ? <CheckCircle size={16} /> : <CalendarCheck size={16} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Selector Filters */}
      <form onSubmit={loadAttendanceSheet} className="filters-bar">
        <div className="form-group">
          <label className="form-label">Date</label>
          <input
            type="date"
            className="form-control"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setLoaded(false);
            }}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Class</label>
          <select
            className="form-control"
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setLoaded(false);
            }}
            required
          >
            <option value="">Choose Class</option>
            {classes.map((c) => (
              <option key={c} value={c}>Class {c}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Section</label>
          <select
            className="form-control"
            value={selectedSection}
            onChange={(e) => {
              setSelectedSection(e.target.value);
              setLoaded(false);
            }}
            required
          >
            <option value="">Choose Section</option>
            {sections.map((s) => (
              <option key={s} value={s}>{s.toUpperCase()}</option>
            ))}
          </select>
        </div>

        <Button type="submit" loading={loading && !loaded} style={{ height: "42px" }}>
          Load Sheet
        </Button>
      </form>

      {errorMsg && (
        <div className="alert-box alert-danger">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Attendance Workspace */}
      {loaded && students.length > 0 && (
        <div>
          {/* Quick Stats Panel */}
          <div className="card mb-16" style={{ padding: "16px 24px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
            <div style={{ display: "flex", gap: "24px" }}>
              <div>
                <span style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--text-secondary)", display: "block" }}>Total Students</span>
                <span style={{ fontSize: "18px", fontWeight: 700 }}>{stats.total}</span>
              </div>
              <div>
                <span style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--text-secondary)", display: "block" }}>Present</span>
                <span style={{ fontSize: "18px", fontWeight: 700, color: "var(--accent-success)" }}>{stats.present}</span>
              </div>
              <div>
                <span style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--text-secondary)", display: "block" }}>Absent</span>
                <span style={{ fontSize: "18px", fontWeight: 700, color: "var(--accent-error)" }}>{stats.absent}</span>
              </div>
              <div>
                <span style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--text-secondary)", display: "block" }}>Late</span>
                <span style={{ fontSize: "18px", fontWeight: 700, color: "var(--accent-warning)" }}>{stats.late}</span>
              </div>
              <div>
                <span style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--text-secondary)", display: "block" }}>Half Day</span>
                <span style={{ fontSize: "18px", fontWeight: 700 }}>{stats.halfDay}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="gap-8">
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Set all as:</span>
              <Button variant="secondary" size="sm" onClick={() => handleMarkAll("present")}>Present</Button>
              <Button variant="secondary" size="sm" onClick={() => handleMarkAll("absent")} style={{ color: "var(--accent-error)" }}>Absent</Button>
            </div>
          </div>

          {/* Student Grid Sheet */}
          <div className="table-container mb-16">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: "100px" }}>Roll Number</th>
                  <th>Student Name</th>
                  <th style={{ textAlign: "center" }}>Status Markings</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const currentStatus = attendanceRecords[student._id] || "present";
                  return (
                    <tr key={student._id}>
                      <td style={{ fontWeight: 700 }}>{student.rollNumber}</td>
                      <td style={{ fontWeight: 600 }}>{student.name}</td>
                      <td>
                        <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                          <button
                            onClick={() => handleStatusChange(student._id, "present")}
                            className={`status-pill ${currentStatus === "present" ? "active-present" : ""}`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => handleStatusChange(student._id, "late")}
                            className={`status-pill ${currentStatus === "late" ? "active-late" : ""}`}
                          >
                            Late
                          </button>
                          <button
                            onClick={() => handleStatusChange(student._id, "half_day")}
                            className={`status-pill ${currentStatus === "half_day" ? "active-half" : ""}`}
                          >
                            Half Day
                          </button>
                          <button
                            onClick={() => handleStatusChange(student._id, "absent")}
                            className={`status-pill ${currentStatus === "absent" ? "active-absent" : ""}`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Submit Panel */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={submitAttendance} loading={loading} className="gap-8">
              <UserCheck size={16} />
              <span>Submit Attendance Sheet</span>
            </Button>
          </div>
        </div>
      )}

      {/* Empty Initial Screen */}
      {!loaded && !loading && (
        <div className="empty-state">
          <CalendarCheck className="empty-state-icon" size={40} />
          <h3 className="empty-state-title">Select Class Parameters</h3>
          <p style={{ fontSize: "14px" }}>Select a class, section, and date to display the attendance sheet workspace.</p>
        </div>
      )}

      <style>{`
        .status-pill {
          border: 1px solid var(--border-color);
          background-color: var(--bg-primary);
          color: var(--text-secondary);
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          border-radius: var(--radius-sm);
          transition: all 0.15s ease;
          width: 90px;
          text-align: center;
        }
        .status-pill:hover {
          background-color: var(--bg-secondary);
          border-color: var(--text-primary);
          color: var(--text-primary);
        }
        .active-present {
          background-color: var(--accent-success);
          border-color: var(--accent-success);
          color: white !important;
        }
        .active-absent {
          background-color: var(--accent-error);
          border-color: var(--accent-error);
          color: white !important;
        }
        .active-late {
          background-color: var(--accent-warning);
          border-color: var(--accent-warning);
          color: white !important;
        }
        .active-half {
          background-color: #555555;
          border-color: #555555;
          color: white !important;
        }
      `}</style>
    </div>
  );
};

export default Attendance;
