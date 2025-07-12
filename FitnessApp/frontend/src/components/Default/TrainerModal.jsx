import React from 'react';
import { 
  Box, 
  Typography, 
  Avatar,
  Chip
} from '@mui/material';
import { 
  Modal,
  ModalDialog 
} from '@mui/joy';
import { ModalClose } from '@mui/joy';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const TrainerModal = ({ open, handleClose, trainer }) => {
  const orangeColor = '#e37243';
  
  return (
    <Modal open={open} onClose={handleClose}>
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
          onClick={handleClose} 
          sx={{ color: '#2E2E2E', '&:hover': { color: orangeColor } }} 
        />
        
        {trainer && (
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
                  {trainer.Img ? (
                    <Box
                      component="img"
                      src={`https://localhost:7066/api/trainer/${trainer.TrainerId}/image`}
                      alt={`Trainer ${trainer.TrainerId}`}
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
                    <Typography variant="h6" fontWeight="bold" color="#2E2E2E">
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="#666">
                        {trainer.User.Email}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="#666">
                        {trainer.User.Phone || 'Телефон не указан'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <LocationOnIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="#666">
                        {trainer.Center?.CenterName || 'Центр не указан'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" color="#2E2E2E" sx={{ mb: 1 }}>
                <strong>Опыт работы:</strong> {trainer.ExperienceYears} {trainer.ExperienceYears < 1 ? 'лет' : trainer.ExperienceYears < 5 ? 'года' : 'лет'}
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" color="#2E2E2E" sx={{ mb: 1 }}>
                О тренере:
              </Typography>
              <Typography variant="body1" color="#666" sx={{ mb: 2 }}>
                {trainer.Description || 'Нет описания'}
              </Typography>
            </Box>
          </Box>
        )}
      </ModalDialog>
    </Modal>
  );
};

export default TrainerModal;