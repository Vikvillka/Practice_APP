import React,  { useContext }from 'react';
import { Context } from '../../index';
import { Box, Typography, Divider, Tooltip } from '@mui/material';
import { NavLink } from 'react-router-dom';
import {
  FitnessCenter as TrainingIcon,
  PostAdd as TemplateIcon,
  Add as AddIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';

const TrainerQuickNav = () => {
  const { store } = useContext(Context);
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: '60px' }}>
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
          <DashboardIcon sx={{ color: '#e37243' }} /> Панель тренера
        </Typography>
        
        <Divider sx={{ backgroundColor: '#e0e0e0', mb: 3 }} />
        
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
          gap: 2
        }}>
          {/* Создать тренировку */}
          <Tooltip title="Создать новую тренировку" arrow>
            <Box
              component={NavLink}
              to="/trainer/training/create"
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
              <AddIcon sx={{ fontSize: 40, color: '#e37243', mb: 1 }} />
              <Typography variant="subtitle1">Создать тренировку</Typography>
            </Box>
          </Tooltip>

          <Tooltip title="Управление моими тренировками" arrow>
            <Box
              component={NavLink}
              to={`/trainer/training/${store.user.UserID}/trainings`}
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
              <TrainingIcon sx={{ fontSize: 40, color: '#e37243', mb: 1 }} />
              <Typography variant="subtitle1">Мои тренировки</Typography>
            </Box>
          </Tooltip>

          <Tooltip title="Создать новый шаблон тренировки" arrow>
            <Box
              component={NavLink}
              to="/trainer/template/create"
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
              <AddIcon sx={{ fontSize: 40, color: '#e37243', mb: 1 }} />
              <Typography variant="subtitle1">Создать шаблон</Typography>
            </Box>
          </Tooltip>

          <Tooltip title="Управление моими шаблонами" arrow>
            <Box
              component={NavLink}
              to={`/trainer/template/${store.user.UserID}/templates`}
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
              <TemplateIcon sx={{ fontSize: 40, color: '#e37243', mb: 1 }} />
              <Typography variant="subtitle1">Мои шаблоны</Typography>
            </Box>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

export default TrainerQuickNav;