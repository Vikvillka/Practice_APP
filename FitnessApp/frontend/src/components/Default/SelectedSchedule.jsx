import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Context } from '../../index';
import { useParams } from 'react-router-dom';
import { trainingAPI } from '../../services/TrainingService';
import { centerAPI } from '../../services/CenterService';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { 
  Button,
  CircularProgress, 
  Typography, 
  Box,
  Tooltip, 
  CardMedia, 
  Chip,
  Avatar,
  Card,
  CardContent,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Badge
} from '@mui/material';
import { Modal, ModalDialog, ModalClose } from '@mui/joy';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import { orderAPI } from '../../services/OrderService';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { 
    datePickerStyles
  } from '../styles/themeStyles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ClearIcon from '@mui/icons-material/Clear';
import '../../components/Trainer/TrainerTraining/style/TrainingManager.css';

dayjs.locale('ru');

const orangeColor = '#e37243';
const orangeHover = '#DF8A51';

  const SelectedSchedule = () => {
    const { centerName } = useParams();
    const [createOrder] = orderAPI.useCreateOrderMutation();
    const decodedCenterName = decodeURIComponent(centerName.replace(/-/g, ' '));
    const { data: centers, error: centersError, isLoading: centersLoading } = centerAPI.useFetchAllCentersQuery();
    const { data: trainings, error: trainingsError, isLoading: trainingsLoading, refetch } = trainingAPI.useFetchAllTrainingsQuery();
    const [openModal, setOpenModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(dayjs().startOf('week'));
    const [activeDay, setActiveDay] = useState(dayjs().format('YYYY-MM-DD'));
    const [selectedTraining, setSelectedTraining] = useState(null);
    const [localTrainings, setLocalTrainings] = useState([]);
    const { store } = useContext(Context);
    const [selectedTitle, setSelectedTitle] = useState('');
    const [isOpenTitleSelect, setIsOpenTitleSelect] = useState(false);
    const [isArrowRotated, setIsArrowRotated] = useState(false);
    const [userOrders, setUserOrders] = useState([]);
    const { data: orders, refetch: refetchOrders } = orderAPI.useFetchAllOrdersQuery({
            refetchOnMountOrArgChange: true, 
          });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [selectedDateFilter, setSelectedDateFilter] = useState(null); 
    const [showDayFilter, setShowDayFilter] = useState(false);

    useEffect(() => {
        if (trainings) {
            setLocalTrainings([...trainings]);
        }
    }, [trainings]);

    useEffect(() => {
        refetch();
    }, [store.user.UserId, refetch]);
    
    const toggleTitleDropdown = () => {
        setIsOpenTitleSelect(!isOpenTitleSelect);
        setIsArrowRotated(!isArrowRotated);
    };

    const selectTitle = (title) => {
        setSelectedTitle(title);
        setIsOpenTitleSelect(false);
        setIsArrowRotated(false);
    };

    const resetTitleFilter = () => {
        setSelectedTitle('');
    };

    const resetDayFilter = () => {
        setSelectedDateFilter(null);
    };

    const trainingTitles = useMemo(() => {
        if (!trainings) return [];
        const titlesSet = new Set(trainings.map(t => t.Template.Title));
        return Array.from(titlesSet);
    }, [trainings]);

    useEffect(() => {
        const fetch = async () => {
            if (localStorage.getItem('token')) {
                await store.checkAuth();
            }
        };
        fetch();
    }, []);

    useEffect(() => {
      if (orders && store.user.UserId) {
          const userOrders = orders.filter(order => 
              order.UserId === store.user.UserId && 
              order.Status === 'Active'
          );
          setUserOrders(userOrders);
      }
    }, [orders, store.user.UserId]);

    const isUserRegistered = (trainingId) => {
        return userOrders.some(order => order.TrainingId === trainingId);
    };

    useEffect(() => {
        setActiveDay(dayjs().format('YYYY-MM-DD'));
    }, []);

    useEffect(() => {
        if (selectedTraining) {
            refetch();
        }
    }, [selectedTraining]);

    const center = useMemo(() => centers?.find(c => c.CenterName === decodedCenterName), [centers, decodedCenterName]);

const filteredTrainings = useMemo(() => {
    if (!center || !trainings) return [];
    
    let filtered = trainings.filter(training =>
        training?.CenterId === center.CenterId &&
        (selectedTitle === '' || training.Template.Title === selectedTitle)
    );

    if (selectedDateFilter) {
        return filtered.filter(training => 
            dayjs(training.DateTime).isSame(selectedDateFilter, 'day')
        );
    }
     
    return filtered.filter(training =>
        dayjs(training.DateTime).isSame(selectedDate, 'week')
    );
}, [center, trainings, selectedDate, selectedTitle, selectedDateFilter]);

const trainingsByDayAndTime = useMemo(() => {
    const schedule = {};
    
    if (selectedDateFilter) {
       
        const dayKey = selectedDateFilter.format('YYYY-MM-DD');
        schedule[dayKey] = {};
        
        filteredTrainings.forEach(training => {
            const time = dayjs(training.DateTime).format('HH:00');
            if (!schedule[dayKey][time]) schedule[dayKey][time] = [];
            schedule[dayKey][time].push(training);
        });
    } else {
        
        const days = Array.from({ length: 7 }, (_, i) => 
            selectedDate.add(i, 'day').format('YYYY-MM-DD'));
        
        days.forEach(day => {
            schedule[day] = {};
        });

        filteredTrainings.forEach(training => {
            const day = dayjs(training.DateTime).format('YYYY-MM-DD');
            const time = dayjs(training.DateTime).format('HH:00');
            
            if (!schedule[day]) schedule[day] = {};
            if (!schedule[day][time]) schedule[day][time] = [];
            
            schedule[day][time].push(training);
        });
    }
    
    return schedule;
}, [filteredTrainings, selectedDate, selectedDateFilter]);

const daysOfWeek = useMemo(() => {
    if (selectedDateFilter) {
        return [selectedDateFilter];
    }

    return Array.from({ length: 7 }, (_, i) => selectedDate.add(i, 'day'));
}, [selectedDate, selectedDateFilter]);    

const timeSlots = useMemo(() => {
    const allTimes = new Set();
    Object.values(trainingsByDayAndTime).forEach(day => {
        Object.keys(day).forEach(time => allTimes.add(time));
    });
    return Array.from(allTimes).sort((a, b) => a.localeCompare(b));
}, [trainingsByDayAndTime]);

    const today = dayjs();

    const hasTrainings = useMemo(() => {
        if (selectedDateFilter) {
            return filteredTrainings.some(training => 
                dayjs(training.DateTime).isSame(selectedDateFilter, 'day')
            );
        }
        return filteredTrainings.length > 0;
    }, [filteredTrainings, selectedDateFilter]);

    const dayHasTrainings = (day) => {
        const dayKey = day.format('YYYY-MM-DD');
        return Object.values(trainingsByDayAndTime[dayKey] || {}).some(timeSlot => timeSlot.length > 0);
    };

    if (centersError || trainingsError) {
        return (
            <Box sx={{ width: '80%', margin: 'auto', paddingTop: '30px' }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    Ошибка загрузки данных. {centersError?.message || trainingsError?.message}
                </Alert>
            </Box>
        );
    }

    if (!center) return <div style={{ color: 'gray' }}>Центр с названием "{decodedCenterName}" не найден.</div>;

    const handleOpenModal = (training) => {
      if (training.Status === 'Closed' || 
          training.Status === 'Cancelled' ||
          dayjs(training.DateTime).isBefore(dayjs(), 'day')) {
        return;
      }
      setSelectedTraining(training);
      setOpenModal(true);
    };

    const handleRegister = async () => {
      if (!selectedTraining) {
        setError('Тренировка не выбрана');
        setTimeout(() => setError(null), 3000);
        return;
      }

      if (isUserRegistered(selectedTraining.TrainingId)) {
          setError('Вы уже записаны на эту тренировку');
          setTimeout(() => setError(null), 3000);
          return;
      }

      if (selectedTraining.Status === 'Closed' || 
          selectedTraining.Status === 'Cancelled' ||
          selectedTraining.CurrentParticipants >= selectedTraining.Template.MaxParticipants) {
          setError('Тренировка закрыта для записи');
          setTimeout(() => setError(null), 3000);
          return;
      }

      const orderData = {
          TrainingID: selectedTraining.TrainingId,
          UserID: store.user.UserId,
      };

      try {
          setIsLoading(true);
          await createOrder(orderData).unwrap();
          
          setLocalTrainings(prevTrainings => {
              return prevTrainings.map(training => {
                  if (training.TrainingId === selectedTraining.TrainingId) {
                      return {
                          ...training,
                          CurrentParticipants: training.CurrentParticipants + 1
                      };
                  }
                  return training;
              });
          });

          setSelectedTraining(prev => ({
              ...prev,
              CurrentParticipants: prev.CurrentParticipants + 1
          }));

          await refetchOrders();
          
          setSuccess('Вы успешно записались на тренировку!');
          setTimeout(() => setSuccess(null), 3000);
      } catch (error) {
          setError(error.data?.message || 'Ошибка при записи на тренировку');
          setTimeout(() => setError(null), 3000);
      } finally {
          setIsLoading(false);
          setOpenModal(false);
      }
    };

    const isTrainingDisabled = (training) => {
      return training.Status === 'Closed' || 
             training.Status === 'Cancelled' ||
             dayjs(training.DateTime).isBefore(dayjs(), 'day');
    };

    const renderTrainingCard = (training) => {
        const isRegistered = isUserRegistered(training.TrainingId);
        
        return (
            <Card
                key={training.TrainingId}
                onClick={() => !isTrainingDisabled(training) && handleOpenModal(training)}
                sx={{ 
                    mb: 1,
                    cursor: isTrainingDisabled(training) ? 'default' : 'pointer',
                    opacity: isTrainingDisabled(training) ? 0.7 : 1,
                    borderLeft: `3px solid ${orangeColor}`,
                    minHeight: '80px',
                    paddingLeft: '5px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    position: 'relative',
                    '&:hover': {
                        boxShadow: isTrainingDisabled(training) ? 'none' : '0px 4px 8px rgba(68, 68, 68, 0.25)'
                    }
                }}
            >
                {isRegistered && (
                    <Tooltip title="Вы уже записаны на эту тренировку" arrow>
                        <CheckCircleIcon 
                            sx={{ 
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                color: '#4caf50',
                                fontSize: '1.2rem'
                            }} 
                        />
                    </Tooltip>
                )}
                
                <CardContent sx={{ p: 1 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', mt: 0.5 }}>
                        <Typography variant="subtitle2" color={isTrainingDisabled(training) ? '#666' : '#2E2E2E'}>
                          {training.Template.Title}
                        </Typography>
                        <Typography variant="caption" color="#666">
                          {dayjs(training.DateTime).format('D MMM, HH:mm')}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
                        <Chip
                          label={
                            training.Status === 'Cancelled' ? 'Отменена' :
                            training.Status === 'Closed' ? 'Закрыта' :
                            training.CurrentParticipants >= training.Template.MaxParticipants ? 'Заполнена' : 'Доступна'
                          }
                          size="small"
                          sx={{
                            backgroundColor: 
                              training.Status === 'Cancelled' ? '#ffebee' :
                              training.Status === 'Closed' ? '#d8d9d7' :
                              training.CurrentParticipants >= training.Template.MaxParticipants ? '#fff3e0' : '#e8f5e9',
                            color: 
                              training.Status === 'Cancelled' ? '#c62828' :
                              training.Status === 'Closed' ? '#3a3a3a' :
                              training.CurrentParticipants >= training.Template.MaxParticipants ? '#e65100' : '#2e7d32'
                          }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccessTimeIcon fontSize="small" sx={{ color: '#666' }} />
                          <Typography variant="caption" color="#666">
                            {training.Template.Duration} мин
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PeopleIcon fontSize="small" sx={{ color: '#666' }} />
                          <Typography variant="caption" color="#666">
                            {training.CurrentParticipants}/{training.Template.MaxParticipants}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
            </Card>
        );
    };
    
    if (centersLoading || trainingsLoading) {
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
                <CircularProgress size={60} sx={{ color: '#e37243' }} />
            </Box>
        );
    }

    return (
        <Box sx={{ width: '90%', mx: 'auto', p: 3 }}>
            <Typography variant="h4" color="#2E2E2E" sx={{ mb: 3 }}>
                Расписание центра "{center.CenterName}"
            </Typography>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  position: 'fixed',bottom: 16,left: '50%',transform: 'translateX(-50%)',width: '80%',maxWidth: 600,zIndex: 9999,boxShadow: 3,mb: 2}}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert 
                severity="success" 
                sx={{ 
                  position: 'fixed',bottom: 16,left: '50%',transform: 'translateX(-50%)',width: '80%',maxWidth: 600,zIndex: 9999,boxShadow: 3,mb: 2}}>
                {success}
              </Alert>
            )}

            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 3,
                flexWrap: 'wrap',
                gap: 2
            }}>
                <Button 
                    onClick={() => setSelectedDate(prev => prev.subtract(1, 'week'))}
                    disabled={selectedDate.isBefore(today.startOf('week'))}
                    sx={{ 
                        color: orangeColor,
                        '&:hover': {
                            backgroundColor: 'rgba(227, 114, 67, 0.1)'
                        }
                    }}
                >
                    <ArrowBackIcon sx={{ mr: 1 }} />
                    Предыдущая неделя
                </Button>

                <Typography variant="h6" color="#2E2E2E">
                    {selectedDate.startOf('week').format('D MMMM')} - {selectedDate.endOf('week').format('D MMMM YYYY')}
                </Typography>

                <Button 
                    onClick={() => setSelectedDate(prev => prev.add(1, 'week'))}
                    sx={{ 
                        color: orangeColor,
                        '&:hover': {
                            backgroundColor: 'rgba(227, 114, 67, 0.1)'
                        }
                    }}
                >
                    Следующая неделя
                    <ArrowForwardIcon sx={{ ml: 1 }} />
                </Button>
            </Box>

            <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                mb: 3,
                justifyContent: 'space-between', 
                alignItems: 'center',
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>

                <Box sx={{ 
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    flexWrap: 'wrap'
                }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Выбрать дату"
                            value={selectedDateFilter}
                            onChange={setSelectedDateFilter}
                            slotProps={{
                                textField: {
                                  variant: "outlined",
                                  size: "small",
                                  sx: datePickerStyles
                                },
                                actionBar: {
                                  actions: ['clear', 'accept'],
                                  sx: {
                                    '& .MuiButton-root': {
                                      color: orangeColor,
                                      '&:hover': {
                                        backgroundColor: 'rgba(227, 114, 67, 0.1)'
                                      }
                                    }
                                  }
                                }
                            }}
                        />
                    </LocalizationProvider>
                        
                    {selectedDateFilter && (
                        <>
                            <Button
                                variant="outlined"
                                startIcon={<ClearIcon />}
                                onClick={() => setSelectedDateFilter(null)}
                                sx={{
                                    color: orangeColor,
                                    borderColor: orangeColor,
                                    '&:hover': {
                                        backgroundColor: 'rgba(227, 114, 67, 0.1)',
                                        borderColor: orangeHover
                                    }
                                }}
                            >
                                Сбросить
                            </Button>
                        </>
                    )}
                </Box>

                <Box sx={{ position: 'relative' }}>
                    <Button
                        variant="outlined"
                        startIcon={<FilterAltIcon />}
                        endIcon={
                            selectedTitle && (
                                <IconButton 
                                    size="small" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        resetTitleFilter();
                                    }}
                                    sx={{ 
                                        ml: 1,
                                        color: orangeColor
                                    }}
                                >
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            )
                        }
                        onClick={toggleTitleDropdown}
                        sx={{
                            borderColor: selectedTitle ? orangeColor : '#ddd',
                            color: selectedTitle ? orangeColor : '#666',
                            '&:hover': {
                                borderColor: orangeColor,
                                backgroundColor: 'rgba(227, 114, 67, 0.1)'
                            }
                        }}
                    >
                        {selectedTitle || 'Все направления'}
                    </Button>
                    
                    {isOpenTitleSelect && (
                        <Box sx={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            zIndex: 10,
                            bgcolor: 'background.paper',
                            boxShadow: 3,
                            borderRadius: 1,
                            p: 1,
                            mt: 1,
                            minWidth: '200px',
                            maxHeight: '300px',
                            overflowY: 'auto'
                        }}>
                            <Button
                                fullWidth
                                onClick={() => {
                                    resetTitleFilter();
                                    setIsOpenTitleSelect(false);
                                }}
                                sx={{
                                    justifyContent: 'flex-start',
                                    color: !selectedTitle ? orangeColor : '#666',
                                    backgroundColor: !selectedTitle ? 'rgba(227, 114, 67, 0.1)' : 'transparent',
                                    '&:hover': {
                                        backgroundColor: 'rgba(227, 114, 67, 0.1)'
                                    }
                                }}
                            >
                                Все направления
                            </Button>
                            
                            {trainingTitles.map((title) => (
                                <Button
                                    key={title}
                                    fullWidth
                                    onClick={() => {
                                        selectTitle(title);
                                        setIsOpenTitleSelect(false);
                                    }}
                                    sx={{
                                        justifyContent: 'flex-start',
                                        color: title === selectedTitle ? orangeColor : '#666',
                                        backgroundColor: title === selectedTitle ? 'rgba(227, 114, 67, 0.1)' : 'transparent',
                                        '&:hover': {
                                            backgroundColor: 'rgba(227, 114, 67, 0.1)'
                                        },
                                        textAlign: 'left',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {title}
                                </Button>
                            ))}
                        </Box>
                    )}
                </Box>
            </Box>

            <TableContainer component={Paper} sx={{ mb: 4, borderRadius: 2 }}>
                <Table sx={{ minWidth: 650 }} aria-label="schedule table">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ 
                                width: '100px', 
                                backgroundColor: '#f5f5f5',
                                borderRight: '1px solid #eee'
                            }}>
                                <Typography variant="subtitle2" color="#2E2E2E">
                                    Время
                                </Typography>
                            </TableCell>
                            {daysOfWeek.map(day => {
                                const isToday = day.isSame(dayjs(), 'day');
                                const dayName = day.format('dd');
                                const dayKey = day.format('YYYY-MM-DD');
                                const hasTrainings = Object.keys(trainingsByDayAndTime[dayKey] || {}).length > 0;
                                
                                return (
                                    <TableCell 
                                        key={dayKey} 
                                        sx={{ 
                                            minWidth: '150px',
                                            backgroundColor: isToday ? '#fffaf7' : '#f5f5f5',
                                            textAlign: 'center',
                                            position: 'relative'
                                        }}
                                    >
                                        <Box sx={{ 
                                            display: 'flex', 
                                            flexDirection: 'column',
                                            alignItems: 'center'
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <Typography variant="subtitle2" color={isToday ? orangeColor : '#2E2E2E'}>
                                                    {dayName}
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" color={isToday ? orangeColor : '#666'}>
                                                {day.format('D MMM')}
                                            </Typography>
                                        </Box>
                                        {hasTrainings && (
                                            <Box sx={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                backgroundColor: orangeColor
                                            }} />
                                        )}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {timeSlots.map(time => (
                            <TableRow key={time}>
                                <TableCell sx={{ 
                                    backgroundColor: '#f5f5f5',
                                    borderRight: '1px solid #eee'
                                }}>
                                    <Typography variant="subtitle2" color="#2E2E2E">
                                        {time}
                                    </Typography>
                                </TableCell>
                                {daysOfWeek.map(day => {
                                    const dayKey = day.format('YYYY-MM-DD');
                                    const dayTrainings = trainingsByDayAndTime[dayKey]?.[time] || [];
                                    const isToday = day.isSame(dayjs(), 'day');
                                    
                                    return (
                                        <TableCell 
                                            key={dayKey} 
                                            sx={{ 
                                                p: 1,
                                                backgroundColor: isToday ? '#fffaf7' : 'white',
                                                borderRight: '1px solid #eee'
                                            }}
                                        >
                                             {dayTrainings.map(training => renderTrainingCard(training))}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {!hasTrainings && (
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '200px',
                    border: '1px dashed #ddd',
                    borderRadius: 2,
                    backgroundColor: '#fafafa',
                    mb: 4
                }}>
                    <Typography variant="h6" color="text.secondary">
                        Тренировок нет
                    </Typography>
                </Box>
            )}
            <Modal open={openModal} onClose={() => setOpenModal(false)}>
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
                        onClick={() => setOpenModal(false)} 
                        sx={{ color: '#2E2E2E', '&:hover': { color: orangeColor } }} 
                    />
                    
                    {selectedTraining && (
                        <Box sx={{ p: 4 }}>
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 2,
                                mt: 2,
                                pb: 2,
                                borderBottom: '1px solid #eee'
                            }}>
                                <Typography variant="h5" color="#2E2E2E">
                                    {selectedTraining.Template.Title}
                                </Typography>
                                <Typography variant="h5" color={orangeColor}>
                                    {dayjs(selectedTraining.DateTime).format('dddd, DD MMMM HH:mm')}
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="body1" color="#2E2E2E" sx={{ mb: 1 }}>
                                    <strong>Продолжительность:</strong> {selectedTraining.Template.Duration} мин
                                </Typography>
                                
                                <Box sx={{ 
                                    bgcolor: '#f5f5f5', 
                                    p: 2, 
                                    borderRadius: 1,
                                    my: 2
                                }}>
                                    <Typography variant="body1" color="#2E2E2E">
                                        <strong>Статус:</strong> {selectedTraining.Status === 'Closed' || 
                                        (Number(selectedTraining.Template.MaxParticipants)) - 
                                        (Number(selectedTraining.CurrentParticipants)) === 0 ? 'Закрыта' : 'Открыта'}
                                    </Typography>
                                    <Typography variant="body1" color="#2E2E2E" sx={{ mt: 1 }}>
                                        <strong>Свободных мест:</strong> {Math.max(
                                            0, 
                                            selectedTraining.Template.MaxParticipants - selectedTraining.CurrentParticipants
                                        )}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" color="#2E2E2E" sx={{ mb: 1 }}>
                                    Описание тренировки:
                                </Typography>
                                <Typography variant="body1" color="#666" sx={{ mb: 2 }}>
                                    {selectedTraining.Template.Description}
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
                                    {selectedTraining.Trainer.Img ? (
                                        <CardMedia
                                            component="img"
                                            image={`https://localhost:7066/api/trainer/${selectedTraining.TrainerId}/image`}
                                            alt={`Trainer ${selectedTraining.Trainer.TrainingID}`}
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
                                            {selectedTraining.Trainer.FirstName} {selectedTraining.Trainer.LastName}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                            <EmailIcon fontSize="small" color="action" />
                                            <Typography variant="body2" color="#666">
                                                {selectedTraining.Trainer.Email}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body1" color="#2E2E2E" sx={{ mb: 1 }}>
                                        <strong>Специализация:</strong> {selectedTraining.Trainer.Specialization}
                                    </Typography>
                                    <Typography variant="body1" color="#2E2E2E" sx={{ mb: 1 }}>
                                        <strong>Опыт работы:</strong> {selectedTraining.Trainer.ExperienceYears} лет
                                    </Typography>
                                    <Typography variant="body1" color="#2E2E2E">
                                        <strong>Описание:</strong> {selectedTraining.Trainer.Description || 'Нет описания'}
                                    </Typography>
                                </Box>
                            </Box>

                            {store.user.Role === 1 ? (
                                <Box>
                                    {isUserRegistered(selectedTraining.TrainingId) ? (
                                        <Alert  sx={{ mb: 2, backgroundColor: '#fff3e0', color: '#e65100'}}>
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
                                            onClick={handleRegister}
                                            disabled={
                                                isLoading || 
                                                selectedTraining.Status === 'Closed' || 
                                                selectedTraining.Status === 'Cancelled' ||
                                                selectedTraining.CurrentParticipants >= selectedTraining.Template.MaxParticipants
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
                    )}
                </ModalDialog>
            </Modal>
        </Box>
    );
};

export default SelectedSchedule;