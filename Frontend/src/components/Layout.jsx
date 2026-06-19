import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUploadUrl } from "../services/api";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  CreditCard,
  Award,
  Settings,
  LogOut,
  Menu,
  X,
  Book,
} from "lucide-react";

const Layout = ({ children }) => {
  const { user, school, logout, academicYear, setAcademicYear } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobileMenu = () => setMobileOpen(!mobileOpen);

  const allMenuItems = [
    {
      path: "/dashboard",
      name: "Dashboard",
      icon: LayoutDashboard,
      roles: ["school_admin", "teacher", "accountant", "clerk"],
    },
    {
      path: "/students",
      name: "Students",
      icon: Users,
      roles: ["school_admin", "teacher", "accountant", "clerk"],
    },
    {
      path: "/teachers",
      name: "Teachers",
      icon: GraduationCap,
      roles: ["school_admin"],
    },
    {
      path: "/subjects",
      name: "Subjects",
      icon: BookOpen,
      roles: ["school_admin", "teacher"],
    },
    {
      path: "/attendance",
      name: "Attendance",
      icon: CalendarCheck,
      roles: ["school_admin", "teacher", "clerk"],
    },
    {
      path: "/fees",
      name: "Fees & Finance",
      icon: CreditCard,
      roles: ["school_admin", "accountant"],
    },
    {
      path: "/results",
      name: "Examinations",
      icon: Award,
      roles: ["school_admin", "teacher"],
    },
    {
      path: "/settings",
      name: "School Profile",
      icon: Settings,
      roles: ["school_admin"],
    },
  ];

  // Filter menu items by user role
  const menuItems = allMenuItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "school_admin":
        return "Admin";
      case "teacher":
        return "Teacher";
      case "accountant":
        return "Accountant";
      case "clerk":
        return "Clerk";
      default:
        return role;
    }
  };

  // Get active menu name for page title context
  const activeItem = menuItems.find((item) => item.path === location.pathname);

  // Construct logo URL or display block text
  const logoUrl = getUploadUrl(school?.logo);

  // Provide default academic years if none configured
  const schoolYears = school && school.academicYears && school.academicYears.length > 0
    ? school.academicYears
    : ["2023-24", "2024-25", "2025-26", "2026-27"];

  return (
    <div className="app-container">
      {/* Mobile Toggle Bar */}
      <div 
        style={{
          display: "none",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "64px",
          backgroundColor: "var(--bg-primary)",
          borderBottom: "1px solid var(--border-color)",
          zIndex: 200,
          padding: "0 20px",
          alignItems: "center",
          justifyContent: "space-between"
        }}
        className="mobile-header"
      >
        <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px" }}>SKOOLER</span>
        <button 
          onClick={toggleMobileMenu} 
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside 
        className="sidebar"
        style={{
          transform: mobileOpen ? "translateX(0)" : "",
        }}
      >
        <div className="sidebar-logo">
          <Book size={22} style={{ marginRight: "10px" }} />
          <span>SKOOLER</span>
        </div>

        {/* Academic Year Selector in Sidebar */}
        <div style={{ padding: "16px 20px 0 20px" }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: "10px", color: "var(--text-secondary)", textTransform: "uppercase" }}>
              Academic Year
            </label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="form-control"
              style={{
                padding: "6px 10px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                borderRadius: "var(--radius-sm)"
              }}
            >
              {schoolYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Sidebar Navigation Menu */}
        <ul className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li 
                key={item.path} 
                className={`sidebar-item ${isActive ? "active" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                <Link to={item.path}>
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Sidebar Footer / User Logout Section */}
        <div className="sidebar-footer">
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ fontSize: "13px", fontWeight: 700 }} className="text-truncate">
              {user?.name || "User"}
            </span>
            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
              {user?.email || ""}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-secondary btn-sm"
            style={{ width: "100%", justifyContent: "flex-start", gap: "8px", border: "1px solid var(--border-color)" }}
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Page Layout Wrapper */}
      <div className="main-content">
        <header className="navbar">
          <div className="navbar-brand">
            {logoUrl ? (
              <img src={logoUrl} alt="School Logo" className="school-logo-img" />
            ) : (
              <div 
                style={{ 
                  width: "32px", 
                  height: "32px", 
                  borderRadius: "50%", 
                  backgroundColor: "var(--primary)", 
                  color: "var(--bg-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: 800
                }}
              >
                {school?.name ? school.name.charAt(0).toUpperCase() : "S"}
              </div>
            )}
            <span style={{ fontWeight: 700, fontSize: "16px" }}>
              {school?.name || "Loading School..."}
            </span>
          </div>

          <div className="navbar-user">
            <span 
              className="badge badge-black" 
              style={{ padding: "3px 8px", fontSize: "10px" }}
            >
              {getRoleLabel(user?.role)}
            </span>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>
              Session: <strong>{academicYear}</strong>
            </span>
          </div>
        </header>

        <main className="page-container">
          {children}
        </main>
      </div>

      <style>{`
        .text-truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        @media (max-width: 768px) {
          .mobile-header {
            display: flex !important;
          }
          .sidebar {
            position: fixed;
            top: 64px;
            left: 0;
            width: 100vw;
            height: calc(100vh - 64px);
            transform: translateX(-100%);
            z-index: 150;
            border-bottom: none;
            background-color: var(--bg-primary);
          }
          .sidebar-logo {
            display: none;
          }
          .sidebar-menu {
            flex-direction: column !important;
            overflow-y: auto;
          }
          .main-content {
            margin-top: 64px;
            margin-left: 0 !important;
          }
          .navbar {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;
