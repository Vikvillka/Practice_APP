import React, { useContext } from 'react';
import { Box, Typography, Divider, IconButton, Link } from '@mui/material';
import { NavLink } from 'react-router-dom';
import { Context } from '../index';
import {
  Instagram as InstagramIcon,
  Telegram as TwitterIcon,
  YouTube as YouTubeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

const Footer = () => {
  const { store } = useContext(Context);
  return (
    <Box component="footer" sx={{
      backgroundColor: '#2E2E2E',
      color: '#F4F1EF',
      mt: '60px',
      padding: { xs: '40px 20px', md: '60px 40px' },
    }}>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' },
        gap: { xs: 3, md: 6 },
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <Box>
          <Typography variant="h5" sx={{ 
            mb: 2,
            color: '#a',
            display: 'flex',
            alignItems: 'center'
          }}>
            YourFit
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 2, color: '#aaa' }}>
            Сеть современных фитнес-центров с лучшим оборудованием и профессиональными тренерами.
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PhoneIcon sx={{ color: '#e37243', mr: 1 }} />
            <Typography>+375 (29) 315-87-67</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <EmailIcon sx={{ color: '#e37243', mr: 1 }} />
            <Typography>bychkovskayavic@gmail.com</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ScheduleIcon sx={{ color: '#e37243', mr: 1 }} />
            <Typography>Ежедневно с 8:00 до 23:00</Typography>
          </Box>
        </Box>

        {(store.user.Role === 'client' || !store.isAuth) && (
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: { xs: 'flex-start', sm: 'center' }
          }}>
            <Typography variant="h6" sx={{ 
              mb: 2,
              color: '#aaa',
            }}>
              Навигация
            </Typography>
            
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }}>
              <Link 
                component={NavLink} 
                to="/shedule" 
                sx={{ 
                  color: '#aaa9',
                  textDecoration: 'none',
                  '&:hover': {
                    color: '#e37243'
                  }
                }}
              >
                Расписание
              </Link>
              <Link 
                component={NavLink} 
                to="/centers" 
                sx={{ 
                  color: '#aaa9',
                  textDecoration: 'none',
                  '&:hover': {
                    color: '#e37243'
                  }
                }}
              >
                Центры
              </Link>
              <Link 
                component={NavLink} 
                to="/subscriptions" 
                sx={{ 
                  color: '#aaa9',
                  textDecoration: 'none',
                  '&:hover': {
                    color: '#e37243'
                  }
                }}
              >
                Абонементы
              </Link>
              <Link 
                component={NavLink} 
                to="/trainers" 
                sx={{ 
                  color: '#aaa9',
                  textDecoration: 'none',
                  '&:hover': {
                    color: '#e37243'
                  }
                }}
              >
                Тренеры
              </Link>
            </Box>
          </Box>
        )}

        <Box>
          <Typography variant="h6" sx={{ 
            mb: 2,
            color: '#aaa',
          }}>
            Мы в соцсетях
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            
            <IconButton 
              sx={{ 
                backgroundColor: '#e4405f',
                color: 'white',
                '&:hover': { backgroundColor: '#d23356' }
              }}
              href="https://www.instagram.com/vikvillka/"
              target="_blank"
            >
              <InstagramIcon />
            </IconButton>
            
            <IconButton 
              sx={{ 
                backgroundColor: '#1da1f2',
                color: 'white',
                '&:hover': { backgroundColor: '#0d8ddb' }
              }}
              href="https://t.me/@vikvilkaa"
              target="_blank"
            >
              <TwitterIcon />
            </IconButton>
            
            <IconButton 
              sx={{ 
                backgroundColor: '#cd201f',
                color: 'white',
                '&:hover': { backgroundColor: '#b31a1a' }
              }}
              href="https://www.youtube.com/channel/UCBXYBB6aPnNQVgRwVfbJO3A"
              target="_blank"
            >
              <YouTubeIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
      
      <Divider sx={{ 
        my: 4,
        backgroundColor: '#444'
      }} />
      
      <Typography variant="body2" sx={{ 
        textAlign: 'center',
        color: '#aaa'
      }}>
        © {new Date().getFullYear()} YourFit. Все права защищены.
      </Typography>
    </Box>
  );
};

export default Footer;