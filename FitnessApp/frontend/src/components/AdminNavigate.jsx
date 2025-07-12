import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  IconButton,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
  useTheme
} from "@mui/material";
import './styles/header.css'; 
import MenuIcon from "@mui/icons-material/Menu";

const AdminNavigate = () => {
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
    { path: "/admin/user", label: "Пользователи" },
    {
      label: "Центры",
      subItems: [
        { path: "/admin/center/create", label: "Добавить центр" },
        { path: "/admin/center/", label: "Управление центрами" }
      ]
    },
    {
      label: "Тренеры",
      subItems: [
        { path: "/admin/trainer/create", label: "Добавить тренера" },
        { path: "/admin/trainer", label: "Управление тренерами" }
      ]
    }
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
              <div key={item.path || item.label}>
                {item.path ? (
                  <>
                    <MenuItem
                      component={NavLink}
                      to={item.path} end
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
                  </>
                ) : (
                  <>
                    <MenuItem
                      sx={{
                        font: "300 calc(12px + 4 * (100vw/1440)) Inter, sans-serif",
                        color: "#F4F1EF",
                        pointerEvents: "none"
                      }}
                    >
                      {item.label}
                    </MenuItem>
                    {item.subItems.map((subItem) => (
                      <MenuItem
                        key={subItem.path}
                        component={NavLink}
                        to={subItem.path} end
                        onClick={handleMenuClose}
                        sx={{
                          font: "300 calc(12px + 4 * (100vw/1440)) Inter, sans-serif",
                          color: "#F4F1EF",
                          pl: 4,
                          '&.active': {
                            color: "#e37243",
                          },
                          '&:hover': {
                            color: "#e37243",
                            backgroundColor: "transparent"
                          }
                        }}
                      >
                        {subItem.label}
                      </MenuItem>
                    ))}
                    <Divider sx={{ bgcolor: "#666", my: 0 }} />
                  </>
                )}
              </div>
            ))}
          </Menu>
        </>
      ) : (
        <ul className="menu-list">
          {menuItems.map((item) => (
            <li key={item.path || item.label} className={item.subItems ? "dropdown" : "links"}>
              {item.path ? (
                <>
                  <NavLink
                    to={item.path} end
                    className={({ isActive }) => 
                      isActive ? "active-link" : "link"
                    }
                    style={({ isActive }) => ({
                      textDecoration: "none",
                      color: isActive ? "#e37243" : "#F4F1EF",
                      font: "300 calc(12px + 4 * (100vw/1440)) Inter, sans-serif",
                      marginTop: "3px",
                      position: "relative",
                      paddingBottom: "4px"
                    })}
                  >
                    {item.label}
                  </NavLink>
                  <div className="line-div" />
                </>
              ) : (
                <>
                  <div className="dropdown-link">
                    {item.label}
                    <span className="arrow"></span>
                  </div>
                  <div className="dropdown-menu">
                    {item.subItems.map((subItem) => (
                      <NavLink
                        key={subItem.path}
                        to={subItem.path} end
                        className={({ isActive }) => 
                          isActive ? "dropdown-item active" : "dropdown-item"
                        }
                        style={({ isActive }) => ({
                          textDecoration: "none",
                          color: isActive ? "#e37243" : "#F4F1EF",
                        })}
                      >
                        {subItem.label}
                      </NavLink>
                    ))}
                  </div>
                  <div className="line-div" />
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminNavigate;