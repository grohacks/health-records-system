import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Prescription } from "../../types";
import { prescriptionsApi } from "../../services/api";

interface SerializableFileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

interface PrescriptionsState {
  prescriptions: Prescription[];
  currentPrescription: Prescription | null;
  loading: boolean;
  error: string | null;
  filePreview: string | null;
  fileInfo: SerializableFileInfo | null;
}

const initialState: PrescriptionsState = {
  prescriptions: [],
  currentPrescription: null,
  loading: false,
  error: null,
  filePreview: null,
  fileInfo: null,
};

export const fetchPrescriptions = createAsyncThunk(
  "prescriptions/fetchAll",
  async () => {
    const response = await prescriptionsApi.getAll();
    return response.data; // Extract only the data property to avoid non-serializable values
  }
);

export const fetchPrescriptionById = createAsyncThunk(
  "prescriptions/fetchById",
  async (id: number) => {
    const response = await prescriptionsApi.getById(id);
    return response.data; // Extract only the data property to avoid non-serializable values
  }
);

export const createPrescription = createAsyncThunk(
  "prescriptions/create",
  async ({
    prescriptionData,
    file,
  }: {
    prescriptionData: Omit<Prescription, "id" | "createdAt" | "updatedAt">;
    file?: File;
  }) => {
    const response = await prescriptionsApi.create(prescriptionData, file);
    return response.data; // Extract only the data property to avoid non-serializable values
  }
);

export const updatePrescription = createAsyncThunk(
  "prescriptions/update",
  async ({
    id,
    prescriptionData,
    file,
  }: {
    id: number;
    prescriptionData: Partial<Prescription>;
    file?: File;
  }) => {
    const response = await prescriptionsApi.update(id, prescriptionData, file);
    return response.data; // Extract only the data property to avoid non-serializable values
  }
);

export const deletePrescription = createAsyncThunk(
  "prescriptions/delete",
  async (id: number) => {
    await prescriptionsApi.delete(id);
    return id;
  }
);

export const downloadPrescriptionFile = createAsyncThunk(
  "prescriptions/downloadFile",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await prescriptionsApi.downloadFile(id);
      // Return the Blob directly - we've configured Redux to ignore this non-serializable value
      return response.data;
    } catch (error) {
      console.error("Error downloading file:", error);
      return rejectWithValue("Failed to download file");
    }
  }
);

export const setFilePreview = createAsyncThunk(
  "prescriptions/setFilePreview",
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

const prescriptionsSlice = createSlice({
  name: "prescriptions",
  initialState,
  reducers: {
    clearCurrentPrescription: (state) => {
      state.currentPrescription = null;
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
      // Fetch all prescriptions
      .addCase(fetchPrescriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrescriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.prescriptions = action.payload;
      })
      .addCase(fetchPrescriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch prescriptions";
      })
      // Fetch single prescription
      .addCase(fetchPrescriptionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrescriptionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPrescription = action.payload;
      })
      .addCase(fetchPrescriptionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch prescription";
      })
      // Create prescription
      .addCase(createPrescription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPrescription.fulfilled, (state, action) => {
        state.loading = false;
        state.prescriptions.push(action.payload);
      })
      .addCase(createPrescription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create prescription";
      })
      // Update prescription
      .addCase(updatePrescription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePrescription.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.prescriptions.findIndex(
          (prescription) => prescription.id === action.payload.id
        );
        if (index !== -1) {
          state.prescriptions[index] = action.payload;
        }
        if (state.currentPrescription?.id === action.payload.id) {
          state.currentPrescription = action.payload;
        }
      })
      .addCase(updatePrescription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update prescription";
      })
      // Delete prescription
      .addCase(deletePrescription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePrescription.fulfilled, (state, action) => {
        state.loading = false;
        state.prescriptions = state.prescriptions.filter(
          (prescription) => prescription.id !== action.payload
        );
        if (state.currentPrescription?.id === action.payload) {
          state.currentPrescription = null;
        }
      })
      .addCase(deletePrescription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete prescription";
      })
      // Download file
      .addCase(downloadPrescriptionFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(downloadPrescriptionFile.fulfilled, (state) => {
        state.loading = false;
        // File download is handled by the browser
      })
      .addCase(downloadPrescriptionFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to download file";
      })
      // Set file preview
      .addCase(setFilePreview.fulfilled, (state, action) => {
        state.filePreview = action.payload;
      });
  },
});

export const {
  clearCurrentPrescription,
  clearError,
  clearFilePreview,
  setFileInfo,
} = prescriptionsSlice.actions;
export default prescriptionsSlice.reducer;
