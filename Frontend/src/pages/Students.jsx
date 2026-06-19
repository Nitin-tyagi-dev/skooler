import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api, getUploadUrl } from "../services/api";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Camera, 
  AlertCircle, 
  CheckCircle,
  Users
} from "lucide-react";
import Button from "../components/UI/Button";
import Input from "../components/UI/Input";
import Modal from "../components/UI/Modal";

const Students = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  
  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Form inputs
  const [name, setName] = useState("");
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  
  // File upload state
  const [photoFile, setPhotoFile] = useState(null);
  
  // Success & Error feedback
  const [formError, setFormError] = useState("");
  const [notification, setNotification] = useState({ type: "", message: "" });
  
  // Permission checks
  const canModify = user && (user.role === "school_admin" || user.role === "clerk");
  const canDelete = user && user.role === "school_admin";

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.students.getAll();
      setStudents(res);
    } catch (err) {
      console.error(err);
      showNotification("danger", "Failed to fetch student directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: "", message: "" }), 4000);
  };

  const handleOpenAdd = () => {
    setFormError("");
    setName("");
    setClassName("");
    setSection("");
    setRollNumber("");
    setGuardianName("");
    setGuardianPhone("");
    setIsAddOpen(true);
  };

  const handleOpenEdit = (student) => {
    setFormError("");
    setSelectedStudent(student);
    setName(student.name);
    setClassName(student.className);
    setSection(student.section);
    setRollNumber(student.rollNumber);
    setGuardianName(student.guardianName);
    setGuardianPhone(student.guardianPhone);
    setIsEditOpen(true);
  };

  const handleOpenPhoto = (student) => {
    setFormError("");
    setSelectedStudent(student);
    setPhotoFile(null);
    setIsPhotoOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      await api.students.create({
        name,
        className,
        section,
        rollNumber,
        guardianName,
        guardianPhone,
      });
      setIsAddOpen(false);
      showNotification("success", "Student registered successfully.");
      fetchStudents();
    } catch (err) {
      setFormError(err.message || "Failed to add student. Verify input rules.");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      await api.students.update(selectedStudent._id, {
        name,
        className,
        section,
        rollNumber,
        guardianName,
        guardianPhone,
      });
      setIsEditOpen(false);
      showNotification("success", "Student profile updated successfully.");
      fetchStudents();
    } catch (err) {
      setFormError(err.message || "Failed to update student profile.");
    }
  };

  const handlePhotoSubmit = async (e) => {
    e.preventDefault();
    if (!photoFile) {
      setFormError("Please select an image file first.");
      return;
    }
    setFormError("");
    
    const formData = new FormData();
    formData.append("photo", photoFile);

    try {
      await api.students.uploadPhoto(selectedStudent._id, formData);
      setIsPhotoOpen(false);
      showNotification("success", "Student photo uploaded successfully.");
      fetchStudents();
    } catch (err) {
      setFormError(err.message || "Failed to upload photo. Ensure format is JPG/PNG (Max 2MB).");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student record?")) return;
    try {
      await api.students.delete(id);
      showNotification("success", "Student record removed.");
      fetchStudents();
    } catch (err) {
      showNotification("danger", err.message || "Failed to delete student record.");
    }
  };

  // Filter & Search logic
  const filteredStudents = students.filter((student) => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.guardianName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = classFilter === "" || student.className === classFilter;
    const matchesSection = sectionFilter === "" || student.section.toLowerCase() === sectionFilter.toLowerCase();

    return matchesSearch && matchesClass && matchesSection && student.active;
  });

  // Extract unique classes and sections for filters
  const uniqueClasses = [...new Set(students.map((s) => s.className))].sort();
  const uniqueSections = [...new Set(students.map((s) => s.section))].sort();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Students Directory</h1>
          <p className="page-subtitle">View, search and manage registered students</p>
        </div>
        {canModify && (
          <Button onClick={handleOpenAdd} className="gap-8">
            <Plus size={16} />
            <span>Add Student</span>
          </Button>
        )}
      </div>

      {/* Floating Notifications */}
      {notification.message && (
        <div className={`alert-box alert-${notification.type}`} style={{ position: "fixed", top: "20px", right: "20px", zIndex: 1050, width: "320px", boxShadow: "var(--shadow-lg)" }}>
          {notification.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="filters-bar">
        <div className="form-group" style={{ flex: 2 }}>
          <label className="form-label">Search</label>
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, roll, guardian..."
              style={{ paddingLeft: "36px" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Class</label>
          <select className="form-control" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
            <option value="">All Classes</option>
            {uniqueClasses.map((c) => (
              <option key={c} value={c}>Class {c}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Section</label>
          <select className="form-control" value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}>
            <option value="">All Sections</option>
            {uniqueSections.map((s) => (
              <option key={s} value={s}>{s.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Section */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "48px" }}>
          <span>Loading student directory...</span>
        </div>
      ) : filteredStudents.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: "64px" }}>Photo</th>
                <th>Roll No</th>
                <th>Name</th>
                <th>Class & Sec</th>
                <th>Guardian</th>
                <th>Phone</th>
                {canModify && <th style={{ textAlign: "right" }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student._id}>
                  <td>
                    {student.photo ? (
                      <img 
                        src={getUploadUrl(student.photo)} 
                        alt={student.name} 
                        style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border-color)" }} 
                      />
                    ) : (
                      <div 
                        style={{ 
                          width: "36px", 
                          height: "36px", 
                          borderRadius: "50%", 
                          backgroundColor: "var(--bg-accent)", 
                          color: "var(--text-secondary)",
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center", 
                          fontSize: "11px", 
                          fontWeight: 700 
                        }}
                      >
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td style={{ fontWeight: 600 }}>{student.rollNumber}</td>
                  <td>{student.name}</td>
                  <td>Class {student.className} - {student.section.toUpperCase()}</td>
                  <td>{student.guardianName}</td>
                  <td>{student.guardianPhone}</td>
                  {canModify && (
                    <td>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => handleOpenPhoto(student)}
                          style={{ padding: "6px" }}
                          title="Upload Student Photo"
                        >
                          <Camera size={14} />
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => handleOpenEdit(student)}
                          style={{ padding: "6px" }}
                          title="Edit Student Info"
                        >
                          <Edit size={14} />
                        </Button>
                        {canDelete && (
                          <Button 
                            variant="danger" 
                            size="sm" 
                            onClick={() => handleDelete(student._id)}
                            style={{ padding: "6px", backgroundColor: "rgba(243, 18, 96, 0.1)", color: "var(--accent-error)" }}
                            title="Delete Student Record"
                          >
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <Users className="empty-state-icon" size={40} />
          <h3 className="empty-state-title">No Students Found</h3>
          <p style={{ fontSize: "14px" }}>We couldn't find any students matching those filter criteria.</p>
        </div>
      )}

      {/* Add Student Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register New Student"
        footer={
          <div className="gap-12" style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSubmit}>Save Student</Button>
          </div>
        }
      >
        {formError && <div className="alert-box alert-danger">{formError}</div>}
        <form onSubmit={handleAddSubmit}>
          <Input label="Student Name" id="name" placeholder="Alice Smith" value={name} onChange={(e) => setName(e.target.value)} required />
          
          <div className="grid-2">
            <Input label="Class" id="className" placeholder="10" value={className} onChange={(e) => setClassName(e.target.value)} required />
            <Input label="Section" id="section" placeholder="A" value={section} onChange={(e) => setSection(e.target.value)} required />
          </div>

          <Input label="Roll Number" id="rollNumber" placeholder="10A05" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} required />
          <Input label="Guardian Name" id="guardianName" placeholder="Robert Smith" value={guardianName} onChange={(e) => setGuardianName(e.target.value)} required />
          <Input label="Guardian Phone (10 Digits)" id="guardianPhone" placeholder="9876543210" value={guardianPhone} onChange={(e) => setGuardianPhone(e.target.value)} required />
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Student Profile"
        footer={
          <div className="gap-12" style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit}>Save Changes</Button>
          </div>
        }
      >
        {formError && <div className="alert-box alert-danger">{formError}</div>}
        <form onSubmit={handleEditSubmit}>
          <Input label="Student Name" id="editName" placeholder="Alice Smith" value={name} onChange={(e) => setName(e.target.value)} required />
          
          <div className="grid-2">
            <Input label="Class" id="editClassName" placeholder="10" value={className} onChange={(e) => setClassName(e.target.value)} required />
            <Input label="Section" id="editSection" placeholder="A" value={section} onChange={(e) => setSection(e.target.value)} required />
          </div>

          <Input label="Roll Number" id="editRollNumber" placeholder="10A05" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} required />
          <Input label="Guardian Name" id="editGuardianName" placeholder="Robert Smith" value={guardianName} onChange={(e) => setGuardianName(e.target.value)} required />
          <Input label="Guardian Phone" id="editGuardianPhone" placeholder="9876543210" value={guardianPhone} onChange={(e) => setGuardianPhone(e.target.value)} required />
        </form>
      </Modal>

      {/* Upload Photo Modal */}
      <Modal isOpen={isPhotoOpen} onClose={() => setIsPhotoOpen(false)} title="Upload Student Photo"
        footer={
          <div className="gap-12" style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => setIsPhotoOpen(false)}>Cancel</Button>
            <Button onClick={handlePhotoSubmit} disabled={!photoFile}>Upload Image</Button>
          </div>
        }
      >
        {formError && <div className="alert-box alert-danger">{formError}</div>}
        <form onSubmit={handlePhotoSubmit}>
          <div className="form-group">
            <span style={{ fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "8px" }}>Selected Student: {selectedStudent?.name}</span>
            
            <div className="avatar-upload-container">
              {photoFile ? (
                <img src={URL.createObjectURL(photoFile)} alt="Preview" className="avatar-preview" />
              ) : selectedStudent?.photo ? (
                <img src={getUploadUrl(selectedStudent.photo)} alt="Current" className="avatar-preview" />
              ) : (
                <div className="avatar-placeholder">
                  <Camera size={24} />
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files[0])}
                  style={{ display: "none" }}
                  id="photoInput"
                />
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => document.getElementById("photoInput").click()}
                >
                  Choose File
                </Button>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginTop: "4px" }}>
                  Supports JPG, PNG (Max 2MB)
                </span>
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Students;
