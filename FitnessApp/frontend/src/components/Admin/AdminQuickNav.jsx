import React from 'react';
import { Box, Typography, Divider, IconButton, Tooltip } from '@mui/material';
import { NavLink } from 'react-router-dom';
import {
  People as PeopleIcon,
  FitnessCenter as CenterIcon,
  CardMembership as SubscriptionIcon,
  Person as TrainerIcon,
  PersonAdd as TrainerAddIcon,
  AddCard as AddCard,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  DomainAdd as DomainAddIcon
} from '@mui/icons-material';

const AdminQuickNav = () => {
  return (
    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', mt: '60px'}}>
    <Box sx={{
      backgroundColor: 'white',
      borderRadius: 2,
      p: 3,
      width: '90%',
      boxShadow: 3,
      mb: 4,
      borderLeft: '4px solid #e37243'
    }}>
      <Typography variant="h6" sx={{ 
        mb: 2,
        color: '#2E2E2E',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <DashboardIcon sx={{ color: '#e37243' }} /> Панель администратора
      </Typography>
      
      <Divider sx={{ backgroundColor: '#e0e0e0', mb: 3 }} />
      
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
        gap: 2
      }}>
          {/* Тренеры */}
          <Tooltip title="Добавить нового тренера" arrow>
          <Box
            component={NavLink}
            to="/admin/trainer/create"
            sx={{
              p: 2,
              borderRadius: 1,
              backgroundColor: '#f5f5f5',
              color: '#2E2E2E',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(227, 114, 67, 0.2)'
              }
            }}
          >
            <TrainerAddIcon sx={{ fontSize: 40, color: '#e37243', mb: 1 }} />
            <Typography variant="subtitle1">Добавить тренера</Typography>
          </Box>
        </Tooltip>

        {/* Центры */}
        <Tooltip title="Управление фитнес-центрами" arrow>
          <Box
            component={NavLink}
            to="/admin/center"
            sx={{
              p: 2,
              borderRadius: 1,
              backgroundColor: '#f5f5f5',
              color: '#2E2E2E',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(227, 114, 67, 0.2)'
              }
            }}
          >
            <CenterIcon sx={{ fontSize: 40, color: '#e37243', mb: 1 }} />
            <Typography variant="subtitle1">Центры</Typography>
          </Box>
        </Tooltip>

        {/* Абонементы */}
        <Tooltip title="Управление абонементами" arrow>
          <Box
            component={NavLink}
            to="/admin/subscription"
            sx={{
              p: 2,
              borderRadius: 1,
              backgroundColor: '#f5f5f5',
              color: '#2E2E2E',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(227, 114, 67, 0.2)'
              }
            }}
          >
            <SubscriptionIcon sx={{ fontSize: 40, color: '#e37243', mb: 1 }} />
            <Typography variant="subtitle1">Абонементы</Typography>
          </Box>
        </Tooltip>

        {/* Тренеры */}
        <Tooltip title="Управление тренерами" arrow>
          <Box
            component={NavLink}
            to="/admin/trainer"
            sx={{
              p: 2,
              borderRadius: 1,
              backgroundColor: '#f5f5f5',
              color: '#2E2E2E',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(227, 114, 67, 0.2)'
              }
            }}
          >
            <TrainerIcon sx={{ fontSize: 40, color: '#e37243', mb: 1 }} />
            <Typography variant="subtitle1">Тренеры</Typography>
          </Box>
        </Tooltip>

        {/* Создать центр */}
        <Tooltip title="Добавить новый фитнес-центр" arrow>
          <Box
            component={NavLink}
            to="/admin/center/create"
            sx={{
              p: 2,
              borderRadius: 1,
              backgroundColor: '#f5f5f5',
              color: '#2E2E2E',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(227, 114, 67, 0.2)'
              }
            }}
          >
            <DomainAddIcon sx={{ fontSize: 40, color: '#e37243', mb: 1 }} />
            <Typography variant="subtitle1">Добавить центр</Typography>
          </Box>
        </Tooltip>
        <Tooltip title="Добавить новый абонемент" arrow>
          <Box
            component={NavLink}
            to="/admin/subscription/create"
            sx={{
              p: 2,
              borderRadius: 1,
              backgroundColor: '#f5f5f5',
              color: '#2E2E2E',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(227, 114, 67, 0.2)'
              }
            }}
          >
             <AddCard sx={{ fontSize: 40, color: '#e37243', mb: 1 }} />
             <Typography variant="subtitle1">Добавить абонемент</Typography>
          </Box>
        </Tooltip>

        <Tooltip title="Управление пользователями" arrow>
          <Box
            component={NavLink}
            to="/admin/user"
            sx={{
              p: 2,
              borderRadius: 1,
              backgroundColor: '#f5f5f5',
              color: '#2E2E2E',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(227, 114, 67, 0.2)'
              }
            }}
          >
            <PeopleIcon sx={{ fontSize: 40, color: '#e37243', mb: 1 }} />
            <Typography variant="subtitle1">Пользователи</Typography>
          </Box>
        </Tooltip>
      </Box>
    </Box>
    </Box>
  );
};

export default AdminQuickNav;