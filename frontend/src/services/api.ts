import axios from "axios";
import { mockChatbotApi } from "./mockChatbotApi";

// Flag to use mock implementation for chatbot
const USE_MOCK_CHATBOT = false;

// Get API URLs from environment variables with fallbacks
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
const DIRECT_API_URL =
  import.meta.env.VITE_DIRECT_API_URL || "http://localhost:8080";

console.log("Using API URL:", API_URL);
console.log("Using Direct API URL:", DIRECT_API_URL);

// Regular API instance with authentication
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Disable credentials for CORS requests to avoid preflight issues
  withCredentials: false,
});

// Special API instance for open endpoints without authentication
const openApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Add the same error handling to the open API instance
openApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("Open API Error Response:", error.response.data);
      return Promise.reject(error.response.data || "An error occurred");
    } else if (error.request) {
      console.error("Open API Network Error:", error.request);
      return Promise.reject("Unable to connect to the server");
    } else {
      console.error("Open API Request Error:", error.message);
      return Promise.reject("An unexpected error occurred");
    }
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      let errorMessage = "An error occurred";

      console.error("API Error Response:", error.response.data);

      // Check for different error formats
      if (error.response.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      } else if (
        error.response.data?.title &&
        error.response.data.title.startsWith("ERROR:")
      ) {
        // Handle error response from appointment creation
        errorMessage = error.response.data.title.substring(7); // Remove "ERROR: " prefix
      } else if (typeof error.response.data === "string") {
        errorMessage = error.response.data;
      }

      // Return the original response data for more detailed error handling
      return Promise.reject(error.response.data || errorMessage);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Network Error:", error.request);

      // Check if this is a CORS error
      if (error.message && error.message.includes("Network Error")) {
        console.error("Possible CORS error detected");
        return Promise.reject(
          "Unable to connect to the server. This may be due to a CORS issue."
        );
      }

      return Promise.reject(
        "Unable to connect to the server. Please check your internet connection."
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Request Error:", error.message);
      return Promise.reject("An unexpected error occurred. Please try again.");
    }
  }
);

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      // Ensure headers object exists
      config.headers = config.headers || {};

      // Set Authorization header with Bearer token
      config.headers.Authorization = `Bearer ${token}`;

      // Only log in development mode
      if (import.meta.env.DEV) {
        console.log("Adding token to request:", config.url);
      }
    } else if (import.meta.env.DEV) {
      console.warn("No token found in localStorage for request:", config.url);
    }
    return config;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error("Request interceptor error:", error);
    }
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    // Any status code that lies within the range of 2xx causes this function to trigger
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    console.error("API Error:", error);

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error message:", error.message);
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
  }) => api.post("/auth/register", userData),

  login: (credentials: { email: string; password: string }) =>
    api.post("/auth/login", credentials),

  getProfile: () => api.get("/auth/profile"),

  updateProfile: (userData: any) => api.put("/auth/profile", userData),
};

export const medicalRecordsApi = {
  getAll: () => api.get("/medical-records"),

  getById: (id: number) => api.get(`/medical-records/${id}`),

  create: (recordData: any) => api.post("/medical-records", recordData),

  update: (id: number, recordData: any) =>
    api.put(`/medical-records/${id}`, recordData),

  delete: (id: number) => api.delete(`/medical-records/${id}`),
};

