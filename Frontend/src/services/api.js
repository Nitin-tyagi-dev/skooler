const API_BASE_URL = "http://localhost:5000/api";
export const UPLOAD_BASE_URL = "http://localhost:5000";

export const getUploadUrl = (filePath) => {
  if (!filePath) return null;
  const normalized = filePath.startsWith("/") ? filePath.slice(1) : filePath;
  return `${UPLOAD_BASE_URL}/${normalized}`;
};

const getHeaders = (isMultipart = false) => {
  const headers = {};
  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }
  const token = localStorage.getItem("skooler_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  if (response.status === 204) {
    return null;
  }
  
  let data;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = (data && data.message) || response.statusText || "Something went wrong";
    throw new Error(errorMsg);
  }

  return data;
};

export const api = {
  get: async (endpoint) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  post: async (endpoint, body, isMultipart = false) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: getHeaders(isMultipart),
      body: isMultipart ? body : JSON.stringify(body),
    });
    return handleResponse(res);
  },

  put: async (endpoint, body, isMultipart = false) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: getHeaders(isMultipart),
      body: isMultipart ? body : JSON.stringify(body),
    });
    return handleResponse(res);
  },

  delete: async (endpoint) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Auth endpoints
  auth: {
    login: (credentials) => api.post("/auth/login", credentials),
    register: (details) => api.post("/auth/register", details),
  },

  // Dashboard endpoint
  dashboard: {
    get: (academicYear) => api.get(`/dashboard/${academicYear}`),
  },

  // Students endpoints
  students: {
    getAll: () => api.get("/students"),
    create: (data) => api.post("/students", data),
    update: (id, data) => api.put(`/students/${id}`, data),
    delete: (id) => api.delete(`/students/${id}`),
    uploadPhoto: (id, formData) => api.post(`/students/${id}/photo`, formData, true),
  },

  // Teachers endpoints
  teachers: {
    getAll: () => api.get("/teachers"),
    getById: (id) => api.get(`/teachers/${id}`),
    create: (data) => api.post("/teachers", data),
    update: (id, data) => api.put(`/teachers/${id}`, data),
    delete: (id) => api.delete(`/teachers/${id}`),
  },

  // Subjects endpoints
  subjects: {
    getAll: () => api.get("/subjects"),
    getById: (id) => api.get(`/subjects/${id}`),
    create: (data) => api.post("/subjects", data),
    update: (id, data) => api.put(`/subjects/${id}`, data),
    delete: (id) => api.delete(`/subjects/${id}`),
  },

  // Attendance endpoints
  attendance: {
    mark: (data) => api.post("/attendance/mark", data),
    getStudent: (studentId) => api.get(`/attendance/student/${studentId}`),
    getClassReport: (className, date, query = {}) => {
      const params = new URLSearchParams();
      if (query.section) params.set("section", query.section);
      const queryString = params.toString();
      return api.get(
        `/attendance/class/${encodeURIComponent(className)}/${encodeURIComponent(date)}${queryString ? `?${queryString}` : ""}`
      );
    },
  },

  // Fees endpoints
  fees: {
    createStructure: (data) => api.post("/fees/structure", data),
    addPayment: (data) => api.post("/fees/payment", data),
    refundPayment: (data) => api.post("/fees/refund", data),
    getLedger: (studentId, academicYear) => api.get(`/fees/ledger/${studentId}/${academicYear}`),
    getDashboard: (academicYear) => api.get(`/fees/dashboard/${academicYear}`),
    getPending: (academicYear) => api.get(`/fees/pending/${academicYear}`),
  },

  // Results endpoints
  results: {
    create: (data) => api.post("/results", data),
    update: (id, data) => api.put(`/results/${id}`, data),
    downloadPDF: (id) => `${API_BASE_URL}/results/${id}/pdf`, // Returns the file download URL (needs auth token in header, or query param, but since backend uses authMiddleware, we will fetch it manually as blob or open it)
    downloadPDFBlob: async (id) => {
      const token = localStorage.getItem("skooler_token");
      const res = await fetch(`${API_BASE_URL}/results/${id}/pdf`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to download PDF");
      return res.blob();
    }
  },

  // School endpoints
  school: {
    getProfile: () => api.get("/school"),
    uploadLogo: (formData) => api.put("/school/logo", formData, true),
  },

  // Messages endpoints
  messages: {
    getContacts: () => api.get("/messages/contacts"),
    getChat: (contactId) => api.get(`/messages/${contactId}`),
    send: (data) => api.post("/messages", data),
    markRead: (contactId) => api.put(`/messages/${contactId}/read`, {}),
  },
};
