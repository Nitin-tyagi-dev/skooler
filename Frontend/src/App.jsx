import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Auth from "./pages/Auth";
import Overview from "./pages/Overview";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Subjects from "./pages/Subjects";
import Attendance from "./pages/Attendance";
import Fees from "./pages/Fees";
import Results from "./pages/Results";
import Settings from "./pages/Settings";
import { RefreshCw, ShieldAlert } from "lucide-react";
import Button from "./components/UI/Button";

// Auth Guard: Redirects to /login if the session is unauthenticated
const AuthGuard = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "var(--bg-secondary)" }}>
        <RefreshCw className="animate-spin" style={{ animation: "spin 1s linear infinite" }} size={32} />
        <span style={{ marginLeft: "12px", fontSize: "14px" }}>Authenticating session...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Role Guard: Restricts routing pages based on User roles
const RoleGuard = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div 
        style={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          justifyContent: "center", 
          minHeight: "60vh",
          textAlign: "center"
        }}
      >
        <ShieldAlert size={48} style={{ color: "var(--accent-error)", marginBottom: "16px" }} />
        <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>403 - Access Denied</h2>
        <p style={{ color: "var(--text-secondary)", maxWidth: "450px", fontSize: "14px", marginBottom: "20px" }}>
          You do not have the necessary security clearings or roles to view this module. If this is an error, please reach out to your administrator.
        </p>
        <Button onClick={() => window.history.back()} variant="secondary" size="sm">
          Go Back
        </Button>
      </div>
    );
  }

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication page */}
          <Route path="/login" element={<Auth />} />

          {/* Protected Administrative views */}
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <Layout>
                  <Overview />
                </Layout>
              </AuthGuard>
            }
          />
          <Route
            path="/students"
            element={
              <AuthGuard>
                <Layout>
                  <Students />
                </Layout>
              </AuthGuard>
            }
          />
          <Route
            path="/teachers"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={["school_admin"]}>
                  <Layout>
                    <Teachers />
                  </Layout>
                </RoleGuard>
              </AuthGuard>
            }
          />
          <Route
            path="/subjects"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={["school_admin", "teacher"]}>
                  <Layout>
                    <Subjects />
                  </Layout>
                </RoleGuard>
              </AuthGuard>
            }
          />
          <Route
            path="/attendance"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={["school_admin", "teacher", "clerk"]}>
                  <Layout>
                    <Attendance />
                  </Layout>
                </RoleGuard>
              </AuthGuard>
            }
          />
          <Route
            path="/fees"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={["school_admin", "accountant"]}>
                  <Layout>
                    <Fees />
                  </Layout>
                </RoleGuard>
              </AuthGuard>
            }
          />
          <Route
            path="/results"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={["school_admin", "teacher"]}>
                  <Layout>
                    <Results />
                  </Layout>
                </RoleGuard>
              </AuthGuard>
            }
          />
          <Route
            path="/settings"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={["school_admin"]}>
                  <Layout>
                    <Settings />
                  </Layout>
                </RoleGuard>
              </AuthGuard>
            }
          />

          {/* Fallback paths */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
