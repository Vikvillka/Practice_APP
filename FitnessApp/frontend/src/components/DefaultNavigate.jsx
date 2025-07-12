import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  IconButton,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const DefaultNavigate = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    { path: "/shedule", label: "Расписание" },
    { path: "/centers", label: "Центры" },
    { path: "/trainers", label: "Тренеры" }
  ];

  return (
    <div className="link-container">
      {isMobile ? (
        <>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleMenuOpen}
            sx={{ 
              color: "#F4F1EF",
              p: 0,
              '&:hover': {
                color: "#e37243",
                backgroundColor: "transparent"
              }
            }}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                backgroundColor: "#2E2E2E",
                color: "#F4F1EF",
                width: "60%",
                mt: 1
              }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {menuItems.map((item) => (
              <div key={item.path}>
                <MenuItem
                  component={NavLink}
                  to={item.path}
                  onClick={handleMenuClose}
                  sx={{
                    font: "300 calc(12px + 4 * (100vw/1440)) Inter, sans-serif",
                    color: "#F4F1EF",
                    '&.active': {
                      color: "#e37243",
                    },
                    '&:hover': {
                      color: "#e37243",
                      backgroundColor: "transparent"
                    }
                  }}
                >
                  {item.label}
                </MenuItem>
                <Divider sx={{ bgcolor: "#666", my: 0 }} />
              </div>
            ))}
          </Menu>
        </>
      ) : (
        <ul className="menu-list">
          {menuItems.map((item) => (
            <li key={item.path} className="links">
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  isActive ? "active-link" : "link"
                }
                style={{
                  textDecoration: "none",
                  color: "#F4F1EF",
                  font: "300 calc(12px + 4 * (100vw/1440)) Inter, sans-serif",
                  marginTop: "3px",
                  position: "relative",
                  paddingBottom: "4px"
                }}
              >
                {item.label}
              </NavLink>
              <div className="line-div" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DefaultNavigate;