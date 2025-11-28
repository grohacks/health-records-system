export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: "ROLE_PATIENT" | "ROLE_DOCTOR" | "ROLE_ADMIN";
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecord {
  id: number;
  diagnosis: string;
  treatment: string;
  notes?: string;
  doctor: User;
  patient: User;
  createdAt: string;
  updatedAt: string;
  prescriptions?: Prescription[];
  labReports?: LabReport[];
}

export interface LabReport {
  id: number;
  patient: User;
  doctor: User;
  medicalRecordId?: number;
  testName: string;
  testResults: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  testDate: string;
  reportDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: number;
  medicalRecordId?: number;
  medicalRecord?: MedicalRecord;
  medicationName: string;
  dosage: string;
  instructions: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  // These fields are for display purposes only
  patientName?: string;
  doctorName?: string;
}

export interface Appointment {
  id: number;
  patient: User | number;
  doctor: User | number;
  appointmentDateTime: string;
  title: string;
  description?: string;
  status: "PENDING" | "APPROVED" | "CANCELLED" | "COMPLETED";
  notes?: string;
  isVideoConsultation: boolean;
  meetingLink?: string;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType =
  | "APPOINTMENT_REQUESTED"
  | "APPOINTMENT_CONFIRMED"
  | "APPOINTMENT_REJECTED"
  | "APPOINTMENT_CANCELLED"
  | "APPOINTMENT_REMINDER"
  | "SYSTEM";

export interface Notification {
  id: number;
  user: User | number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  relatedAppointment?: Appointment;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}
