import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from "../index";
import { 
  Box, 
  Typography, 
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  CardMedia,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  FitnessCenter,
  School,
  DirectionsRun,
  LocationOn
} from '@mui/icons-material';
import { trainerAPI } from '../services/TrainerService';
import { centerAPI } from '../services/CenterService';
import Slider from 'react-slick';
import PersonIcon from '@mui/icons-material/Person';
import TrainerModal from '../components/Default/TrainerModal';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../components/styles/centerDetails.css';
import AllCentersMap from './AllCentersMap';

const HomePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { store } = useContext(Context);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { data: centers, error: centersError, isLoading: centersLoading } = centerAPI.useFetchAllCentersQuery();
  const { data: trainers, isLoading: trainersLoading, error: trainersError } = trainerAPI.useFetchAllTrainersQuery();
  const [visibleTrainers] = useState(8);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [trainerModalOpen, setTrainerModalOpen] = useState(false);

  const handleOpenTrainerModal = (trainer) => {
    setSelectedTrainer(trainer);
    setTrainerModalOpen(true);
  };

  const handleCloseTrainerModal = () => {
    setTrainerModalOpen(false);
    setSelectedTrainer(null);
  };
  
  const textColor = '#2E2E2E'; 

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
  };

  const benefits = [
    {
      title: 'Современное оборудование',
      description: 'Тренажеры последнего поколения от ведущих мировых производителей',
      icon: <FitnessCenter sx={{ fontSize: 120, color: '#e37243' }} />
    },
    {
      title: 'Профессиональные тренеры',
      description: 'Сертифицированные специалисты с многолетним опытом',
      icon: <School sx={{ fontSize: 120, color: '#e37243' }} />
    },
    {
      title: 'Разнообразие программ',
      description: 'Более 20 направлений тренировок для любого уровня подготовки',
      icon: <DirectionsRun sx={{ fontSize: 120, color: '#e37243' }} />
    },
    {
      title: 'Удобное расположение',
      description: 'Наши клубы расположены во многих городах Беларуси',
      icon: <LocationOn sx={{ fontSize: 120, color: '#e37243' }} />
    }
  ];

  const slides = [
    {
        title: 'Премиум фитнес',
        description: 'Наслаждайтесь высоким уровнем сервиса и комфорта в нашем фитнес-центре, где каждая деталь продумана для вашего удобства и отличного самочувствия.',
        image: process.env.PUBLIC_URL + '/img/slide1.jpg'
    },
    {
        title: 'Групповые программы',
        description: 'Присоединяйтесь к нашим групповым тренировкам и погрузитесь в мотивирующую атмосферу, где вы сможете развиваться вместе с единомышленниками и достигать новых высот.',
        image: process.env.PUBLIC_URL + '/img/slide2.jpg'
    },
    {
        title: 'Персональный подход',
        description: 'Получите индивидуально разработанные программы тренировок, адаптированные под ваши уникальные цели и потребности, чтобы максимально эффективно достигать результатов.',
        image: process.env.PUBLIC_URL + '/img/slide3.jpg'
    }
];

  if ( trainersLoading || centersLoading) {
    return (
      <Box sx={{ display: 'flex',height: '70vh', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress size={60} sx={{ color: '#e37243' }} />
      </Box>
    );
  }

  if ( trainersError || centersError) {
    return (
      <Box sx={{ width: '80%',height: '70vh', margin: 'auto', paddingTop: '30px' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Ошибка загрузки данных. {trainersError?.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', overflowX: 'hidden' }}>
      <Box sx={{ position: 'relative', mb: 6 }}>
        <Slider {...sliderSettings}>
          {slides.map((slide, index) => (
            <Box key={index} sx={{ position: 'relative' }}>
              <Box
                component="img"
                src={slide.image}
                alt={slide.title}
                sx={{ 
                  width: '100%', 
                  height: isMobile ? '50vh' : '70vh',
                  objectFit: 'cover'
                }}
              />
              <Box sx={{
                position: 'absolute',
                height:  '90%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: 'rgba(0, 0, 0, 0.57)',
                color: 'white',
                p: 4,
                justifyContent: 'center',
                textAlign: 'center'
              }}>
               <Typography 
                  variant="h4" 
                  sx={{ 
                    mb: 2,
                    color: '#E2E2E2',
                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
                  }}
                >
                  {slide.title}
                </Typography>
                
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 3,
                    width: '70%',
                    color: '#e2e2e2d7',
                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
                  }}
                >
                  {slide.description}
                </Typography>
                <Button 
                  variant="contained" 
                  size="large"
                  sx={{ 
                    bgcolor: '#e37243',
                    '&:hover': { bgcolor: '#db5c35' }
                  }}
                  onClick={() => navigate('/centers')}
                >
                  Выбрать клуб
                </Button>
              </Box>
            </Box>
          ))}
        </Slider>
      </Box>

      <Box sx={{ width: '80%', margin: '0 auto', mb: 8, textAlign: 'center' }}>
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 4,
          color: textColor,
          fontWeight: 600,
          fontFamily: 'inherit',
          textAlign: 'center'
        }}
      >
        О нашей сети
      </Typography>
        <Typography variant="body1" sx={{ mb: 4, fontSize: '1.2rem' }}>
          Мы - крупнейшая сеть фитнес-клубов в регионе, предлагающая премиальный сервис 
          и современные тренировочные программы для людей любого возраста и уровня подготовки.
        </Typography>
      </Box>

      <Box sx={{ bgcolor: '#f9f9f9', py: 6, mb: 8 }}>
        <Typography variant="h4" sx={{ textAlign: 'center',            color: textColor,
        fontWeight: 600,
          fontFamily: 'inherit', mb: 6 }}>
          Наши преимущества
        </Typography>
        <Grid container spacing={4} sx={{ width: '80%', margin: '0 auto' }}>
          {benefits.map((benefit, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ 
                height: '100%',
                p: 3,
                textAlign: 'center',
                boxShadow: 'none',
                bgcolor: 'transparent'
              }}>
                <Typography variant="h1" sx={{ mb: 2 }}>
                  {benefit.icon}
                </Typography>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  {benefit.title}
                </Typography>
                <Typography variant="body1">
                  {benefit.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ width: '80%', margin: '0 auto', mb: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, fontFamily: 'inherit' }}>
            Наши тренеры
          </Typography>
          <Button 
            variant="text"
            sx={{ color: '#e37243' }}
            onClick={() => navigate('/trainers')}
          >
            Смотреть всех
          </Button>
        </Box>

        <Box sx={{ 
          width: '100%',
          overflowX: 'auto',
          py: 2,
          '&::-webkit-scrollbar': {
            height: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#e37243',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f5f5f5',
          }
        }}>
          <Box sx={{ 
            display: 'inline-flex',
            gap: 3,
            minWidth: '100%',
            pb: 2
          }}>
            {trainers?.slice(0, visibleTrainers).map(trainer => (
              <Card 
                key={trainer.TrainerId}
                onClick={() => handleOpenTrainerModal(trainer)}
                sx={{ 
                  width: 250,
                  height: '100%',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  flexShrink: 0,
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                  }
                }}
              >
                {trainer.Img ? (
                  <CardMedia
                    component="img"
                    image={`https://localhost:7066/api/trainer/${trainer.TrainerId}/image`}
                    alt={`${trainer.User.FirstName} ${trainer.User.LastName}`}
                    sx={{ 
                      width: '100%', 
                      height: '40vh',
                      objectFit: 'cover',
                      borderTopLeftRadius: '8px',
                      borderTopRightRadius: '8px'
                    }}
                  />
                ) : (
                  <Box 
                    sx={{ 
                      width: '100%',
                      height: '40vh',
                      bgcolor: '#f5f5f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderTopLeftRadius: '8px',
                      borderTopRightRadius: '8px'
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 80, color: '#ddd' }} />
                  </Box>
                )}
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {trainer.User.FirstName} {trainer.User.LastName}
                  </Typography>
                  <Chip 
                    label={trainer.Specialization} 
                    size="small" 
                    sx={{ 
                      mb: 2,
                      backgroundColor: 'rgba(227, 114, 67, 0.1)',
                      color: '#e37243',
                      fontWeight: 500
                    }} 
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOn sx={{ color: '#e37243', fontSize: 16, mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {trainer.Center?.CenterName || 'Неизвестный центр'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      </Box>

      <TrainerModal 
        open={trainerModalOpen}
        handleClose={handleCloseTrainerModal}
        trainer={selectedTrainer}
      />

      <div className='test'>
        <div className="parallax">
          <div className="contact-section">
            <Box sx={{ py: 8, textAlign: 'center' , width: '100%', alignItems: 'center' }}>

              <Typography variant="h4" sx={{ 
                  mb: 3,
                  color: '#E2E2E2',
                  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' 
                }}>
                Готовы начать?
              </Typography>
              <Typography variant="h6" sx={{ 
                  mb: 4,
                  color: '#e2e2e2d7',
                  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' }}>
                Присоединяйтесь к тысячам довольных клиентов
              </Typography>
              {(!store.isAuth) && ( 
                <Button 
                variant="contained" 
                size="large"
                sx={{ 
                  bgcolor: '#e37243',
                  '&:hover': { bgcolor: '#db5c35' }
                }}
                onClick={() => navigate('/signup')}
              >
                Зарегистрироваться
              </Button>)}
              {(store.user.Role === 'client') && ( 
                <Button 
                variant="contained" 
                size="large"
                sx={{ 
                  bgcolor: '#e37243',
                  '&:hover': { bgcolor: '#db5c35' }
                }}
                onClick={() => navigate('/shedule')}
              >
                Расписание
              </Button>)}
            </Box>
            </div>
          </div>
          </div>
          <Box sx={{ width: '80%', margin: '0 auto', mb: 4 }}>
         
            <Typography variant="h4" sx={{ fontWeight: 600, fontFamily: 'inherit' }}>
              Наши центры
            </Typography>
          </Box>
           <AllCentersMap 
            centers={centers} 
            height="400px" 
            zoom={8} 
          />
    </Box>
  );
};

export default HomePage;