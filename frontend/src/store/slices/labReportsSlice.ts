import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { LabReport } from "../../types";
import { labReportsApi } from "../../services/api";

interface SerializableFileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

interface LabReportsState {
  reports: LabReport[];
  currentReport: LabReport | null;
  loading: boolean;
  error: string | null;
  filePreview: string | null;
  fileInfo: SerializableFileInfo | null;
}

const initialState: LabReportsState = {
  reports: [],
  currentReport: null,
  loading: false,
  error: null,
  filePreview: null,
  fileInfo: null,
};

export const fetchLabReports = createAsyncThunk(
  "labReports/fetchAll",
  async () => {
    const response = await labReportsApi.getAll();
    return response.data;
  }
);

export const fetchLabReportsByPatient = createAsyncThunk(
  "labReports/fetchByPatient",
  async (patientId: number) => {
    const response = await labReportsApi.getByPatient(patientId);
    return response.data;
  }
);

export const fetchLabReportsByDoctor = createAsyncThunk(
  "labReports/fetchByDoctor",
  async (doctorId: number) => {
    const response = await labReportsApi.getByDoctor(doctorId);
    return response.data;
  }
);

export const fetchLabReportById = createAsyncThunk(
  "labReports/fetchById",
  async (id: number) => {
    const response = await labReportsApi.getById(id);
    return response.data;
  }
);

export const createLabReport = createAsyncThunk(
  "labReports/create",
  async ({
    reportData,
    file,
  }: {
    reportData: Omit<LabReport, "id" | "createdAt" | "updatedAt">;
    file?: File;
  }) => {
    const response = await labReportsApi.create(reportData, file);
    return response.data;
  }
);

export const updateLabReport = createAsyncThunk(
  "labReports/update",
  async ({
    id,
    reportData,
    file,
  }: {
    id: number;
    reportData: Partial<LabReport>;
    file?: File;
  }) => {
    const response = await labReportsApi.update(id, reportData, file);
    return response.data;
  }
);

export const deleteLabReport = createAsyncThunk(
  "labReports/delete",
  async (id: number) => {
    await labReportsApi.delete(id);
    return id;
  }
);

export const downloadLabReportFile = createAsyncThunk(
  "labReports/downloadFile",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await labReportsApi.downloadFile(id);
      // Return the Blob directly - we've configured Redux to ignore this non-serializable value
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error downloading file:", error);
      }
      return rejectWithValue("Failed to download file");
    }
  }
);

export const setFilePreview = createAsyncThunk(
  "labReports/setFilePreview",
  async (file: File) => {
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }
);

const labReportsSlice = createSlice({
  name: "labReports",
  initialState,
  reducers: {
    clearCurrentReport: (state) => {
      state.currentReport = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearFilePreview: (state) => {
      state.filePreview = null;
      state.fileInfo = null;
    },
    setFileInfo: (state, action) => {
      state.fileInfo = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all reports
      .addCase(fetchLabReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLabReports.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure we only update if this is still the current request
        state.reports = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchLabReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch lab reports";
      })

      // Fetch reports by patient
      .addCase(fetchLabReportsByPatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLabReportsByPatient.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchLabReportsByPatient.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch patient lab reports";
      })

      // Fetch reports by doctor
      .addCase(fetchLabReportsByDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLabReportsByDoctor.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchLabReportsByDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch doctor lab reports";
      })

      // Fetch single report
      .addCase(fetchLabReportById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLabReportById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReport = action.payload;
      })
      .addCase(fetchLabReportById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch lab report";
      })
      // Create report
      .addCase(createLabReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLabReport.fulfilled, (state, action) => {
        state.loading = false;
        if (!Array.isArray(state.reports)) {
          state.reports = [];
        }
        if (action.payload) {
          state.reports.push(action.payload);
        }
        // Clear file preview after successful creation
        state.filePreview = null;
        state.fileInfo = null;
      })
      .addCase(createLabReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create lab report";
      })
      // Update report
      .addCase(updateLabReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLabReport.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.reports.findIndex(
          (report) => report.id === action.payload.id
        );
        if (index !== -1) {
          state.reports[index] = action.payload;
        }
        if (state.currentReport?.id === action.payload.id) {
          state.currentReport = action.payload;
        }
        // Clear file preview after successful update
        state.filePreview = null;
        state.fileInfo = null;
      })
      .addCase(updateLabReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update lab report";
      })
      // Delete report
      .addCase(deleteLabReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLabReport.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = state.reports.filter(
          (report) => report.id !== action.payload
        );
        if (state.currentReport?.id === action.payload) {
          state.currentReport = null;
        }
      })
      .addCase(deleteLabReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete lab report";
      })
      // Download file
      .addCase(downloadLabReportFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(downloadLabReportFile.fulfilled, (state) => {
        state.loading = false;
        // File download is handled by the browser
      })
      .addCase(downloadLabReportFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to download file";
      })

      // Set file preview
      .addCase(setFilePreview.fulfilled, (state, action) => {
        state.filePreview = action.payload;
      });
  },
});

export const { clearCurrentReport, clearError, clearFilePreview, setFileInfo } =
  labReportsSlice.actions;
export default labReportsSlice.reducer;