export const labReportsApi = {
  getAll: () => api.get("/lab-reports"),

  getByPatient: (patientId: number) =>
    api.get(`/lab-reports/patient/${patientId}`),

  getByDoctor: (doctorId: number) => api.get(`/lab-reports/doctor/${doctorId}`),

  getById: (id: number) => api.get(`/lab-reports/${id}`),

  create: (reportData: any, file?: File) => {
    const formData = new FormData();
    formData.append(
      "labReport",
      new Blob([JSON.stringify(reportData)], { type: "application/json" })
    );

    if (file) {
      formData.append("file", file);
    }

    return api.post("/lab-reports", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  update: (id: number, reportData: any, file?: File) => {
    const formData = new FormData();
    formData.append(
      "labReport",
      new Blob([JSON.stringify(reportData)], { type: "application/json" })
    );

    if (file) {
      formData.append("file", file);
    }

    return api.put(`/lab-reports/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  delete: (id: number) => api.delete(`/lab-reports/${id}`),

  downloadFile: (id: number) =>
    api.get(`/lab-reports/${id}/download`, { responseType: "blob" }),
};

export const prescriptionsApi = {
  getAll: () => api.get("/prescriptions"),

  getByPatient: (patientId: number) =>
    api.get(`/prescriptions/patient/${patientId}`),

  getByDoctor: (doctorId: number) =>
    api.get(`/prescriptions/doctor/${doctorId}`),

  getByMedicalRecord: (medicalRecordId: number) =>
    api.get(`/prescriptions/medical-record/${medicalRecordId}`),

  getById: (id: number) => api.get(`/prescriptions/${id}`),

  create: (prescriptionData: any, file?: File) => {
    if (file) {
      const formData = new FormData();
      formData.append(
        "prescription",
        new Blob([JSON.stringify(prescriptionData)], {
          type: "application/json",
        })
      );
      formData.append("file", file);

      return api.post("/prescriptions", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } else {
      return api.post("/prescriptions", prescriptionData);
    }
  },

  update: (id: number, prescriptionData: any, file?: File) => {
    if (file) {
      const formData = new FormData();
      formData.append(
        "prescription",
        new Blob([JSON.stringify(prescriptionData)], {
          type: "application/json",
        })
      );
      formData.append("file", file);

      return api.put(`/prescriptions/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } else {
      return api.put(`/prescriptions/${id}`, prescriptionData);
    }
  },

  delete: (id: number) => api.delete(`/prescriptions/${id}`),

  downloadFile: (id: number) =>
    api.get(`/prescriptions/${id}/download`, { responseType: "blob" }),
};

export const userApi = {
  getAll: () => api.get("/users"),
  getById: (id: number) => api.get(`/users/${id}`),
  create: (userData: any) => api.post("/users", userData),
  update: (id: number, userData: any) => api.put(`/users/${id}`, userData),
  delete: (id: number) => api.delete(`/users/${id}`),
  // Use the public endpoint for doctors
  getDoctors: () => api.get("/public/doctors"),
  // Add endpoint for doctors to get patients
  getPatients: () => api.get("/users/patients"),
};

export const appointmentApi = {
  getAll: () => api.get("/appointments"),
  getById: (id: number) => api.get(`/appointments/${id}`),
  getByDateRange: (start: string, end: string) =>
    api.get(`/appointments/date-range?start=${start}&end=${end}`),
  create: (appointmentData: any) => api.post("/appointments", appointmentData),
  update: (id: number, appointmentData: any) =>
    api.put(`/appointments/${id}`, appointmentData),
  delete: (id: number) => api.delete(`/appointments/${id}`),
  getMyAppointments: () => api.get("/appointments/my-appointments"),
  getMyUpcomingAppointments: () =>
    api.get("/appointments/my-upcoming-appointments"),
  getAppointmentsForDoctor: (doctorId: number) =>
    api.get(`/appointments/doctor/${doctorId}`),
  confirmAppointment: (id: number) =>
    api.put(`/appointments/${id}/confirm`, {}),
  rejectAppointment: (id: number, reason: string) =>
    api.put(`/appointments/${id}/reject`, { reason }),
};

export const notificationApi = {
  getAll: () => api.get("/notifications"),
  getUnread: () => api.get("/notifications/unread"),
  countUnread: () => api.get("/notifications/count-unread"),
  getById: (id: number) => api.get(`/notifications/${id}`),
  markAsRead: (id: number) => api.put(`/notifications/${id}/mark-read`, {}),
  markAllAsRead: () => api.put("/notifications/mark-all-read", {}),
};

export const chatbotApi = {
  createSession: async () => {
    try {
      console.log("Attempting to create chat session...");
      const response = await api.post("/chatbot/sessions");
      console.log("Chat session created successfully:", response.data);
      return response;
    } catch (error) {
      console.error("Error creating chat session:", error);
      // Add more detailed error information
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      } else if (error.request) {
        console.error("No response received from server");
      } else {
        console.error("Error message:", error.message);
      }

      // Create a temporary local session to allow the UI to function
      console.warn("Creating temporary local session as fallback");
      return {
        data: {
          id: Date.now(), // Use timestamp as a temporary ID
          startTime: new Date().toISOString(),
          isActive: true,
          messages: [],
        },
      };
    }
  },
  getSessions: async () => {
    try {
      return await api.get("/chatbot/sessions");
    } catch (error) {
      console.error("Error getting chat sessions:", error);
      throw error;
    }
  },
  getSession: async (sessionId: number) => {
    try {
      return await api.get(`/chatbot/sessions/${sessionId}`);
    } catch (error) {
      console.error(`Error getting chat session ${sessionId}:`, error);
      throw error;
    }
  },
  sendMessage: async (sessionId: number, message: { content: string }) => {
    try {
      console.log(`Sending message to session ${sessionId}:`, message);

      // Direct import of the medical knowledge base
      const { default: generateMedicalResponse } = await import(
        "../utils/medicalKnowledge"
      );

      // Generate a response using the local medical knowledge base
      console.log("Medical query:", message.content);
      const medicalResponse = generateMedicalResponse(message.content);
      console.log("Generated response:", medicalResponse);

      // Try to send to backend, but use local response regardless
      try {
        await api.post(`/chatbot/sessions/${sessionId}/messages`, message);
      } catch (backendError) {
        console.warn(
          "Backend message sending failed, using local response only:",
          backendError
        );
      }

      // Always return the locally generated response
      return {
        data: {
          response: medicalResponse,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error(`Error in sendMessage for session ${sessionId}:`, error);

      // Fallback response if everything fails
      return {
        data: {
          response:
            "I'm sorry, I'm having trouble processing your request. Please try again with a different question.",
          timestamp: new Date().toISOString(),
        },
      };
    }
  },
  getChatHistory: async (sessionId: number) => {
    try {
      return await api.get(`/chatbot/sessions/${sessionId}/messages`);
    } catch (error) {
      console.error(
        `Error getting chat history for session ${sessionId}:`,
        error
      );
      throw error;
    }
  },
  endSession: async (sessionId: number) => {
    try {
      return await api.post(`/chatbot/sessions/${sessionId}/end`);
    } catch (error) {
      console.error(`Error ending chat session ${sessionId}:`, error);
      throw error;
    }
  },
  getConfig: async () => {
    try {
      console.log("Attempting to get chatbot config...");
      const response = await api.get("/chatbot/config");
      console.log("Chatbot config retrieved successfully:", response.data);
      return response;
    } catch (error) {
      console.error("Error getting chatbot config:", error);
      // Add more detailed error information
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      } else if (error.request) {
        console.error("No response received from server");
      } else {
        console.error("Error message:", error.message);
      }

      // Return default config instead of throwing error
      return {
        data: {
          disclaimers: [
            "The information provided by this chatbot is for general informational purposes only and is not a substitute for professional medical advice.",
            "Always consult with a qualified healthcare provider for medical advice, diagnosis, or treatment.",
            "If you are experiencing a medical emergency, call your local emergency services immediately.",
          ],
          medicalSources: [
            "Mayo Clinic",
            "Centers for Disease Control and Prevention (CDC)",
            "World Health Organization (WHO)",
            "National Institutes of Health (NIH)",
          ],
        },
      };
    }
  },
};

// Test API for debugging
export const testApi = {
  test: () => openApi.get("/test"),
  testPost: (data: any) => openApi.post("/test", data),
};

// Direct API for bypassing all security
export const directApi = {
  test: () => axios.get(`${DIRECT_API_URL}/direct/test`),
  createAppointment: (data: any) =>
    axios.post(`${DIRECT_API_URL}/direct/appointment`, data),
};

export { api, openApi };
export default api;
