import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  CreditCard, 
  CalendarCheck,
  RefreshCw,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import Button from "../components/UI/Button";

const Overview = () => {
  const { academicYear, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      // If user is accountant, dashboard details might be limited to fees.
      // If user is admin/teacher/clerk, full dashboard is returned.
      // Wait, getAdminDashboard is role restricted to school_admin.
      // For teachers, clerks, and accountants, they can't access getAdminDashboard!
      // Let's check how Backend handles dashboard access. In dashboard.routes.js:
      // router.get("/:academicYear", authMiddleware, schoolMiddleware, roleMiddleware(["school_admin"]), getAdminDashboard);
      // Ah! Only school_admin can access this route!
      // If user is teacher, clerk, or accountant, let's display an access notice or simplified local overview.
      if (user.role === "school_admin") {
        const res = await api.dashboard.get(academicYear);
        setData(res);
      } else {
        setData({
          nonAdmin: true,
          role: user.role
        });
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [academicYear, user]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <RefreshCw className="animate-spin" style={{ animation: "spin 1s linear infinite" }} size={32} />
        <span style={{ marginLeft: "12px", fontSize: "14px" }}>Loading dashboard analytics...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert-box alert-danger">
        <AlertCircle size={18} style={{ flexShrink: 0 }} />
        <span>{error}</span>
        <Button variant="secondary" size="sm" onClick={fetchDashboardData} style={{ marginLeft: "auto" }}>
          Retry
        </Button>
      </div>
    );
  }

  if (data?.nonAdmin) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Welcome back, {user.name}</h1>
            <p className="page-subtitle">Your roles: {user.role.toUpperCase()}</p>
          </div>
        </div>
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "40px", alignItems: "center", textAlign: "center" }}>
          <Users size={48} style={{ color: "var(--text-secondary)" }} />
          <h2 style={{ fontSize: "20px", fontWeight: 700 }}>School Management Console</h2>
          <p style={{ color: "var(--text-secondary)", maxWidth: "500px", fontSize: "14px" }}>
            As a <strong>{user.role}</strong>, you have access to specific modules using the left navigation sidebar.
            Select a menu item to manage students, input marks, log attendance, or record fee ledgers.
          </p>
        </div>
      </div>
    );
  }

  const { students, teachers, subjects, fees, attendanceToday } = data || {};

  // Compute attendance percentage
  const attendanceRate = attendanceToday?.totalMarked > 0
    ? Math.round(((attendanceToday.summary.present + attendanceToday.summary.late + attendanceToday.summary.half_day * 0.5) / attendanceToday.totalMarked) * 100)
    : null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Overview</h1>
          <p className="page-subtitle">School performance and statistics for Academic Year {academicYear}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchDashboardData} className="gap-8">
          <RefreshCw size={14} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Main Stats Grid */}
      <div className="stats-grid">
        <div className="card stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="stat-label">Total Students</span>
            <Users size={16} className="text-muted" />
          </div>
          <span className="stat-value">{students?.total || 0}</span>
          <span className="stat-desc">Active enrollments</span>
        </div>

        <div className="card stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="stat-label">Total Teachers</span>
            <GraduationCap size={16} className="text-muted" />
          </div>
          <span className="stat-value">{teachers?.total || 0}</span>
          <span className="stat-desc">Assigned teaching staff</span>
        </div>

        <div className="card stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="stat-label">Subjects Catalog</span>
            <BookOpen size={16} className="text-muted" />
          </div>
          <span className="stat-value">{subjects?.total || 0}</span>
          <span className="stat-desc">Academic courses taught</span>
        </div>

        <div className="card stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="stat-label">Attendance Today</span>
            <CalendarCheck size={16} className="text-muted" />
          </div>
          <span className="stat-value">{attendanceRate !== null ? `${attendanceRate}%` : "N/A"}</span>
          <span className="stat-desc">
            {attendanceToday?.totalMarked > 0 
              ? `${attendanceToday.summary.present} present of ${attendanceToday.totalMarked} students`
              : "No attendance logged today"}
          </span>
        </div>
      </div>

      <div className="grid-2">
        {/* Fees and Collections Overview */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Fee Collections</h3>
            <CreditCard size={18} className="text-muted" />
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: "28px", fontWeight: 800 }}>
                ${fees?.totalCollected?.toLocaleString() || 0}
              </span>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Collected of ${fees?.totalExpected?.toLocaleString() || 0}
              </span>
            </div>
            
            {/* Progress bar */}
            <div style={{ width: "100%", height: "6px", backgroundColor: "var(--bg-accent)", borderRadius: "3px", overflow: "hidden" }}>
              <div 
                style={{ 
                  height: "100%", 
                  backgroundColor: "var(--primary)", 
                  width: `${fees?.totalExpected > 0 ? (fees.totalCollected / fees.totalExpected) * 100 : 0}%` 
                }} 
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", paddingTop: "12px", borderTop: "1px solid var(--border-color)" }}>
            <div>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", textTransform: "uppercase" }}>Pending Balance</span>
              <span style={{ fontSize: "16px", fontWeight: 700, color: fees?.totalPending > 0 ? "var(--accent-warning)" : "inherit" }}>
                ${fees?.totalPending?.toLocaleString() || 0}
              </span>
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", textTransform: "uppercase" }}>Collection Rate</span>
              <span style={{ fontSize: "16px", fontWeight: 700 }}>
                {fees?.totalExpected > 0 ? Math.round((fees.totalCollected / fees.totalExpected) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Student Enrollments by Classroom */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Enrollment by Class</h3>
            <TrendingUp size={18} className="text-muted" />
          </div>

          {students?.byClass && students.byClass.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "190px", overflowY: "auto" }}>
              {students.byClass.map((c) => (
                <div key={c.className} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, width: "80px" }}>Class {c.className}</span>
                  <div style={{ flex: 1, height: "6px", backgroundColor: "var(--bg-accent)", borderRadius: "3px", overflow: "hidden" }}>
                    <div 
                      style={{ 
                        height: "100%", 
                        backgroundColor: "var(--primary)", 
                        width: `${students.total > 0 ? (c.count / students.total) * 100 : 0}%` 
                      }} 
                    />
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 700, width: "30px", textAlign: "right" }}>{c.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: "20px" }}>
              <span style={{ fontSize: "12px" }}>No students registered in any class.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;
