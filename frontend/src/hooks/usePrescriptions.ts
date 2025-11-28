import React, { useCallback, useState } from "react";
import { useAppDispatch } from "./useAppDispatch";
import { useAppSelector } from "./useAppSelector";
import { RootState } from "../store";
import {
  fetchPrescriptions,
  fetchPrescriptionById,
  createPrescription,
  updatePrescription,
  deletePrescription,
  downloadPrescriptionFile,
  setFilePreview,
  clearCurrentPrescription,
  clearError,
  clearFilePreview,
  setFileInfo,
} from "../store/slices/prescriptionsSlice";
import { Prescription } from "../types";

export const usePrescriptions = () => {
  const dispatch = useAppDispatch();
  const {
    prescriptions,
    currentPrescription,
    loading,
    error,
    filePreview,
    fileInfo,
  } = useAppSelector((state: RootState) => state.prescriptions);

  // Use React's useState hook to store the actual File object
  const [uploadedFile, setUploadedFileState] = useState<File | null>(null);

  const getAllPrescriptions = useCallback(async () => {
    try {
      await dispatch(fetchPrescriptions()).unwrap();
    } catch (err) {
      // Error is handled by the reducer
    }
  }, [dispatch]);

  const getPrescriptionById = useCallback(
    async (id: number) => {
      try {
        await dispatch(fetchPrescriptionById(id)).unwrap();
      } catch (err) {
        // Error is handled by the reducer
      }
    },
    [dispatch]
  );

  const createPrescriptionRecord = useCallback(
    async (
      prescriptionData: Omit<Prescription, "id" | "createdAt" | "updatedAt">,
      file?: File
    ) => {
      try {
        const result = await dispatch(
          createPrescription({ prescriptionData, file })
        ).unwrap();
        if (result) {
          // Clear file preview after successful creation
          dispatch(clearFilePreview());
          setUploadedFileState(null);
        }
        return true;
      } catch (err) {
        console.error("Error creating prescription:", err);
        return false;
      }
    },
    [dispatch]
  );

  const updatePrescriptionRecord = useCallback(
    async (
      id: number,
      prescriptionData: Partial<Prescription>,
      file?: File
    ) => {
      try {
        const result = await dispatch(
          updatePrescription({ id, prescriptionData, file })
        ).unwrap();
        if (result) {
          // Clear file preview after successful update
          dispatch(clearFilePreview());
          setUploadedFileState(null);
        }
        return true;
      } catch (err) {
        console.error("Error updating prescription:", err);
        return false;
      }
    },
    [dispatch]
  );

  const deletePrescriptionRecord = useCallback(
    async (id: number) => {
      try {
        await dispatch(deletePrescription(id)).unwrap();
      } catch (err) {
        // Error is handled by the reducer
      }
    },
    [dispatch]
  );

  const clearPrescription = useCallback(() => {
    dispatch(clearCurrentPrescription());
  }, [dispatch]);

  const downloadFile = useCallback(
    async (id: number, fileName: string) => {
      try {
        // The response is already a Blob
        const blob = await dispatch(downloadPrescriptionFile(id)).unwrap();

        if (!blob) {
          console.error("No blob received from the server");
          return false;
        }

        // Create a temporary URL for the blob
        const url = window.URL.createObjectURL(blob);

        // Create a temporary link element
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName || `prescription-${id}.pdf`);

        // Append the link to the body
        document.body.appendChild(link);

        // Trigger the download
        link.click();

        // Clean up
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);

        return true;
      } catch (err) {
        console.error("Error downloading file:", err);
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

  const clearPreview = useCallback(() => {
    dispatch(clearFilePreview());
    setUploadedFileState(null);
  }, [dispatch]);

  const clearErrorMessage = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    prescriptions,
    currentPrescription,
    loading,
    error,
    filePreview,
    fileInfo,
    uploadedFile,
    getAllPrescriptions,
    getPrescriptionById,
    createPrescriptionRecord,
    updatePrescriptionRecord,
    deletePrescriptionRecord,
    downloadFile,
    previewFile,
    clearPrescription,
    clearPreview,
    clearErrorMessage,
  };
};
