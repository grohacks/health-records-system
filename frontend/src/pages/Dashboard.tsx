import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  CardHeader,
  IconButton,
  Typography,
} from "@mui/material";
import {
  MedicalServices,
  Science,
  LocalPharmacy,
  Person,
  People,
  AdminPanelSettings,
  EventNote,
} from "@mui/icons-material";
import { useAppSelector } from "../store";
import { useMedicalRecords } from "../hooks/useMedicalRecords";
import { useLabReports } from "../hooks/useLabReports";
import { usePrescriptions } from "../hooks/usePrescriptions";
import { userApi } from "../services/api";
import { User } from "../types";
import {
  StyledCard,
  GradientTypography,
  StyledButton,
  GradientButton,
} from "../styles/shared";

interface DashboardStats {
  medicalRecords: number;
  labReports: number;
  prescriptions: number;
  patients: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    medicalRecords: 0,
    labReports: 0,
    prescriptions: 0,
    patients: 0,
  });

  const { records: medicalRecords, getAllRecords: getMedicalRecords } =
    useMedicalRecords();
  const { reports: labReports, getAllReports: getLabReports } = useLabReports();
  const { prescriptions, getAllPrescriptions: getPrescriptions } =
    usePrescriptions();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (user?.role === "ROLE_ADMIN") {
          try {
            const response = await userApi.getAll();

            // Handle different response formats
            let usersData;
            if (response && response.data) {
              usersData = response.data;
            } else if (response) {
              usersData = response;
            } else {
              usersData = [];
            }

            // Convert to array if it's not already
            const usersArray = Array.isArray(usersData)
              ? usersData
              : [usersData];

            console.log("Users array length:", usersArray.length);

            // Count doctors and patients
            let doctorCount = 0;
            let patientCount = 0;

            usersArray.forEach((user: any) => {
              if (user && user.role) {
                if (user.role === "ROLE_DOCTOR") {
                  doctorCount++;
                } else if (user.role === "ROLE_PATIENT") {
                  patientCount++;
                }
              }
            });

            setStats({
              medicalRecords: medicalRecords.length,
              labReports: labReports.length,
              prescriptions: prescriptions.length,
              patients: patientCount,
            });
          } catch (error) {
            console.error("Error processing users data:", error);
            setStats({
              medicalRecords: medicalRecords.length,
              labReports: labReports.length,
              prescriptions: prescriptions.length,
              patients: 0,
            });
          }
        } else {
          await Promise.all([
            getMedicalRecords(),
            getLabReports(),
            getPrescriptions(),
          ]);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role, medicalRecords.length, labReports.length, prescriptions.length]);

  const getSummaryCards = () => {
    if (user?.role === "ROLE_ADMIN") {
      return [
        {
          title: "Medical Records",
          value: medicalRecords.length,
          icon: <MedicalServices sx={{ fontSize: 40 }} />,
          color: "#1976d2",
        },
        {
          title: "Lab Reports",
          value: labReports.length,
          icon: <Science sx={{ fontSize: 40 }} />,
          color: "#2e7d32",
        },
        {
          title: "Prescriptions",
          value: prescriptions.length,
          icon: <LocalPharmacy sx={{ fontSize: 40 }} />,
          color: "#ed6c02",
        },
      ];
    }

    return [
      {
        title: "Medical Records",
        value: medicalRecords.length,
        icon: <MedicalServices sx={{ fontSize: 40 }} />,
        color: "#1976d2",
      },
      {
        title: "Lab Reports",
        value: labReports.length,
        icon: <Science sx={{ fontSize: 40 }} />,
        color: "#2e7d32",
      },
      {
        title: "Prescriptions",
        value: prescriptions.length,
        icon: <LocalPharmacy sx={{ fontSize: 40 }} />,
        color: "#ed6c02",
      },
    ];
  };

  const getQuickActions = () => {
    if (user?.role === "ROLE_ADMIN") {
      return [
        {
          text: "View Medical Records",
          icon: <MedicalServices />,
          path: "/medical-records",
        },
        {
          text: "View Lab Reports",
          icon: <Science />,
          path: "/lab-reports",
        },
        {
          text: "View Prescriptions",
          icon: <LocalPharmacy />,
          path: "/prescriptions",
        },
      ];
    }

    if (user?.role === "ROLE_DOCTOR") {
      return [
        {
          text: "Add Medical Record",
          icon: <MedicalServices />,
          path: "/medical-records/new",
        },
        {
          text: "Add Lab Report",
          icon: <Science />,
          path: "/lab-reports/new",
        },
        {
          text: "Add Prescription",
          icon: <LocalPharmacy />,
          path: "/prescriptions/new",
        },
      ];
    }

    return [
      {
        text: "View Medical Records",
        icon: <MedicalServices />,
        path: "/medical-records",
      },
      {
        text: "View Lab Reports",
        icon: <Science />,
        path: "/lab-reports",
      },
      {
        text: "View Prescriptions",
        icon: <LocalPharmacy />,
        path: "/prescriptions",
      },
      {
        text: "Update Profile",
        icon: <Person />,
        path: "/profile",
      },
    ];
  };

  const getRecentActivities = () => {
    if (user?.role === "ROLE_ADMIN") {
      return [
        {
          type: "User Management",
          description: "New user registered",
          date: new Date().toLocaleDateString(),
          icon: <People />,
        },
        {
          type: "System Update",
          description: "System settings updated",
          date: new Date().toLocaleDateString(),
          icon: <AdminPanelSettings />,
        },
      ];
    }

    const activities = [
      ...medicalRecords.map((record) => ({
        type: "Medical Record",
        description: record.diagnosis,
        date: new Date(record.createdAt).toLocaleDateString(),
        icon: <MedicalServices />,
      })),
      ...labReports.map((report) => ({
        type: "Lab Report",
        description: report.testName,
        date: new Date(report.testDate || report.createdAt).toLocaleDateString(),
        icon: <Science />,
      })),
      ...prescriptions.map((prescription) => ({
        type: "Prescription",
        description: prescription.medicationName,
        date: new Date(prescription.createdAt).toLocaleDateString(),
        icon: <LocalPharmacy />,
      })),
    ];

    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <GradientTypography variant="h4" gutterBottom>
        Welcome back, {user?.firstName}!
      </GradientTypography>

      <Grid container spacing={3}>
        {getSummaryCards().map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <StyledCard>
              <CardContent sx={{ textAlign: "center", p: 3 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                    mb: 2,
                    background: "linear-gradient(45deg, #667eea, #764ba2)",
                    color: "white",
                    boxShadow: "0 4px 20px rgba(102, 126, 234, 0.3)",
                  }}
                >
                  {card.icon}
                </Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    background: "linear-gradient(45deg, #667eea, #764ba2)",
                    backgroundClip: "text",
                    textFillColor: "transparent",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {card.value}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {card.title}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}

        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardHeader
              title={
                <GradientTypography variant="h6">
                  Quick Actions
                </GradientTypography>
              }
            />
            <CardContent>
              <List>
                {getQuickActions().map((action) => (
                  <ListItem
                    key={action.text}
                    button
                    onClick={() => navigate(action.path)}
                    sx={{
                      borderRadius: "12px",
                      mb: 1,
                      "&:hover": {
                        background: "rgba(0, 0, 0, 0.04)",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: "primary.main" }}>
                      {action.icon}
                    </ListItemIcon>
                    <ListItemText primary={action.text} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardHeader
              title={
                <GradientTypography variant="h6">
                  Recent Activities
                </GradientTypography>
              }
            />
            <CardContent>
              <List>
                {getRecentActivities().map((activity, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      borderRadius: "12px",
                      mb: 1,
                      "&:hover": {
                        background: "rgba(0, 0, 0, 0.04)",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: "primary.main" }}>
                      {activity.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.type}
                      secondary={
                        <>
                          {activity.description}
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                            sx={{ display: "block" }}
                          >
                            {activity.date}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
