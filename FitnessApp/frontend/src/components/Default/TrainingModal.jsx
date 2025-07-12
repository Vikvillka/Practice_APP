import React from 'react';
import { 
  Box, 
  Typography, 
  Modal, 
  ModalClose, 
  ModalDialog, 
  Alert, 
  Button,
  Avatar,
  CardMedia
} from '@mui/joy';
import { Person as PersonIcon, Email as EmailIcon } from '@mui/icons-material';

const orangeColor = '#e37243';
const orangeHover = '#DF8A51';

const TrainingModal = ({ 
  open, 
  onClose, 
  training, 
  isUserRegistered, 
  onRegister, 
  isLoading,
  currentUserRole
}) => {
  if (!training) return null;

  return (
    <Modal open={open} onClose={onClose}>
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
          onClick={onClose} 
          sx={{ color: '#2E2E2E', '&:hover': { color: orangeColor } }} 
        />
        
        <Box sx={{ p: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            pb: 2,
            borderBottom: '1px solid #eee'
          }}>
            <Typography variant="h5" color="#2E2E2E">
              {training.Template.Title}
            </Typography>
            <Typography variant="h6" color={orangeColor}>
              {dayjs(training.DateTime).format('dddd, DD MMMM HH:mm')}
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" color="#2E2E2E" sx={{ mb: 1 }}>
              <strong>Продолжительность:</strong> {training.Template.Duration} мин
            </Typography>
            <Typography variant="body1" color="#2E2E2E" sx={{ mb: 1 }}>
              <strong>Зал:</strong> {training.Room}
            </Typography>
            
            <Box sx={{ 
              bgcolor: '#f5f5f5', 
              p: 2, 
              borderRadius: 1,
              my: 2
            }}>
              <Typography variant="body1" color="#2E2E2E">
                <strong>Статус:</strong> {getTrainingStatusText(training)}
              </Typography>
              <Typography variant="body1" color="#2E2E2E" sx={{ mt: 1 }}>
                <strong>Свободных мест:</strong> {Math.max(
                  0, 
                  training.Template.MaxParticipants - training.CurrentParticipants
                )}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" color="#2E2E2E" sx={{ mb: 1 }}>
              Описание тренировки:
            </Typography>
            <Typography variant="body1" color="#666" sx={{ mb: 2 }}>
              {training.Template.Description}
            </Typography>
          </Box>

          <Box sx={{ 
            mb: 3,
            p: 2,
            bgcolor: '#f9f9f9',
            borderRadius: 1
          }}>
            <Typography variant="h6" color="#2E2E2E" sx={{ mb: 2 }}>
              Информация о тренере:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {training.Trainer.Img ? (
                <CardMedia
                  component="img"
                  image={`http://localhost:5000/static/${training.Trainer.Img}`}
                  alt={`Trainer ${training.Trainer.TrainingID}`}
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    objectFit: 'cover',
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
              
              <Box>
                <Typography variant="h6" color="#2E2E2E">
                  {training.Trainer.User.FirstName} {training.Trainer.User.LastName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <EmailIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="#666">
                    {training.Trainer.User.Email}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" color="#2E2E2E" sx={{ mb: 1 }}>
                <strong>Специализация:</strong> {training.Trainer.Specialization}
              </Typography>
              <Typography variant="body1" color="#2E2E2E" sx={{ mb: 1 }}>
                <strong>Опыт работы:</strong> {training.Trainer.ExperienceYears} лет
              </Typography>
              <Typography variant="body1" color="#2E2E2E">
                <strong>Описание:</strong> {training.Trainer.Description || 'Нет описания'}
              </Typography>
            </Box>
          </Box>

          {currentUserRole === 'client' ? (
            <Box>
              {isUserRegistered(training.TrainingID) ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Вы уже записаны на эту тренировку
                </Alert>
              ) : (
                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    backgroundColor: orangeColor,
                    color: 'white',
                    py: 1.5,
                    '&:hover': { backgroundColor: orangeHover }
                  }}
                  onClick={onRegister}
                  disabled={
                    isLoading || 
                    training.Status === 'closed' || 
                    training.Status === 'cancelled' ||
                    training.CurrentParticipants >= training.Template.MaxParticipants
                  }
                >
                  {isLoading ? 'Загрузка...' : 'Записаться'}
                </Button>
              )}
            </Box>
          ) : (
            <Typography variant="body2" sx={{ 
              color: '#666', 
              textAlign: 'center',
              fontStyle: 'italic'
            }}>
              Войдите в аккаунт или зарегистрируйтесь, чтобы записаться на тренировку
            </Typography>
          )}
        </Box>
      </ModalDialog>
    </Modal>
  );
};

function getTrainingStatusText(training) {
  if (training.Status === 'cancelled') return 'Отменена тренером';
  if (training.Status === 'closed') return 'Закрыта';
  if (training.CurrentParticipants >= training.Template.MaxParticipants) return 'Заполнена';
  return 'Открыта';
}

export default TrainingModal;