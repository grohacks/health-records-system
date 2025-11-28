import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  MedicalServices as MedicalIcon,
  Science as ScienceIcon,
  LocalPharmacy as PharmacyIcon,
  Logout as LogoutIcon,
  People as PeopleIcon,
  ChevronLeft as ChevronLeftIcon,
  Event as EventIcon,
} from "@mui/icons-material";
import ChatbotButton from "./chatbot/ChatbotButton";
import { RootState } from "../store";
import { logout } from "../store/slices/authSlice";
import { styled } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";

const drawerWidth = 280;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    width: drawerWidth,
    boxSizing: "border-box",
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(10px)",
    borderRight: "1px solid rgba(255, 255, 255, 0.2)",
  },
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(10px)",
  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
  borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  margin: "8px 16px",
  borderRadius: "12px",
  transition: "all 0.3s ease",
  "&:hover": {
    background: "rgba(102, 126, 234, 0.1)",
    transform: "translateX(5px)",
  },
  "&.Mui-selected": {
    background: "linear-gradient(45deg, #667eea, #764ba2)",
    color: "white",
    "& .MuiListItemIcon-root": {
      color: "white",
    },
  },
}));

// Base menu items for all users
const baseMenuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { text: "Profile", icon: <PersonIcon />, path: "/profile" },
  { text: "Medical Records", icon: <MedicalIcon />, path: "/medical-records" },
  { text: "Lab Reports", icon: <ScienceIcon />, path: "/lab-reports" },
  { text: "Prescriptions", icon: <PharmacyIcon />, path: "/prescriptions" },
  { text: "Appointments", icon: <EventIcon />, path: "/appointments" },
];

// Admin-only menu items
const adminMenuItems = [
  { text: "Users", icon: <PeopleIcon />, path: "/users" },
];

const Layout = () => {
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user } = useSelector((state: RootState) => state.auth);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: "#f5f7fa" }}>
      <StyledAppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2, color: "#667eea" }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              background: "linear-gradient(45deg, #667eea, #764ba2)",
              backgroundClip: "text",
              textFillColor: "transparent",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 700,
            }}
          >
            Health Records
          </Typography>
          <IconButton
            onClick={handleProfileMenuOpen}
            size="small"
            sx={{ ml: 2 }}
            aria-controls="menu-appbar"
            aria-haspopup="true"
          >
            <Avatar
              sx={{
                background: "linear-gradient(45deg, #667eea, #764ba2)",
                width: 32,
                height: 32,
              }}
            >
              {user?.firstName?.[0]}
            </Avatar>
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem onClick={() => navigate("/profile")}>Profile</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </StyledAppBar>
      <StyledDrawer
        variant={isMobile ? "temporary" : "persistent"}
        anchor="left"
        open={open}
        onClose={handleDrawerToggle}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto", mt: 2 }}>
          <List>
            {/* Render base menu items for all users */}
            {baseMenuItems.map((item) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <StyledListItem
                  button
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                >
                  <ListItemIcon
                    sx={{
                      color:
                        location.pathname === item.path ? "white" : "#667eea",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </StyledListItem>
              </motion.div>
            ))}

            {/* Render admin-only menu items if user is admin */}
            {user?.role === "ROLE_ADMIN" &&
              adminMenuItems.map((item) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <StyledListItem
                    button
                    selected={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                  >
                    <ListItemIcon
                      sx={{
                        color:
                          location.pathname === item.path ? "white" : "#667eea",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                  </StyledListItem>
                </motion.div>
              ))}
          </List>
          <Divider sx={{ my: 2 }} />
          <List>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <StyledListItem button onClick={handleLogout}>
                <ListItemIcon sx={{ color: "#667eea" }}>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </StyledListItem>
            </motion.div>
          </List>
        </Box>
      </StyledDrawer>
      <Main open={open}>
        <Toolbar />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </Main>
      <ChatbotButton />
    </Box>
  );
};

export default Layout;
