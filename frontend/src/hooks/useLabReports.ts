import React, { useCallback, useState } from "react";
import { useAppDispatch } from "./useAppDispatch";
import { useAppSelector } from "./useAppSelector";
import { RootState } from "../store";
import {
  fetchLabReports,
  fetchLabReportsByPatient,
  fetchLabReportsByDoctor,
  fetchLabReportById,
  createLabReport,
  updateLabReport,
  deleteLabReport,
  downloadLabReportFile,
  setFilePreview,
  clearCurrentReport,
  clearFilePreview,
  setFileInfo,
  clearError,
} from "../store/slices/labReportsSlice";
import { LabReport } from "../types";

export const useLabReports = () => {
  const dispatch = useAppDispatch();
  const { reports, currentReport, loading, error, filePreview, fileInfo } =
    useAppSelector((state: RootState) => state.labReports);

  // Use React's useState hook to store the actual File object
  const [uploadedFile, setUploadedFileState] = useState<File | null>(null);

  const getAllReports = useCallback(async () => {
    try {
      await dispatch(fetchLabReports()).unwrap();
    } catch (err) {
      // Error is handled by the reducer
    }
  }, [dispatch]);

  const getReportsByPatient = useCallback(
    async (patientId: number) => {
      try {
        await dispatch(fetchLabReportsByPatient(patientId)).unwrap();
      } catch (err) {
        // Error is handled by the reducer
      }
    },
    [dispatch]
  );

  const getReportsByDoctor = useCallback(
    async (doctorId: number) => {
      try {
        await dispatch(fetchLabReportsByDoctor(doctorId)).unwrap();
      } catch (err) {
        // Error is handled by the reducer
      }
    },
    [dispatch]
  );

  const getReportById = useCallback(
    async (id: number) => {
      try {
        await dispatch(fetchLabReportById(id)).unwrap();
      } catch (err) {
        // Error is handled by the reducer
      }
    },
    [dispatch]
  );

  const createReport = useCallback(
    async (
      reportData: Omit<LabReport, "id" | "createdAt" | "updatedAt">,
      file?: File
    ) => {
      try {
        await dispatch(createLabReport({ reportData, file })).unwrap();
        return true;
      } catch (err) {
        // Error is handled by the reducer
        return false;
      }
    },
    [dispatch]
  );

  const updateReport = useCallback(
    async (id: number, reportData: Partial<LabReport>, file?: File) => {
      try {
        await dispatch(updateLabReport({ id, reportData, file })).unwrap();
        return true;
      } catch (err) {
        // Error is handled by the reducer
        return false;
      }
    },
    [dispatch]
  );

  const deleteReport = useCallback(
    async (id: number) => {
      try {
        await dispatch(deleteLabReport(id)).unwrap();
        return true;
      } catch (err) {
        // Error is handled by the reducer
        return false;
      }
    },
    [dispatch]
  );

  const downloadFile = useCallback(
    async (id: number, fileName: string) => {
      try {
        // The response is already a Blob
        const blob = await dispatch(downloadLabReportFile(id)).unwrap();

        if (!blob) {
          if (import.meta.env.DEV) {
            console.error("No blob received from the server");
          }
          return false;
        }

        // Create a temporary URL for the blob
        const url = window.URL.createObjectURL(blob);

        // Create a temporary link element
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName || `lab-report-${id}.pdf`);

        // Append the link to the body
        document.body.appendChild(link);

        // Trigger the download
        link.click();

        // Clean up
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);

        return true;
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error("Error downloading file:", err);
        }
        return false;
      }
    },
    [dispatch]
  );

  const previewFile = useCallback(
    async (file: File) => {
      try {
        // Generate data URL for preview
        await dispatch(setFilePreview(file)).unwrap();

        // Store serializable file info in Redux
        const fileInfo = {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
        };
        dispatch(setFileInfo(fileInfo));

        // Store the actual File object in local state
        setUploadedFileState(file);

        return true;
      } catch (err) {
        // Error is handled by the reducer
        return false;
      }
    },
    [dispatch]
  );

  const clearReport = useCallback(() => {
    dispatch(clearCurrentReport());
  }, [dispatch]);

  const clearPreview = useCallback(() => {
    dispatch(clearFilePreview());
    setUploadedFileState(null);
  }, [dispatch]);

  const clearErrorMessage = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    reports,
    currentReport,
    loading,
    error,
    filePreview,
    fileInfo,
    uploadedFile,
    getAllReports,
    getReportsByPatient,
    getReportsByDoctor,
    getReportById,
    createReport,
    updateReport,
    deleteReport,
    downloadFile,
    previewFile,
    clearReport,
    clearPreview,
    clearErrorMessage,
  };
};
