import "./styles/global.css";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "./store";
import theme from "./theme";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import MedicalRecords from "./pages/MedicalRecords";
import MedicalRecordForm from "./pages/MedicalRecordForm";
import MedicalRecordView from "./pages/MedicalRecordView";
import LabReports from "./pages/LabReports";
import LabReportForm from "./pages/LabReportForm";
import LabReportView from "./pages/LabReportView";
import Prescriptions from "./pages/Prescriptions";
import PrescriptionForm from "./pages/PrescriptionForm";
import PrescriptionView from "./pages/PrescriptionView";
import Users from "./pages/Users";
import Appointments from "./pages/Appointments";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, token } = useSelector(
    (state: RootState) => state.auth
  );

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="medical-records" element={<MedicalRecords />} />
          <Route path="medical-records/new" element={<MedicalRecordForm />} />
          <Route
            path="medical-records/edit/:id"
            element={<MedicalRecordForm />}
          />
          <Route path="medical-records/:id" element={<MedicalRecordView />} />
          <Route path="lab-reports" element={<LabReports />} />
          <Route path="lab-reports/new" element={<LabReportForm />} />
          <Route path="lab-reports/edit/:id" element={<LabReportForm />} />
          <Route path="lab-reports/:id" element={<LabReportView />} />
          <Route path="prescriptions" element={<Prescriptions />} />
          <Route path="prescriptions/new" element={<PrescriptionForm />} />
          <Route path="prescriptions/edit/:id" element={<PrescriptionForm />} />
          <Route path="prescriptions/:id" element={<PrescriptionView />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="users" element={<Users />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
};

export default App;
