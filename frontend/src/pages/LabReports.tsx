import React, { useEffect, useState } from "react";
import {
  Grid,
  IconButton,
  CircularProgress,
  Alert,
  Box,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  Typography,
  Chip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useLabReports } from "../hooks/useLabReports";
import {
  StyledCard,
  StyledTableContainer,
  StyledTable,
  StyledTableHead,
  StyledTableRow,
  StyledTableCell,
  StyledTableBody,
  GradientButton,
  GradientTypography,
} from "../styles/shared";

const LabReports: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const {
    reports,
    loading,
    error,
    getAllReports,
    getReportsByPatient,
    getReportsByDoctor,
    deleteReport,
    downloadFile,
  } = useLabReports();

  // Filtering and sorting state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Load data on component mount - SINGLE CALL ONLY
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (!user) {
        if (isMounted) {
          getAllReports();
        }
        return;
      }

      if (user.role === "ROLE_PATIENT") {
        if (isMounted) {
          getReportsByPatient(user.id);
        }
      } else if (user.role === "ROLE_DOCTOR") {
        if (isMounted) {
          getReportsByDoctor(user.id);
        }
      } else {
        if (isMounted) {
          getAllReports();
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role]);

  // Check if user has edit permissions
  const canEdit =
    user && (user.role === "ROLE_ADMIN" || user.role === "ROLE_DOCTOR");

  const handleView = (id: number) => {
    navigate(`/lab-reports/${id}`);
  };

  const handleEdit = (id: number) => {
    navigate(`/lab-reports/edit/${id}`);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      deleteReport(id);
    }
  };

  const handleDownload = (id: number, fileName?: string) => {
    downloadFile(id, fileName || `lab-report-${id}.pdf`);
  };

  const handleAddNew = () => {
    navigate("/lab-reports/new");
  };

  // Filter and sort reports
  const filteredAndSortedReports = reports
    .filter((report) => {
      // Apply search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        report.testName.toLowerCase().includes(searchLower) ||
        (report.testResults &&
          report.testResults.toLowerCase().includes(searchLower)) ||
        (report.patient &&
          report.patient.firstName &&
          report.patient.lastName &&
          `${report.patient.firstName} ${report.patient.lastName}`
            .toLowerCase()
            .includes(searchLower)) ||
        (report.doctor &&
          report.doctor.firstName &&
          report.doctor.lastName &&
          `${report.doctor.firstName} ${report.doctor.lastName}`
            .toLowerCase()
            .includes(searchLower));

      // Apply category filter
      if (filterBy === "all") return matchesSearch;
      if (filterBy === "withFile") return matchesSearch && !!report.fileUrl;
      if (filterBy === "withoutFile") return matchesSearch && !report.fileUrl;

      return matchesSearch;
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortBy === "newest") {
        return (
          new Date(b.testDate || b.createdAt).getTime() -
          new Date(a.testDate || a.createdAt).getTime()
        );
      }
      if (sortBy === "oldest") {
        return (
          new Date(a.testDate || a.createdAt).getTime() -
          new Date(b.testDate || b.createdAt).getTime()
        );
      }
      if (sortBy === "name") {
        return a.testName.localeCompare(b.testName);
      }
      if (sortBy === "patient" && a.patient && b.patient) {
        return `${a.patient.lastName || ""} ${
          a.patient.firstName || ""
        }`.localeCompare(
          `${b.patient.lastName || ""} ${b.patient.firstName || ""}`
        );
      }
      return 0;
    });

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
      <Grid container spacing={3}>
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
        <GradientTypography variant="h4">Lab Reports</GradientTypography>
        <GradientButton
          startIcon={<AddIcon />}
          onClick={handleAddNew}
          sx={{ px: 3 }}
        >
          New Report
        </GradientButton>
      </Grid>
      <Grid item xs={12}>
        <StyledCard>
          <StyledTableContainer>
            <StyledTable>
              <StyledTableHead>
                <StyledTableRow>
                  <StyledTableCell>Test Date</StyledTableCell>
                  <StyledTableCell>Patient</StyledTableCell>
                  <StyledTableCell>Test Name</StyledTableCell>
                  <StyledTableCell>Results</StyledTableCell>
                  <StyledTableCell>File</StyledTableCell>
                  <StyledTableCell>Doctor</StyledTableCell>
                  <StyledTableCell>Actions</StyledTableCell>
                </StyledTableRow>
              </StyledTableHead>
              <StyledTableBody>
                {filteredAndSortedReports.length === 0 ? (
                  <StyledTableRow>
                    <StyledTableCell colSpan={7} align="center">
                      <Typography variant="body1" sx={{ py: 2 }}>
                        No lab reports found
                      </Typography>
                    </StyledTableCell>
                  </StyledTableRow>
                ) : (
                  filteredAndSortedReports.map((report) => (
                    <StyledTableRow key={report.id}>
                      <StyledTableCell>
                        {new Date(
                          report.testDate || report.createdAt
                        ).toLocaleDateString()}
                      </StyledTableCell>
                      <StyledTableCell>
                        {report.patient && report.patient.firstName
                          ? `${report.patient.firstName} ${report.patient.lastName}`
                          : "Unknown Patient"}
                      </StyledTableCell>
                      <StyledTableCell>{report.testName}</StyledTableCell>
                      <StyledTableCell>
                        <Chip
                          label={report.testResults ? "Available" : "Pending"}
                          color={report.testResults ? "success" : "warning"}
                          size="small"
                        />
                      </StyledTableCell>
                      <StyledTableCell>
                        {report.fileUrl ? "Yes" : "No"}
                      </StyledTableCell>
                      <StyledTableCell>
                        {report.doctor && report.doctor.firstName
                          ? `${report.doctor.firstName} ${report.doctor.lastName}`
                          : "Unknown Doctor"}
                      </StyledTableCell>
                      <StyledTableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleView(report.id)}
                              color="primary"
                              sx={{
                                "&:hover": {
                                  backgroundColor: "rgba(25, 118, 210, 0.1)",
                                },
                              }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>

                          {canEdit && (
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(report.id)}
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

                          {report.fileUrl && report.fileName && (
                            <Tooltip title="Download File">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleDownload(
                                    report.id,
                                    report.fileName || undefined
                                  )
                                }
                                color="info"
                                sx={{
                                  "&:hover": {
                                    backgroundColor: "rgba(2, 136, 209, 0.1)",
                                  },
                                }}
                              >
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          {canEdit && (
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(report.id)}
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
                )}
              </StyledTableBody>
            </StyledTable>
          </StyledTableContainer>
        </StyledCard>
      </Grid>
    </Grid>
  );
};

export default LabReports;
