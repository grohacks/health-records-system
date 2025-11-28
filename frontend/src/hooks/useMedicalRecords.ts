import { useCallback } from 'react';
import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';
import { RootState } from '../store';
import {
  fetchMedicalRecords,
  fetchMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  clearCurrentRecord,
} from '../store/slices/medicalRecordsSlice';
import { MedicalRecord } from '../types';

export const useMedicalRecords = () => {
  const dispatch = useAppDispatch();
  const { records, currentRecord, loading, error } = useAppSelector(
    (state: RootState) => state.medicalRecords
  );

  const getAllRecords = useCallback(async () => {
    try {
      await dispatch(fetchMedicalRecords()).unwrap();
    } catch (err) {
      // Error is handled by the reducer
    }
  }, [dispatch]);

  const getRecordById = useCallback(
    async (id: number) => {
      try {
        await dispatch(fetchMedicalRecordById(id)).unwrap();
      } catch (err) {
        // Error is handled by the reducer
      }
    },
    [dispatch]
  );

  const createRecord = useCallback(
    async (recordData: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        await dispatch(createMedicalRecord(recordData)).unwrap();
      } catch (err) {
        // Error is handled by the reducer
      }
    },
    [dispatch]
  );

  const updateRecord = useCallback(
    async (id: number, recordData: Partial<MedicalRecord>) => {
      try {
        await dispatch(updateMedicalRecord({ id, recordData })).unwrap();
      } catch (err) {
        // Error is handled by the reducer
      }
    },
    [dispatch]
  );

  const deleteRecord = useCallback(
    async (id: number) => {
      try {
        await dispatch(deleteMedicalRecord(id)).unwrap();
      } catch (err) {
        // Error is handled by the reducer
      }
    },
    [dispatch]
  );

  const clearRecord = useCallback(() => {
    dispatch(clearCurrentRecord());
  }, [dispatch]);

  return {
    records,
    currentRecord,
    loading,
    error,
    getAllRecords,
    getRecordById,
    createRecord,
    updateRecord,
    deleteRecord,
    clearRecord,
  };
}; 