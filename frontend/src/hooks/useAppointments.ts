import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { appointmentApi } from "../services/api";
import {
  fetchAppointments,
  fetchAppointmentById,
  fetchAppointmentsByDateRange,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  fetchMyAppointments,
  fetchMyUpcomingAppointments,
  confirmAppointment,
  clearCurrentAppointment,
  clearAppointmentsError,
  setAppointments,
} from "../store/slices/appointmentsSlice";
import { Appointment } from "../types";

export const useAppointments = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { appointments, currentAppointment, loading, error } = useSelector(
    (state: RootState) => state.appointments
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const getAppointments = useCallback(() => {
    // Only admins can fetch all appointments
    if (user?.role === "ROLE_ADMIN") {
      return dispatch(fetchAppointments());
    } else {
      // Doctors and patients fetch their own appointments
      return dispatch(fetchMyAppointments());
    }
  }, [dispatch, user?.role]);

  const getAppointmentById = useCallback(
    (id: number) => {
      return dispatch(fetchAppointmentById(id));
    },
    [dispatch]
  );

  const getAppointmentsByDateRange = useCallback(
    (start: string, end: string) => {
      // Only dispatch if we have valid dates
      if (start && end) {
        return dispatch(fetchAppointmentsByDateRange({ start, end }));
      }
      return Promise.resolve();
    },
    [dispatch]
  );

  const addAppointment = useCallback(
    (appointmentData: Omit<Appointment, "id" | "createdAt" | "updatedAt">) => {
      return dispatch(createAppointment(appointmentData));
    },
    [dispatch]
  );

  const editAppointment = useCallback(
    (id: number, appointmentData: Partial<Appointment>) => {
      return dispatch(updateAppointment({ id, appointmentData }));
    },
    [dispatch]
  );

  const removeAppointment = useCallback(
    async (id: number) => {
      try {
        if (import.meta.env.DEV) {
          console.log("Removing appointment with ID:", id);
        }
        
        const result = await dispatch(deleteAppointment(id));
        
        if (import.meta.env.DEV) {
          console.log("Delete appointment result:", result);
        }
        
        return result;
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Error in removeAppointment:", error);
        }
        throw error;
      }
    },
    [dispatch]
  );

  const rejectAppointment = useCallback(
    async (id: number, reason: string) => {
      try {
        if (import.meta.env.DEV) {
          console.log(`Rejecting appointment with ID: ${id}, reason: ${reason}`);
        }

        // Use the dedicated API endpoint for rejecting appointments
        const response = await appointmentApi.rejectAppointment(id, reason);
        
        if (import.meta.env.DEV) {
          console.log(`Appointment rejected successfully:`, response.data);
        }

        // Update the Redux store with the updated appointment
        dispatch(
          updateAppointment({
            id,
            appointmentData: response.data,
          })
        );

        // Refresh the appointments list
        dispatch(fetchMyUpcomingAppointments());

        return response.data;
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Error rejecting appointment:", error);
        }
        throw error;
      }
    },
    [dispatch]
  );

  const getMyAppointments = useCallback(() => {
    if (import.meta.env.DEV) {
      console.log("Fetching my appointments for user role:", user?.role);
    }
    return dispatch(fetchMyAppointments()).then((result) => {
      if (import.meta.env.DEV) {
        console.log("My appointments result:", result);
      }
      return result;
    });
  }, [dispatch, user?.role]);

  const getMyUpcomingAppointments = useCallback(() => {
    if (import.meta.env.DEV) {
      console.log("Fetching my upcoming appointments for user role:", user?.role);
    }

    // Use the regular Redux action instead of custom API calls
    return dispatch(fetchMyUpcomingAppointments()).then((result) => {
      if (import.meta.env.DEV) {
        console.log("My upcoming appointments result:", result);
      }
      return result;
    });
  }, [dispatch, user?.role]);

  const confirmAppointmentStatus = useCallback(
    async (id: number) => {
      try {
        if (import.meta.env.DEV) {
          console.log(`Confirming appointment with ID: ${id}`);
        }

        // Use the dedicated API endpoint for confirming appointments
        const response = await appointmentApi.confirmAppointment(id);
        
        if (import.meta.env.DEV) {
          console.log(`Appointment confirmed successfully:`, response.data);
        }

        // Update the Redux store with the updated appointment
        dispatch(
          updateAppointment({
            id,
            appointmentData: response.data,
          })
        );

        // Refresh the appointments list
        dispatch(fetchMyUpcomingAppointments());

        return response.data;
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Error confirming appointment:", error);
        }
        throw error;
      }
    },
    [dispatch]
  );

  const clearAppointment = useCallback(() => {
    dispatch(clearCurrentAppointment());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearAppointmentsError());
  }, [dispatch]);

  return {
    appointments,
    currentAppointment,
    loading,
    error,
    getAppointments,
    getAppointmentById,
    getAppointmentsByDateRange,
    addAppointment,
    editAppointment,
    removeAppointment,
    rejectAppointment,
    getMyAppointments,
    getMyUpcomingAppointments,
    confirmAppointmentStatus,
    clearAppointment,
    clearError,
  };
};
