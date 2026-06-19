import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api, getUploadUrl } from "../services/api";
import { 
  Settings as SettingsIcon,
  CheckCircle,
  AlertCircle,
  Upload,
  Plus,
  Trash2
} from "lucide-react";
import Button from "../components/UI/Button";
import Input from "../components/UI/Input";

const Settings = () => {
  const { school, updateSchoolProfile } = useAuth();
  
  // Form State
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [academicYears, setAcademicYears] = useState([]);
  
  // New academic year input
  const [newYearInput, setNewYearInput] = useState("");

  // Logo file state
  const [logoFile, setLogoFile] = useState(null);

  // States
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ type: "", message: "" });
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (school) {
      setName(school.name || "");
      setAddress(school.address || "");
      setPhone(school.contact?.phone || "");
      setEmail(school.contact?.email || "");
      setAcademicYears(school.academicYears || []);
    }
  }, [school]);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: "", message: "" }), 4000);
  };

  const handleAddAcademicYear = () => {
    // Validate year format like 2024-25
    const regex = /^\d{4}-\d{2}$/;
    if (!regex.test(newYearInput)) {
      setErrorMsg("Academic year must match the YYYY-YY format (e.g. 2024-25).");
      return;
    }

    if (academicYears.includes(newYearInput)) {
      setErrorMsg("This academic year has already been configured.");
      return;
    }

    setErrorMsg("");
    setAcademicYears((prev) => [...prev, newYearInput]);
    setNewYearInput("");
  };

  const handleRemoveAcademicYear = (yr) => {
    setAcademicYears((prev) => prev.filter((item) => item !== yr));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      await api.put("/school", {
        name,
        address,
        contact: {
          phone,
          email,
        },
        academicYears,
      });
      await updateSchoolProfile();
      showNotification("success", "School profile updated successfully.");
    } catch (err) {
      setErrorMsg(err.message || "Failed to update profile settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    e.preventDefault();
    if (!logoFile) return;
    setLoading(true);
    setErrorMsg("");

    const formData = new FormData();
    formData.append("logo", logoFile);

    try {
      await api.school.uploadLogo(formData);
      await updateSchoolProfile();
      setLogoFile(null);
      showNotification("success", "School logo uploaded and refreshed.");
    } catch (err) {
      setErrorMsg(err.message || "Failed to upload school logo.");
    } finally {
      setLoading(false);
    }
  };

  // Resolve current logo image
  const logoUrl = getUploadUrl(school?.logo);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">School Profile Settings</h1>
          <p className="page-subtitle">Configure school identity, logo, academic calendar semesters, and contact channels</p>
        </div>
      </div>

      {/* Floating notifications */}
      {notification.message && (
        <div className={`alert-box alert-${notification.type === "success" ? "success" : "default"}`} style={{ position: "fixed", top: "20px", right: "20px", zIndex: 1050, width: "320px", boxShadow: "var(--shadow-lg)" }}>
          {notification.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{notification.message}</span>
        </div>
      )}

      {errorMsg && (
        <div className="alert-box alert-danger">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid-2">
        {/* Left Side: General Profile Configuration */}
        <div className="card">
          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}>
            Identity Settings
          </h3>
          
          <form onSubmit={handleSaveProfile}>
            <Input label="School Name" id="schoolName" placeholder="E.g. St. Mary High School" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Address" id="address" type="textarea" placeholder="Enter school street and postal details" value={address} onChange={(e) => setAddress(e.target.value)} />
            
            <div className="grid-2">
              <Input label="Contact Phone" id="phone" placeholder="Telephone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Input label="Contact Email" id="email" type="email" placeholder="Billing/Admin support email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            {/* Academic Years Section */}
            <div style={{ margin: "20px 0 24px 0" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "8px" }}>Academic Years Support</span>
              
              <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="YYYY-YY (e.g. 2026-27)"
                  style={{ maxWidth: "200px" }}
                  value={newYearInput}
                  onChange={(e) => setNewYearInput(e.target.value)}
                />
                <Button variant="secondary" size="sm" onClick={handleAddAcademicYear} className="gap-8">
                  <Plus size={12} /> Add
                </Button>
              </div>

              {/* Configured years tags list */}
              {academicYears.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {academicYears.map((yr) => (
                    <div 
                      key={yr} 
                      className="badge badge-default gap-8" 
                      style={{ padding: "6px 12px", fontSize: "12px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)" }}
                    >
                      <span>{yr}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAcademicYear(yr)}
                        style={{ background: "none", border: "none", color: "var(--accent-error)", cursor: "pointer", fontSize: "14px", fontWeight: "bold" }}
                        title="Remove Year"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>No custom academic years set. Defaults to generic slots.</span>
              )}
            </div>

            <Button type="submit" loading={loading} style={{ width: "100%" }}>
              Save Profile Identity
            </Button>
          </form>
        </div>

        {/* Right Side: School Branding Logo Upload */}
        <div className="card" style={{ height: "fit-content" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}>
            School Logo & Branding
          </h3>
          
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0" }}>
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="School Branding" 
                style={{ width: "128px", height: "128px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border-color)", marginBottom: "24px" }} 
              />
            ) : (
              <div 
                style={{ 
                  width: "128px", 
                  height: "128px", 
                  borderRadius: "50%", 
                  backgroundColor: "var(--bg-accent)", 
                  color: "var(--text-secondary)",
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  fontSize: "36px",
                  fontWeight: 800,
                  border: "2px dashed var(--text-muted)",
                  marginBottom: "24px"
                }}
              >
                {school?.name ? school.name.charAt(0).toUpperCase() : "S"}
              </div>
            )}

            <form onSubmit={handleLogoUpload} style={{ width: "100%", textAlign: "center" }}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files[0])}
                style={{ display: "none" }}
                id="logoInput"
              />
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
                {logoFile && (
                  <span style={{ fontSize: "12px", fontWeight: 600 }}>Selected: {logoFile.name}</span>
                )}
                
                <div className="gap-8">
                  <Button 
                    variant="secondary" 
                    onClick={() => document.getElementById("logoInput").click()}
                    className="gap-8"
                  >
                    <Upload size={14} /> Choose File
                  </Button>
                  <Button 
                    type="submit" 
                    loading={loading} 
                    disabled={!logoFile}
                  >
                    Upload Logo
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
