import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [academicYear, setAcademicYearState] = useState(() => {
    return localStorage.getItem("skooler_year") || "2025-26";
  });

  const setAcademicYear = (year) => {
    setAcademicYearState(year);
    localStorage.setItem("skooler_year", year);
  };

  const fetchProfile = async () => {
    try {
      const profile = await api.school.getProfile();
      setSchool(profile);
    } catch (err) {
      console.error("Failed to fetch school profile:", err);
    }
  };

  const loadSession = async () => {
    const token = localStorage.getItem("skooler_token");
    if (token) {
      const decoded = parseJwt(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        // Token is valid
        // Decode does not have full details, so we can fetch user profile or build from token.
        // Let's check protected route to verify token
        try {
          const check = await api.get("/protected");
          setUser({
            id: check.user.id,
            role: check.user.role,
            schoolId: check.user.schoolId,
            name: check.user.name || "User", // backend might return name or we default
            email: check.user.email
          });
          await fetchProfile();
        } catch (err) {
          console.error("Session restoration failed:", err);
          logout();
        }
      } else {
        logout();
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSession();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await api.auth.login({ email, password });
      localStorage.setItem("skooler_token", res.token);
      const decoded = parseJwt(res.token);
      
      // Let's get user metadata from check route
      const check = await api.get("/protected");
      setUser({
        id: check.user.id,
        role: check.user.role,
        schoolId: check.user.schoolId,
        name: check.user.name || "User",
        email: check.user.email
      });
      await fetchProfile();
      return true;
    } catch (err) {
      setError(err.message || "Login failed");
      throw err;
    }
  };

  const register = async (schoolName, schoolCode, name, email, password) => {
    setError(null);
    try {
      const res = await api.auth.register({
        schoolName,
        schoolCode,
        name,
        email,
        password,
      });
      localStorage.setItem("skooler_token", res.token);
      
      const check = await api.get("/protected");
      setUser({
        id: check.user.id,
        role: check.user.role,
        schoolId: check.user.schoolId,
        name: check.user.name || "User",
        email: check.user.email
      });
      await fetchProfile();
      return true;
    } catch (err) {
      setError(err.message || "Registration failed");
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("skooler_token");
    setUser(null);
    setSchool(null);
  };

  const updateSchoolProfile = async () => {
    await fetchProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        school,
        loading,
        error,
        academicYear,
        setAcademicYear,
        login,
        register,
        logout,
        updateSchoolProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
