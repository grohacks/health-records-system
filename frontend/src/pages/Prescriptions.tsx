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
  Print as PrintIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { usePrescriptions } from "../hooks/usePrescriptions";
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

const Prescriptions: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const {
    prescriptions,
    loading,
    error,
    getAllPrescriptions,
    deletePrescriptionRecord,
    downloadFile,
  } = usePrescriptions();

  // Filtering and sorting state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    getAllPrescriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check if user has edit permissions
  const canEdit =
    user && (user.role === "ROLE_ADMIN" || user.role === "ROLE_DOCTOR");

  const handleView = (id: number) => {
    navigate(`/prescriptions/${id}`);
  };

  const handleEdit = (id: number) => {
    navigate(`/prescriptions/edit/${id}`);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this prescription?")) {
      deletePrescriptionRecord(id);
    }
  };

  const handleDownload = (id: number, fileName?: string) => {
    downloadFile(id, fileName || `prescription-${id}.pdf`);
  };

  const handlePrint = (id: number) => {
    // TODO: Implement print functionality
    console.log("Print prescription:", id);
  };

  const handleAddNew = () => {
    navigate("/prescriptions/new");
  };

  // Filter and sort prescriptions
  const filteredAndSortedPrescriptions = prescriptions
    .filter((prescription) => {
      // Apply search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        prescription.medicationName.toLowerCase().includes(searchLower) ||
        (prescription.dosage &&
          prescription.dosage.toLowerCase().includes(searchLower)) ||
        (prescription.instructions &&
          prescription.instructions.toLowerCase().includes(searchLower)) ||
        (prescription.patientName &&
          prescription.patientName.toLowerCase().includes(searchLower)) ||
        (prescription.doctorName &&
          prescription.doctorName.toLowerCase().includes(searchLower));

      // Apply category filter
      if (filterBy === "all") return matchesSearch;
      if (filterBy === "active") {
        const now = new Date();
        const endDate = new Date(prescription.endDate);
        return matchesSearch && endDate >= now;
      }
      if (filterBy === "expired") {
        const now = new Date();
        const endDate = new Date(prescription.endDate);
        return matchesSearch && endDate < now;
      }

      return matchesSearch;
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortBy === "newest") {
        return (
          new Date(b.startDate || b.createdAt).getTime() -
          new Date(a.startDate || a.createdAt).getTime()
        );
      }
      if (sortBy === "oldest") {
        return (
          new Date(a.startDate || a.createdAt).getTime() -
          new Date(b.startDate || b.createdAt).getTime()
        );
      }
      if (sortBy === "name") {
        return a.medicationName.localeCompare(b.medicationName);
      }
      if (sortBy === "patient" && a.patientName && b.patientName) {
        return a.patientName.localeCompare(b.patientName);
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
        <GradientTypography variant="h4">Prescriptions</GradientTypography>
        {canEdit && (
          <GradientButton
            startIcon={<AddIcon />}
            onClick={handleAddNew}
            sx={{ px: 3 }}
          >
            New Prescription
          </GradientButton>
        )}
      </Grid>

      {/* Search and Filter Controls */}
      <Grid item xs={12}>
        <StyledCard sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search prescriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter By</InputLabel>
                <Select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  label="Filter By"
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterListIcon />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="all">All Prescriptions</MenuItem>
                  <MenuItem value="active">Active Prescriptions</MenuItem>
                  <MenuItem value="expired">Expired Prescriptions</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                  startAdornment={
                    <InputAdornment position="start">
                      <SortIcon />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="newest">Newest First</MenuItem>
                  <MenuItem value="oldest">Oldest First</MenuItem>
                  <MenuItem value="name">Medication Name</MenuItem>
                  <MenuItem value="patient">Patient Name</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </StyledCard>
      </Grid>

      <Grid item xs={12}>
        <StyledCard>
          <StyledTableContainer>
            <StyledTable>
              <StyledTableHead>
                <StyledTableRow>
                  <StyledTableCell>Start Date</StyledTableCell>
                  <StyledTableCell>End Date</StyledTableCell>
                  <StyledTableCell>Patient</StyledTableCell>
                  <StyledTableCell>Medication</StyledTableCell>
                  <StyledTableCell>Dosage</StyledTableCell>
                  <StyledTableCell>Status</StyledTableCell>
                  <StyledTableCell>Actions</StyledTableCell>
                </StyledTableRow>
              </StyledTableHead>
              <StyledTableBody>
                {filteredAndSortedPrescriptions.length === 0 ? (
                  <StyledTableRow>
                    <StyledTableCell colSpan={7} align="center">
                      <Typography variant="body1" sx={{ py: 2 }}>
                        No prescriptions found
                      </Typography>
                    </StyledTableCell>
                  </StyledTableRow>
                ) : (
                  filteredAndSortedPrescriptions.map((prescription) => {
                    // Determine if prescription is active or expired
                    const now = new Date();
                    const endDate = new Date(prescription.endDate);
                    const isActive = endDate >= now;

                    return (
                      <StyledTableRow key={prescription.id}>
                        <StyledTableCell>
                          {new Date(
                            prescription.startDate
                          ).toLocaleDateString()}
                        </StyledTableCell>
                        <StyledTableCell>
                          {new Date(prescription.endDate).toLocaleDateString()}
                        </StyledTableCell>
                        <StyledTableCell>
                          {prescription.patientName || "Unknown Patient"}
                        </StyledTableCell>
                        <StyledTableCell>
                          {prescription.medicationName}
                        </StyledTableCell>
                        <StyledTableCell>{prescription.dosage}</StyledTableCell>
                        <StyledTableCell>
                          <Chip
                            label={isActive ? "Active" : "Expired"}
                            color={isActive ? "success" : "error"}
                            size="small"
                          />
                        </StyledTableCell>
                        <StyledTableCell>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleView(prescription.id)}
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
                                  onClick={() => handleEdit(prescription.id)}
                                  color="primary"
                                  sx={{
                                    "&:hover": {
                                      backgroundColor:
                                        "rgba(25, 118, 210, 0.1)",
                                    },
                                  }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                            )}

                            <Tooltip title="Print">
                              <IconButton
                                size="small"
                                onClick={() => handlePrint(prescription.id)}
                                color="info"
                                sx={{
                                  "&:hover": {
                                    backgroundColor: "rgba(2, 136, 209, 0.1)",
                                  },
                                }}
                              >
                                <PrintIcon />
                              </IconButton>
                            </Tooltip>

                            {canEdit && (
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDelete(prescription.id)}
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
                    );
                  })
                )}
              </StyledTableBody>
            </StyledTable>
          </StyledTableContainer>
        </StyledCard>
      </Grid>
    </Grid>
  );
};

export default Prescriptions;
