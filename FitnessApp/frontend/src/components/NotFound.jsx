import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Typography,
  Container,
  Fade
} from '@mui/material';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import { Context } from '../index'; 

const NotFound = () => {
  const navigate = useNavigate();
  const { store } = useContext(Context); 
  const [showContent, setShowContent] = useState(false);
  const orangeMain = '#e37243';
  const orangeDark = '#db5c35';

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const shouldShowHomeButton = !store.isAuth || store.user.Role === 'client';

  return (
    <Container maxWidth="md" sx={{ py: 8, height: '80vh', textAlign: 'center'}}>
      <Fade in={showContent} timeout={500}>
        <div>
          <Typography 
            variant="h1" 
            component="div"
            sx={{ 
              color: orangeDark,
              fontWeight: 700,
              fontSize: '5rem',
              lineHeight: 1,
              mb: 2,
              mt: 3,
            }}
          >
            404
          </Typography>

          <Typography 
            variant="h4"
            sx={{ 
              color: '#2E2E2E',
              fontWeight: 600,
              mb: 3
            }}
          >
            Упс! Страница не найдена
          </Typography>

          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary',
              maxWidth: 500,
              mx: 'auto',
              mb: 4,
              fontSize: '1.1rem'
            }}
          >
            Возможно, она была перемещена или удалена. Проверьте адрес или вернитесь на главную.
          </Typography>

          {shouldShowHomeButton && (
            <Button
              variant="contained"
              size="large"
              startIcon={<HomeRoundedIcon />}
              onClick={() => navigate('/')}
              sx={{
                bgcolor: orangeMain,
                px: 5,
                py: 1.5,
                borderRadius: 2,
                fontSize: '1rem',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: orangeDark,
                  transform: 'translateY(-2px)',
                  boxShadow: 3
                },
                transition: 'all 0.3s ease',
                boxShadow: `0 4px 12px ${orangeMain}40`
              }}
            >
              На главную
            </Button>
          )}
        </div>
      </Fade>
    </Container>
  );
};

export default NotFound;