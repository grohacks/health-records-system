import React, { useEffect } from "react";
import {
  Grid,
  IconButton,
  CircularProgress,
  Alert,
  Box,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  MedicalServices as MedicalServicesIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useMedicalRecords } from "../hooks/useMedicalRecords";
import {
  StyledCard,
  StyledTableContainer,
  StyledTable,
  StyledTableHead,
  StyledTableRow,
  StyledTableCell,
  StyledTableBody,
  StyledButton,
  GradientButton,
  GradientTypography,
} from "../styles/shared";

const MedicalRecords: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { records, loading, error, getAllRecords, deleteRecord } =
    useMedicalRecords();

  // Check if user has edit/delete permissions
  const canEdit =
    user && (user.role === "ROLE_ADMIN" || user.role === "ROLE_DOCTOR");
  const canDelete = user && user.role === "ROLE_ADMIN";

  useEffect(() => {
    getAllRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEdit = (id: number) => {
    navigate(`/medical-records/edit/${id}`);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      deleteRecord(id);
    }
  };

  const handleView = (id: number) => {
    navigate(`/medical-records/${id}`);
  };

  const handleAddNew = () => {
    navigate("/medical-records/new");
  };

  if (loading) {
    return (
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        style={{ minHeight: "200px" }}
      >
        <CircularProgress />
      </Grid>
    );
  }

  if (error) {
    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Alert severity="error">{error}</Alert>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid
        item
        xs={12}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box display="flex" alignItems="center">
          <MedicalServicesIcon sx={{ mr: 1, color: "#667eea" }} />
          <GradientTypography variant="h4">Medical Records</GradientTypography>
        </Box>

        {canEdit && (
          <GradientButton
            startIcon={<AddIcon />}
            onClick={handleAddNew}
            sx={{ px: 3 }}
          >
            New Record
          </GradientButton>
        )}
      </Grid>
      <Grid item xs={12}>
        <StyledCard>
          <StyledTableContainer>
            <StyledTable>
              <StyledTableHead>
                <StyledTableRow>
                  <StyledTableCell>Created Date</StyledTableCell>
                  <StyledTableCell>Patient</StyledTableCell>
                  <StyledTableCell>Diagnosis</StyledTableCell>
                  <StyledTableCell>Treatment</StyledTableCell>
                  <StyledTableCell>Doctor</StyledTableCell>
                  <StyledTableCell>Actions</StyledTableCell>
                </StyledTableRow>
              </StyledTableHead>
              <StyledTableBody>
                {Array.isArray(records) && records.length > 0 ? (
                  records.map((record) => (
                    <StyledTableRow key={record.id}>
                      <StyledTableCell>
                        {new Date(record.createdAt).toLocaleDateString()}
                      </StyledTableCell>
                      <StyledTableCell>
                        {typeof record.patient === "object" &&
                        record.patient &&
                        record.patient.firstName
                          ? `${record.patient.firstName || ""} ${
                              record.patient.lastName || ""
                            }`
                          : "Unknown Patient"}
                      </StyledTableCell>
                      <StyledTableCell>{record.diagnosis}</StyledTableCell>
                      <StyledTableCell>{record.treatment}</StyledTableCell>
                      <StyledTableCell>
                        {typeof record.doctor === "object" &&
                        record.doctor &&
                        record.doctor.firstName
                          ? `${record.doctor.firstName || ""} ${
                              record.doctor.lastName || ""
                            }`
                          : "Unknown Doctor"}
                      </StyledTableCell>
                      <StyledTableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleView(record.id)}
                              color="info"
                              sx={{
                                "&:hover": {
                                  backgroundColor: "rgba(2, 136, 209, 0.1)",
                                },
                              }}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>

                          {canEdit && (
                            <Tooltip title="Edit Record">
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(record.id)}
                                color="primary"
                                sx={{
                                  "&:hover": {
                                    backgroundColor: "rgba(25, 118, 210, 0.1)",
                                  },
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          {canDelete && (
                            <Tooltip title="Delete Record">
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(record.id)}
                                color="error"
                                sx={{
                                  "&:hover": {
                                    backgroundColor: "rgba(211, 47, 47, 0.1)",
                                  },
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </StyledTableCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <StyledTableRow>
                    <StyledTableCell colSpan={6} align="center">
                      No medical records found
                    </StyledTableCell>
                  </StyledTableRow>
                )}
              </StyledTableBody>
            </StyledTable>
          </StyledTableContainer>
        </StyledCard>
      </Grid>
    </Grid>
  );
};

export default MedicalRecords;
