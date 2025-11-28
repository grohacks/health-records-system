import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { MedicalRecord } from "../../types";
import { medicalRecordsApi } from "../../services/api";

interface MedicalRecordsState {
  records: MedicalRecord[];
  currentRecord: MedicalRecord | null;
  loading: boolean;
  error: string | null;
}

const initialState: MedicalRecordsState = {
  records: [],
  currentRecord: null,
  loading: false,
  error: null,
};

export const fetchMedicalRecords = createAsyncThunk(
  "medicalRecords/fetchAll",
  async () => {
    const response = await medicalRecordsApi.getAll();
    return response.data; // Extract only the data property to avoid non-serializable values
  }
);

export const fetchMedicalRecordById = createAsyncThunk(
  "medicalRecords/fetchById",
  async (id: number) => {
    const response = await medicalRecordsApi.getById(id);
    return response.data; // Extract only the data property to avoid non-serializable values
  }
);

export const createMedicalRecord = createAsyncThunk(
  "medicalRecords/create",
  async (recordData: Omit<MedicalRecord, "id" | "createdAt" | "updatedAt">) => {
    const response = await medicalRecordsApi.create(recordData);
    return response.data; // Extract only the data property to avoid non-serializable values
  }
);

export const updateMedicalRecord = createAsyncThunk(
  "medicalRecords/update",
  async ({
    id,
    recordData,
  }: {
    id: number;
    recordData: Partial<MedicalRecord>;
  }) => {
    const response = await medicalRecordsApi.update(id, recordData);
    return response.data; // Extract only the data property to avoid non-serializable values
  }
);

export const deleteMedicalRecord = createAsyncThunk(
  "medicalRecords/delete",
  async (id: number) => {
    await medicalRecordsApi.delete(id);
    return id;
  }
);

const medicalRecordsSlice = createSlice({
  name: "medicalRecords",
  initialState,
  reducers: {
    clearCurrentRecord: (state) => {
      state.currentRecord = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all records
      .addCase(fetchMedicalRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMedicalRecords.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure records is always an array
        state.records = Array.isArray(action.payload) ? action.payload : [];
        console.log("Fetched medical records:", state.records);
      })
      .addCase(fetchMedicalRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch medical records";
      })
      // Fetch single record
      .addCase(fetchMedicalRecordById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMedicalRecordById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRecord = action.payload;
      })
      .addCase(fetchMedicalRecordById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch medical record";
      })
      // Create record
      .addCase(createMedicalRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMedicalRecord.fulfilled, (state, action) => {
        state.loading = false;
        console.log("Created medical record:", action.payload);
        // Ensure records is an array before pushing
        if (!Array.isArray(state.records)) {
          state.records = [];
        }
        if (action.payload) {
          state.records.push(action.payload);
        }
      })
      .addCase(createMedicalRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create medical record";
      })
      // Update record
      .addCase(updateMedicalRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMedicalRecord.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.records.findIndex(
          (record) => record.id === action.payload.id
        );
        if (index !== -1) {
          state.records[index] = action.payload;
        }
        if (state.currentRecord?.id === action.payload.id) {
          state.currentRecord = action.payload;
        }
      })
      .addCase(updateMedicalRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update medical record";
      })
      // Delete record
      .addCase(deleteMedicalRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMedicalRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.records = state.records.filter(
          (record) => record.id !== action.payload
        );
        if (state.currentRecord?.id === action.payload) {
          state.currentRecord = null;
        }
      })
      .addCase(deleteMedicalRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete medical record";
      });
  },
});

export const { clearCurrentRecord, clearError } = medicalRecordsSlice.actions;
export default medicalRecordsSlice.reducer;
