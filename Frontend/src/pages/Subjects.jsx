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
  BookOpen
} from "lucide-react";
import Button from "../components/UI/Button";
import Input from "../components/UI/Input";
import Modal from "../components/UI/Modal";

const Subjects = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("");
  
  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Form inputs
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [className, setClassName] = useState("");
  
  // Feedback
  const [formError, setFormError] = useState("");
  const [notification, setNotification] = useState({ type: "", message: "" });

  const isAdmin = user && user.role === "school_admin";

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await api.subjects.getAll();
      setSubjects(res);
    } catch (err) {
      console.error(err);
      showNotification("danger", "Failed to retrieve subjects catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: "", message: "" }), 4000);
  };

  const handleOpenAdd = () => {
    setFormError("");
    setName("");
    setCode("");
    setClassName("");
    setIsAddOpen(true);
  };

  const handleOpenEdit = (subject) => {
    setFormError("");
    setSelectedSubject(subject);
    setName(subject.name);
    setCode(subject.code || "");
    setClassName(subject.className || "");
    setIsEditOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      await api.subjects.create({
        name,
        code,
        className,
      });
      setIsAddOpen(false);
      showNotification("success", "Subject added to the catalog.");
      fetchSubjects();
    } catch (err) {
      setFormError(err.message || "Failed to create subject.");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      await api.subjects.update(selectedSubject._id, {
        name,
        code,
        className,
      });
      setIsEditOpen(false);
      showNotification("success", "Subject updated successfully.");
      fetchSubjects();
    } catch (err) {
      setFormError(err.message || "Failed to update subject.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this subject from the catalog?")) return;
    try {
      await api.subjects.delete(id);
      showNotification("success", "Subject removed.");
      fetchSubjects();
    } catch (err) {
      showNotification("danger", err.message || "Failed to remove subject.");
    }
  };

  // Filter & Search logic
  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch = 
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subject.code && subject.code.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesClass = classFilter === "" || subject.className === classFilter;

    return matchesSearch && matchesClass && subject.active;
  });

  const uniqueClasses = [...new Set(subjects.map((s) => s.className).filter(Boolean))].sort();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Subjects Catalog</h1>
          <p className="page-subtitle">Configure courses and assign school classes</p>
        </div>
        {isAdmin && (
          <Button onClick={handleOpenAdd} className="gap-8">
            <Plus size={16} />
            <span>Add Subject</span>
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

      {/* Search & Filter Bar */}
      <div className="filters-bar">
        <div className="form-group" style={{ flex: 2 }}>
          <label className="form-label">Search Courses</label>
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by subject name or code..."
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
      </div>

      {/* Table Section */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "48px" }}>
          <span>Loading subjects directory...</span>
        </div>
      ) : filteredSubjects.length > 0 ? (
        <div className="table-container" style={{ maxWidth: "800px" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Subject Name</th>
                <th>Assigned Class</th>
                {isAdmin && <th style={{ textAlign: "right", width: "120px" }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.map((sub) => (
                <tr key={sub._id}>
                  <td style={{ fontWeight: 700 }}>{sub.code || "—"}</td>
                  <td>{sub.name}</td>
                  <td>{sub.className ? `Class ${sub.className}` : "General"}</td>
                  {isAdmin && (
                    <td>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => handleOpenEdit(sub)}
                          style={{ padding: "6px" }}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm" 
                          onClick={() => handleDelete(sub._id)}
                          style={{ padding: "6px", backgroundColor: "rgba(243, 18, 96, 0.1)", color: "var(--accent-error)" }}
                        >
                          <Trash2 size={14} />
                        </Button>
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
          <BookOpen className="empty-state-icon" size={40} />
          <h3 className="empty-state-title">No Subjects Configured</h3>
          <p style={{ fontSize: "14px" }}>Configure your school curriculum by adding subjects.</p>
        </div>
      )}

      {/* Add Subject Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Subject to Curriculum"
        footer={
          <div className="gap-12" style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSubmit}>Save Subject</Button>
          </div>
        }
      >
        {formError && <div className="alert-box alert-danger">{formError}</div>}
        <form onSubmit={handleAddSubmit}>
          <Input label="Subject Name" id="name" placeholder="E.g. Mathematics" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Course Code" id="code" placeholder="E.g. MATH101" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
          <Input label="Target Class (Optional)" id="className" placeholder="E.g. 10" value={className} onChange={(e) => setClassName(e.target.value)} />
        </form>
      </Modal>

      {/* Edit Subject Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Modify Subject details"
        footer={
          <div className="gap-12" style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit}>Save Changes</Button>
          </div>
        }
      >
        {formError && <div className="alert-box alert-danger">{formError}</div>}
        <form onSubmit={handleEditSubmit}>
          <Input label="Subject Name" id="editName" placeholder="E.g. Mathematics" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Course Code" id="editCode" placeholder="E.g. MATH101" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
          <Input label="Target Class (Optional)" id="editClassName" placeholder="E.g. 10" value={className} onChange={(e) => setClassName(e.target.value)} />
        </form>
      </Modal>
    </div>
  );
};

export default Subjects;
