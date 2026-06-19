import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Input from "../components/UI/Input";
import Button from "../components/UI/Button";
import { AlertCircle, CheckCircle } from "lucide-react";

const Auth = () => {
  const { login, register, error: authError } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login"); // 'login' or 'register'
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Register Form State
  const [schoolName, setSchoolName] = useState("");
  const [schoolCode, setSchoolCode] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  
  // Loading & Local Error states
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [formError, setFormError] = useState("");

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setLoading(true);
    try {
      const success = await login(loginEmail, loginPassword);
      if (success) {
        navigate("/dashboard");
      }
    } catch (err) {
      setFormError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setLoading(true);
    try {
      const success = await register(
        schoolName,
        schoolCode,
        adminName,
        adminEmail,
        adminPassword
      );
      if (success) {
        setSuccessMsg("School registered successfully!");
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      }
    } catch (err) {
      setFormError(err.message || "Registration failed. Try a different school code or email.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFormError("");
    setSuccessMsg("");
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">SKOOLER</div>
          <p className="auth-subtitle">School Administration Platform</p>
        </div>

        {/* Auth Navigation Tabs */}
        <div className="tabs" style={{ justifyContent: "center" }}>
          <button
            onClick={() => handleTabChange("login")}
            className={`tab-btn ${activeTab === "login" ? "active" : ""}`}
            style={{ width: "50%" }}
          >
            Sign In
          </button>
          <button
            onClick={() => handleTabChange("register")}
            className={`tab-btn ${activeTab === "register" ? "active" : ""}`}
            style={{ width: "50%" }}
          >
            Register School
          </button>
        </div>

        {/* Global Success Alert */}
        {successMsg && (
          <div className="alert-box alert-success">
            <CheckCircle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Global Error Alert */}
        {formError && (
          <div className="alert-box alert-danger">
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
            <span>{formError}</span>
          </div>
        )}

        {/* Sign In Form */}
        {activeTab === "login" && (
          <form onSubmit={handleLoginSubmit}>
            <Input
              label="Email Address"
              id="loginEmail"
              type="email"
              placeholder="admin@school.com"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              id="loginPassword"
              type="password"
              placeholder="••••••••"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />
            <Button
              type="submit"
              loading={loading}
              style={{ width: "100%", marginTop: "12px" }}
            >
              Sign In
            </Button>
          </form>
        )}

        {/* Register School Form */}
        {activeTab === "register" && (
          <form onSubmit={handleRegisterSubmit}>
            <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              School Details
            </h4>
            <Input
              label="School Name"
              id="schoolName"
              placeholder="St. Mary High School"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              required
            />
            <Input
              label="School Code (Unique Short Name)"
              id="schoolCode"
              placeholder="SMHS"
              value={schoolCode}
              onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
              required
            />

            <h4 style={{ fontSize: "14px", fontWeight: 700, margin: "24px 0 16px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Admin Account Details
            </h4>
            <Input
              label="Administrator Name"
              id="adminName"
              placeholder="Principal John Doe"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              required
            />
            <Input
              label="Administrator Email"
              id="adminEmail"
              type="email"
              placeholder="principal@smhs.com"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              id="adminPassword"
              type="password"
              placeholder="Min 6 characters"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              loading={loading}
              style={{ width: "100%", marginTop: "16px" }}
            >
              Register & Set Up
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;
