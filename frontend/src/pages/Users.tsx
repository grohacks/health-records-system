import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Grid,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  Checkbox,
  FormControlLabel,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useUsers } from "../hooks/useUsers";
import { User } from "../types";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { Navigate } from "react-router-dom";
import {
  StyledCard,
  StyledTableContainer,
  StyledTable,
  StyledTableHead,
  StyledTableRow,
  StyledTableCell,
  StyledTableBody,
  GradientTypography,
  StyledButton,
  StyledAvatar,
} from "../styles/shared";
import UserRoleFilter from "../components/UserRoleFilter";
import ExportUsersButton from "../components/ExportUsersButton";

const Users: React.FC = () => {
  const { users, loading, error, getUsers, removeUser } = useUsers();
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Get the current user from Redux store
  const { user } = useSelector((state: RootState) => state.auth);

  // Redirect non-admin users to dashboard
  if (user && user.role !== "ROLE_ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    getUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter users based on selected roles
  const filteredUsers =
    selectedRoles.length > 0
      ? users.filter((user) => selectedRoles.includes(user.role))
      : users;

  // Handle role filter change
  const handleRoleFilterChange = (roles: string[]) => {
    setSelectedRoles(roles);
    // Reset selected users when filter changes
    setSelectedUsers([]);
    setSelectAll(false);
  };

  // Handle user selection
  const handleUserSelect = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.id));
    }
    setSelectAll(!selectAll);
  };

  // Update selectAll state when individual selections change
  useEffect(() => {
    if (
      filteredUsers.length > 0 &&
      selectedUsers.length === filteredUsers.length
    ) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedUsers, filteredUsers]);

  const handleEdit = (id: number) => {
    // TODO: Implement edit functionality
    console.log("Edit user:", id);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await removeUser(id);
      // Remove from selected users if it was selected
      if (selectedUsers.includes(id)) {
        setSelectedUsers((prev) => prev.filter((userId) => userId !== id));
      }
    }
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
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <GradientTypography variant="h4" gutterBottom>
            Users
          </GradientTypography>
        </Grid>

        <Grid item xs={12}>
          <StyledCard>
            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Grid item>
                <StyledButton
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={() => getUsers()}
                >
                  Refresh
                </StyledButton>
              </Grid>
              <Grid item>
                <StyledButton
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleEdit(0)}
                >
                  Add User
                </StyledButton>
              </Grid>
              <Grid item>
                <UserRoleFilter
                  selectedRoles={selectedRoles}
                  onChange={handleRoleFilterChange}
                />
              </Grid>
              <Grid item>
                <ExportUsersButton
                  users={filteredUsers}
                  selectedUsers={
                    selectedUsers.length > 0 ? selectedUsers : undefined
                  }
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Grid item>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectAll}
                      onChange={handleSelectAll}
                      color="primary"
                    />
                  }
                  label={`Select All (${filteredUsers.length})`}
                />
              </Grid>
              {selectedUsers.length > 0 && (
                <Grid item>
                  <Chip
                    label={`${selectedUsers.length} users selected`}
                    color="primary"
                    variant="outlined"
                  />
                </Grid>
              )}
            </Grid>

            <StyledTableContainer>
              <StyledTable>
                <StyledTableHead>
                  <StyledTableRow>
                    <StyledTableCell padding="checkbox">
                      <Checkbox
                        checked={selectAll}
                        onChange={handleSelectAll}
                        color="primary"
                      />
                    </StyledTableCell>
                    <StyledTableCell>User</StyledTableCell>
                    <StyledTableCell>Email</StyledTableCell>
                    <StyledTableCell>Role</StyledTableCell>
                    <StyledTableCell>Created At</StyledTableCell>
                    <StyledTableCell align="right">Actions</StyledTableCell>
                  </StyledTableRow>
                </StyledTableHead>
                <StyledTableBody>
                  {filteredUsers.length === 0 ? (
                    <StyledTableRow>
                      <StyledTableCell colSpan={6} align="center">
                        {selectedRoles.length > 0
                          ? `No users found with the selected role(s): ${selectedRoles.join(
                              ", "
                            )}`
                          : "No users found"}
                      </StyledTableCell>
                    </StyledTableRow>
                  ) : (
                    filteredUsers.map((user: User) => (
                      <StyledTableRow
                        key={user.id}
                        selected={selectedUsers.includes(user.id)}
                        hover
                      >
                        <StyledTableCell padding="checkbox">
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleUserSelect(user.id)}
                            color="primary"
                          />
                        </StyledTableCell>
                        <StyledTableCell>
                          <Grid container spacing={1} alignItems="center">
                            <Grid item>
                              <StyledAvatar>
                                {user.firstName[0]}
                                {user.lastName[0]}
                              </StyledAvatar>
                            </Grid>
                            <Grid item>
                              {user.firstName} {user.lastName}
                            </Grid>
                          </Grid>
                        </StyledTableCell>
                        <StyledTableCell>{user.email}</StyledTableCell>
                        <StyledTableCell>
                          <Chip
                            label={user.role.replace("ROLE_", "")}
                            color={
                              user.role === "ROLE_ADMIN"
                                ? "primary"
                                : user.role === "ROLE_DOCTOR"
                                ? "success"
                                : "default"
                            }
                            size="small"
                          />
                        </StyledTableCell>
                        <StyledTableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          <Tooltip title="Edit User">
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(user.id)}
                              sx={{ mr: 1 }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete User">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(user.id)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
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
    </motion.div>
  );
};

export default Users;
