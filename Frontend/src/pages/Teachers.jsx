import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertCircle, 
  CheckCircle,
  GraduationCap
} from "lucide-react";
import Button from "../components/UI/Button";
import Input from "../components/UI/Input";
import Modal from "../components/UI/Modal";

const Teachers = () => {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // Form inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Success & Error feedback
  const [formError, setFormError] = useState("");
  const [notification, setNotification] = useState({ type: "", message: "" });

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await api.teachers.getAll();
      setTeachers(res);
    } catch (err) {
      console.error(err);
      showNotification("danger", "Failed to load teacher directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: "", message: "" }), 4000);
  };

  const handleOpenAdd = () => {
    setFormError("");
    setName("");
    setEmail("");
    setPassword("");
    setIsAddOpen(true);
  };

  const handleOpenEdit = (teacher) => {
    setFormError("");
    setSelectedTeacher(teacher);
    setName(teacher.name);
    setEmail(teacher.email);
    setPassword(""); // Leave blank unless changing
    setIsEditOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      await api.teachers.create({
        name,
        email,
        password,
      });
      setIsAddOpen(false);
      showNotification("success", "Teacher account created successfully.");
      fetchTeachers();
    } catch (err) {
      setFormError(err.message || "Failed to create teacher account. Check email rules.");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      const payload = { name, email };
      if (password) {
        payload.password = password;
      }
      await api.teachers.update(selectedTeacher._id, payload);
      setIsEditOpen(false);
      showNotification("success", "Teacher details updated successfully.");
      fetchTeachers();
    } catch (err) {
      setFormError(err.message || "Failed to update teacher profile.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deactivating this teacher will block their access. Do you want to continue?")) return;
    try {
      await api.teachers.delete(id);
      showNotification("success", "Teacher deactivated.");
      fetchTeachers();
    } catch (err) {
      showNotification("danger", err.message || "Failed to deactivate teacher.");
    }
  };

  // Search filter
  const filteredTeachers = teachers.filter((teacher) => {
    return (
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Teachers Directory</h1>
          <p className="page-subtitle">Manage accounts and credentials for teaching staff</p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-8">
          <Plus size={16} />
          <span>Add Teacher</span>
        </Button>
      </div>

      {/* Floating Notifications */}
      {notification.message && (
        <div className={`alert-box alert-${notification.type}`} style={{ position: "fixed", top: "20px", right: "20px", zIndex: 1050, width: "320px", boxShadow: "var(--shadow-lg)" }}>
          {notification.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="filters-bar">
        <div className="form-group" style={{ flex: 1, margin: 0 }}>
          <label className="form-label">Search Staff</label>
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by teacher name or email..."
              style={{ paddingLeft: "36px" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "48px" }}>
          <span>Loading teachers directory...</span>
        </div>
      ) : filteredTeachers.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((teacher) => (
                <tr key={teacher._id}>
                  <td style={{ fontWeight: 600 }}>{teacher.name}</td>
                  <td>{teacher.email}</td>
                  <td>
                    <span className="badge badge-default" style={{ fontSize: "10px" }}>
                      Teacher
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${teacher.active ? "success" : "danger"}`}>
                      {teacher.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => handleOpenEdit(teacher)}
                        style={{ padding: "6px" }}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleDelete(teacher._id)}
                        style={{ padding: "6px", backgroundColor: "rgba(243, 18, 96, 0.1)", color: "var(--accent-error)" }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <GraduationCap className="empty-state-icon" size={40} />
          <h3 className="empty-state-title">No Teachers Registered</h3>
          <p style={{ fontSize: "14px" }}>Click "Add Teacher" to register your school's teaching staff.</p>
        </div>
      )}

      {/* Add Teacher Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register New Teacher"
        footer={
          <div className="gap-12" style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSubmit}>Create Account</Button>
          </div>
        }
      >
        {formError && <div className="alert-box alert-danger">{formError}</div>}
        <form onSubmit={handleAddSubmit}>
          <Input label="Teacher Name" id="name" placeholder="E.g. Mr. Robert Frost" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Email Address" id="email" type="email" placeholder="E.g. robert@school.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Login Password" id="password" type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </form>
      </Modal>

      {/* Edit Teacher Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Update Teacher Credentials"
        footer={
          <div className="gap-12" style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit}>Save Changes</Button>
          </div>
        }
      >
        {formError && <div className="alert-box alert-danger">{formError}</div>}
        <form onSubmit={handleEditSubmit}>
          <Input label="Teacher Name" id="editName" placeholder="E.g. Mr. Robert Frost" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Email Address" id="editEmail" type="email" placeholder="E.g. robert@school.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Update Password" id="editPassword" type="password" placeholder="Leave blank to keep current password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </form>
      </Modal>
    </div>
  );
};

export default Teachers;
