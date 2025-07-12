import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress,
  Alert,
  Chip,
  Grid,
  Button,
  Avatar,
  Modal,
  Card,
  CardMedia,
  CardContent,
  CardActionArea
} from '@mui/material';
import { trainerAPI } from '../../services/TrainerService';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import { ModalDialog } from '@mui/joy';
import { ModalClose } from '@mui/joy';
import '../styles/scheduleDefault.css';

const AllTrainers = () => {
    const orangeColor = '#e37243';
    const orangeHover = '#db5c35';
    
    const { data: trainers, error, isLoading } = trainerAPI.useFetchAllTrainersQuery();
    const [openModal, setOpenModal] = useState(false);
    const [selectedTrainer, setSelectedTrainer] = useState(null);
    const [selectedCenterID, setSelectedCenterID] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isArrowRotated, setIsArrowRotated] = useState(false);

    const handleOpenModal = (trainer) => {
        setSelectedTrainer(trainer);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedTrainer(null);
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
        setIsArrowRotated(!isArrowRotated);
    };

    const selectCenter = (centerID) => {
        setSelectedCenterID(centerID);
        setIsOpen(false);
    };

    if (isLoading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '70vh',
                width: '80%', 
                margin: 'auto', 
                paddingTop: '30px' 
            }}>
                <CircularProgress size={60} sx={{ color: orangeColor }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ width: '80%', height: '70vh', margin: 'auto', paddingTop: '30px' }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    Ошибка загрузки тренеров. {error.message}
                </Alert>
            </Box>
        );
    }

    // Группировка тренеров по центрам
    const groupedTrainers = trainers?.reduce((acc, trainer) => {
        const centerName = trainer.Center.CenterName;
        if (!acc[centerName]) {
            acc[centerName] = [];
        }
        acc[centerName].push(trainer);
        return acc;
    }, {});

    const centers = Object.keys(groupedTrainers || {}).map(centerName => ({
        CenterID: centerName,
        CenterName: centerName
    }));

    const filteredTrainers = selectedCenterID ? groupedTrainers[selectedCenterID] : trainers;

    return (
        <Box sx={{ 
            width: { xs: '90%', md: '80%' }, 
            margin: 'auto', 
            paddingTop: '20px',
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            paddingBottom: '40px'
        }}> 
            <div className='title-select-container'>
                <Typography 
                    variant="h4" 
                    sx={{ 
                        marginBottom: '20px',
                        color: '#2E2E2E',
                        fontFamily: 'inherit'
                    }}
                >
                    Наши тренеры
                </Typography>
                <div className='icon-select-container'>
                    <LocationOnIcon sx={{ 
                        color: orangeColor, 
                        marginRight: '10px', 
                        marginBottom: '10px' 
                    }}/>
                    <div className="custom-select-container">
                        <div 
                            className="custom-select-header" 
                            onClick={toggleDropdown}
                            style={{
                                fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                                color: '#2E2E2E'
                            }}
                        >
                            {selectedCenterID || 'Выберите центр'}
                            <span className={`arrow ${isArrowRotated ? 'focus' : ''}`}></span>
                        </div>
                        {isOpen && (
                            <ul className="custom-select-list">
                                <li 
                                    onClick={() => selectCenter(null)} 
                                    className="custom-select-item"
                                    style={{
                                        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
                                    }}
                                >
                                    Все центры
                                </li>
                                {centers.map((center) => (
                                    <li 
                                        key={center.CenterID} 
                                        onClick={() => selectCenter(center.CenterID)} 
                                        className="custom-select-item"
                                        style={{
                                            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
                                        }}
                                    >
                                        {center.CenterName}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {selectedCenterID ? (
              <>
                <Typography variant="h5" color="#2E2E2E" sx={{ mt: 3, mb: 2 }}>
                  {selectedCenterID}
                </Typography>
                        
                {filteredTrainers?.length === 0 ? (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '200px',
                    textAlign: 'center',
                    backgroundColor: 'background.paper',
                    borderRadius: 2,
                    p: 3
                  }}>
                    <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
                      Тренеры не найдены
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Попробуйте выбрать другой центр
                    </Typography>
                  </Box>
                ) : (
                  <Grid 
                    container 
                    spacing={1} 
                    sx={{ 
                      mb: 4,
                      justifyContent: 'flex-start'
                    }}
                  >
                    {filteredTrainers.map(trainer => (
                      <Grid 
                        item 
                        xs={9}
                        sm={4}  
                        md={3}   
                        lg={3} 
                        key={trainer.TrainerID}
                        sx={{
                          display: 'flex',
                          justifyContent: 'flex-start' 
                        }}
                      >
                        <Card 
                          sx={{ 
                            width: 250,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                            }
                          }}
                        >
                          <CardActionArea onClick={() => handleOpenModal(trainer)}>
                            {trainer.Img ? (
                              <CardMedia
                                component="img"
                                image={`https://localhost:7066/api/trainer/${trainer.TrainerId}/image`}
                                alt={`${trainer.User.FirstName} ${trainer.User.LastName}`}
                                sx={{ 
                                  width: '100%',
                                  height: '40vh',
                                  objectFit: 'cover',
                                  objectPosition: 'top center'
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
                                  justifyContent: 'center'
                                }}
                              >
                                <PersonIcon sx={{ fontSize: 80, color: '#ddd' }} />
                              </Box>
                            )}
                            <CardContent sx={{ p: 2 }}>
                              <Typography 
                                variant="h6" 
                                fontWeight="bold"
                                
                              >
                                {trainer.User.FirstName} {trainer.User.LastName}
                              </Typography>
                              <Chip 
                                label={trainer.Specialization} 
                                size="small" 
                                sx={{ 
                                  backgroundColor: 'rgba(227, 114, 67, 0.1)',
                                  color: orangeColor,
                                  fontWeight: 500
                                }} 
                              />
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <LocationOnIcon sx={{ color: orangeColor, fontSize: 16, mr: 0.5 }} />
                                <Typography variant="body2" color="text.secondary">
                                  {trainer.Center.CenterName}
                                </Typography>
                              </Box>
                            </CardContent>
                          </CardActionArea>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </>
            ) : (
              <>
                {Object.keys(groupedTrainers || {}).map(centerName => (
                  <Box key={centerName} sx={{ mb: 4 }}>
                    <Typography variant="h5" color="#2E2E2E" sx={{ mt: 3, mb: 2 }}>
                      {centerName}
                    </Typography>
                    <Grid 
                      container 
                      spacing={2} 
                      sx={{
                        justifyContent: 'flex-start' 
                      }}
                    >
                      {groupedTrainers[centerName].map(trainer => (
                        <Grid 
                          item 
                          xs={12} 
                          sm={6} 
                          md={4} 
                          lg={3} 
                          key={trainer.TrainerID}
                          sx={{
                            display: 'flex',
                            justifyContent: 'flex-start' 
                          }}
                        >
                          <Card 
                            sx={{ 
                              width: 250,
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              borderRadius: '8px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              transition: 'transform 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                              }
                            }}
                          >
                            <CardActionArea onClick={() => handleOpenModal(trainer)}>
                              {trainer.Img ? (
                                <CardMedia
                                  component="img"
                                  image={`https://localhost:7066/api/trainer/${trainer.TrainerId}/image`}
                                  alt={`${trainer.User.FirstName} ${trainer.User.LastName}`}
                                  sx={{ 
                                    width: '100%',
                                    height: '40vh',
                                    objectFit: 'cover',
                                    objectPosition: 'top center'
                                  }}
                                />
                              ) : (
                                <Box 
                                  sx={{ 
                                    width: '100%',
                                    height: 262,
                                    bgcolor: '#f5f5f5',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <PersonIcon sx={{ fontSize: 80, color: '#ddd' }} />
                                </Box>
                              )}
                              <CardContent sx={{ p: 2 }}>
                                <Typography 
                                  variant="h6" 
                                  fontWeight="bold"
                                  sx={{ 
                              
                                  }}
                                >
                                  {trainer.User.FirstName} {trainer.User.LastName}
                                </Typography>
                                <Chip 
                                  label={trainer.Specialization} 
                                  size="small" 
                                  sx={{ 
                                    backgroundColor: 'rgba(227, 114, 67, 0.1)',
                                    color: orangeColor,
                                    fontWeight: 500
                                  }} 
                                />
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                  <LocationOnIcon sx={{ color: orangeColor, fontSize: 16, mr: 0.5 }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {centerName}
                                  </Typography>
                                </Box>
                              </CardContent>
                            </CardActionArea>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                ))}
              </>
            )}

            <Modal open={openModal} onClose={handleCloseModal}>
                <ModalDialog 
                    sx={{
                        maxHeight: '90vh',
                        width: { xs: '90%', md: '40vw' },
                        overflowY: 'auto',
                        p: 0,
                        '&::-webkit-scrollbar': { display: 'none' },
                        scrollbarWidth: 'none',
                    }}
                >
                    <ModalClose 
                        onClick={handleCloseModal} 
                        sx={{ color: '#2E2E2E', '&:hover': { color: orangeColor } }} 
                    />
                    
                    {selectedTrainer && (
                        <Box sx={{ p: 4 }}>
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mt: 2,
                                mb: 2,
                                pb: 2,
                            }}>
                              <Box sx={{ mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'top', gap: 2}}>
                                    {selectedTrainer.Img ? (
                                        <CardMedia
                                            component="img"
                                            image={`https://localhost:7066/api/trainer/${selectedTrainer.TrainerId}/image`}
                                            alt={`Trainer ${selectedTrainer.TrainerID}`}
                                            sx={{
                                                width: 160,
                                                height: 190,
                                                borderRadius: '10px',
                                                objectFit: 'cover',
                                                objectPosition: 'top center',
                                                border: `2px solid ${orangeColor}`
                                            }}
                                        />
                                    ) : (
                                        <Avatar sx={{ 
                                            width: 80, 
                                            height: 80, 
                                            bgcolor: orangeColor,
                                            border: `2px solid ${orangeColor}`
                                        }}>
                                            <PersonIcon sx={{ fontSize: 40 }} />
                                        </Avatar>
                                    )}
                                    
                                    <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', pl: 1}}>
                                        <Typography variant="h6" fontWeight="bold" color="#2E2E2E" >
                                            {selectedTrainer.User.FirstName} {selectedTrainer.User.LastName}
                                        </Typography>
                                        <Chip 
                                            label={selectedTrainer.Specialization} 
                                            size="small" 
                                            sx={{ 
                                                backgroundColor: 'rgba(227, 114, 67, 0.1)',
                                                color: orangeColor,
                                                fontWeight: 500
                                            }} 
                                        />
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                            <EmailIcon fontSize="small" color="action" />
                                            <Typography variant="body2" color="#666">
                                                {selectedTrainer.User.Email}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                            <PhoneIcon fontSize="small" color="action" />
                                            <Typography variant="body2" color="#666">
                                                {selectedTrainer.User.Phone || 'Телефон не указан'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="body1" color="#2E2E2E" sx={{ mb: 1 }}>
                                  <strong>Опыт работы:</strong> {selectedTrainer.ExperienceYears} {selectedTrainer.ExperienceYears < 1 ? 'лет' : selectedTrainer.ExperienceYears < 5 ? 'года' : 'лет'}
                                </Typography>
                                <Typography variant="body1" color="#2E2E2E" sx={{ mb: 1 }}>
                                    <strong>Центр:</strong> {selectedTrainer.Center.CenterName}
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" color="#2E2E2E" sx={{ mb: 1 }}>
                                    О тренере:
                                </Typography>
                                <Typography variant="body1" color="#666" sx={{ mb: 2 }}>
                                    {selectedTrainer.Description || 'Нет описания'}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </ModalDialog>
            </Modal>
        </Box>
    );
};

export default AllTrainers;