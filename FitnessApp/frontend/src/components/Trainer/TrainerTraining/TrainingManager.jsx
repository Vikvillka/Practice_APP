import React, { useState, useContext, useEffect } from 'react';
import { trainingAPI } from '../../../services/TrainingService';
import { orderAPI } from '../../../services/OrderService';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { 
    Box, Button, Typography, Alert, Avatar, List, ListItem, 
    ListItemAvatar, ListItemText, Chip, Card, CardContent, CircularProgress,
    useMediaQuery, useTheme
} from '@mui/material';
import { Modal, ModalDialog, ModalClose } from '@mui/joy';
import { Context } from '../../../index';
import PersonIcon from '@mui/icons-material/Person';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import weekday from 'dayjs/plugin/weekday';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import EmptyState from '../EmptyState';
import './style/TrainingManager.css';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(weekday);
dayjs.extend(weekOfYear);
dayjs.locale('ru');

const TrainingManager = () => {
    const { store } = useContext(Context);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const userId = store.user.UserID;
    const { data: trainings = [], error, isLoading, refetch } = trainingAPI.useFetchTrainingForTrainerByIDQuery(userId);
    const [cancellTraining] = trainingAPI.useCancellTrainingMutation(); 
    const [isError, setIsError] = useState(null);
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [openModal, setOpenModal] = useState(false);
    const [selectedTraining, setSelectedTraining] = useState(null);
    const [isLoadingAction, setIsLoadingAction] = useState(false);
    const [trainingParticipants, setTrainingParticipants] = useState([]);
    const { data: orders, refetch: refetchOrders } = orderAPI.useFetchOrderForTrainingByIDQuery(
        selectedTraining?.TrainingID, 
        { skip: !selectedTraining }
    );

    useEffect(() => {
        if (selectedTraining && orders) {
            const userOrdersMap = orders
                .filter(order => order.TrainingID === selectedTraining.TrainingID)
                .reduce((acc, order) => {
                    if (!acc[order.UserID]) {
                        acc[order.UserID] = [];
                    }
                    acc[order.UserID].push(order);
                    return acc;
                }, {});

            const participants = Object.values(userOrdersMap).map(userOrders => {
                const sortedOrders = [...userOrders].sort((a, b) => {
                    if (a.Status === 'active' && b.Status !== 'active') return -1;
                    if (a.Status !== 'active' && b.Status === 'active') return 1;
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });

                return {
                    ...userOrders[0].User,
                    orderStatus: sortedOrders[0].Status,
                    lastOrderDate: sortedOrders[0].createdAt
                };
            });

            setTrainingParticipants(participants);
        }
    }, [selectedTraining, orders]);

    const handleCancell = async (training) => {
        try {
            setIsLoadingAction(true);
            await cancellTraining(training.TrainingID).unwrap();
            refetch();
            refetchOrders();
            setOpenModal(false);
        } catch (error) {
            setIsError(error.data?.message || "Ошибка при отмене тренировки");
        } finally {
            setIsLoadingAction(false);
        }
    };

    const handlePrevWeek = () => {
        setCurrentDate(currentDate.subtract(1, 'week'));
    };

    const handleNextWeek = () => {
        setCurrentDate(currentDate.add(1, 'week'));
    };

    const handleOpenModal = (training) => {
        setSelectedTraining(training);
        setOpenModal(true);
    };

    const getWeekDays = () => {
        const startOfWeek = currentDate.startOf('week');
        return Array.from({ length: 7 }).map((_, i) => 
            startOfWeek.add(i, 'day')
        );
    };

    const groupTrainingsByDay = () => {
        const grouped = {};
        trainings.forEach(training => {
            const trainingDate = dayjs(training.DateTime);
            const dateStr = trainingDate.format('YYYY-MM-DD');
            
            if (!grouped[dateStr]) {
                grouped[dateStr] = [];
            }
            grouped[dateStr].push(training);
        });
        return grouped;
    };

    const trainingsByDay = groupTrainingsByDay();
    const weekDays = getWeekDays();

    if (isLoading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '70vh',
                width: '90%', 
                margin: 'auto', 
                paddingTop: '30px' 
            }}>
                <CircularProgress size={60} sx={{ color: '#e37243' }} />
            </Box>
        );
    }

    if (error) {
        return (
            <EmptyState 
                message="Ошибка загрузки тренировок"
                subMessage="Попробуйте обновить страницу"
                isError
            />
        );
    }

    return (
        <Box sx={{ width: '90%', mx: 'auto', p: 3 }}>
            <Typography variant="h4" color="#2E2E2E" sx={{ mb: 3 }}>
                Управление расписанием тренировок
            </Typography>
            
            {isError && (
                <Alert severity="error" sx={{ 
                    position: 'fixed',
                    bottom: 16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '80%',
                    maxWidth: 600,
                    zIndex: 9999,
                    boxShadow: 3,
                    mb: 2
                }}>
                    {isError}
                </Alert>
            )}

            {trainings.length === 0 ? (
                <EmptyState 
                    message="У вас пока нет запланированных тренировок"
                    actionText="Создать тренировку"
                    actionLink="/trainer/training/create"
                />
            ) : (
                <>
                    <Box sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap',
                        justifyContent: 'space-between', 
                        mb: 3,
                        alignItems: 'center'
                    }}>
                        <Button 
                            onClick={handlePrevWeek}
                            sx={{ 
                                color: '#e37243',
                                '&:hover': {
                                    backgroundColor: 'rgba(227, 114, 67, 0.1)'
                                }
                            }}
                            startIcon={<ArrowBackIcon />}
                        >
                            Предыдущая неделя
                        </Button>
                        <Typography variant="h6" color="#2E2E2E">
                            {currentDate.startOf('week').format('D MMMM')} - {currentDate.endOf('week').format('D MMMM YYYY')}
                        </Typography>
                        <Button 
                            onClick={handleNextWeek}
                            sx={{ 
                                color: '#e37243',
                                '&:hover': {
                                    backgroundColor: 'rgba(227, 114, 67, 0.1)'
                                }
                            }}
                            endIcon={<ArrowForwardIcon />}
                        >
                            Следующая неделя
                        </Button>
                    </Box>

                    <Box sx={{ 
                        width: '100%',
                        overflowX: isMobile ? 'auto' : 'visible',
                        pb: isMobile ? 2 : 0,
                        WebkitOverflowScrolling: 'touch',
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
                            display: 'grid', 
                            gridTemplateColumns: isMobile ? 'repeat(7, 280px)' : 'repeat(7, 1fr)', 
                            gap: 2,
                            width: isMobile ? '1960px' : '100%'
                        }}>
                            {weekDays.map(day => {
                                const dateStr = day.format('YYYY-MM-DD');
                                const dayTrainings = trainingsByDay[dateStr] || [];
                                
                                return (
                                    <Box key={dateStr} sx={{ 
                                        border: '1px solid #eee', 
                                        borderRadius: 1,
                                        backgroundColor: '#f5f5f5',
                                        minHeight: '300px',
                                        width: isMobile ? '280px' : '100%'
                                    }}>
                                        <Box sx={{ 
                                            bgcolor: day.isSame(dayjs(), 'day') ? '#e37243' : 'background.paper',
                                            color: day.isSame(dayjs(), 'day') ? 'white' : '#2E2E2E',
                                            p: 1, 
                                            textAlign: 'center',
                                            borderBottom: '1px solid #ddd'
                                        }}>
                                            <Typography variant="subtitle2">
                                                {day.format('dd')}
                                            </Typography>
                                            <Typography variant="body2">
                                                {day.format('D MMM')}
                                            </Typography>
                                        </Box>
                                        
                                        <Box sx={{ p: 1 }}>
                                            {dayTrainings.length > 0 ? (
                                                dayTrainings.map(training => (
                                                    <Card 
                                                        key={training.TrainingID} 
                                                        onClick={() => handleOpenModal(training)}
                                                        sx={{ 
                                                            mb: 2,
                                                            cursor: 'pointer',
                                                            bgcolor: training.Status === 'cancelled' ? '#ffebee' : 'white',
                                                            borderLeft: '3px solid',
                                                            borderLeftColor: training.Status === 'cancelled' ? '#f44336' : '#e37243',
                                                            opacity: training.Status === 'closed' || training.Status === 'cancelled' ? 0.6 : 1,
                                                            position: 'relative',
                                                            transition: 'opacity 0.3s ease',
                                                            '&:hover': {
                                                                boxShadow: 2
                                                            }
                                                        }}
                                                    >
                                                        {training.Status === 'closed' && (
                                                            <Chip
                                                                label="Проведена"
                                                                size="small"
                                                                sx={{
                                                                    position: 'absolute',
                                                                    top: 8,
                                                                    right: 8,
                                                                    backgroundColor: '#e8f5e9',
                                                                    color: '#2e7d32',
                                                                    height: 24,
                                                                    '& .MuiChip-label': {
                                                                        padding: '0 8px'
                                                                    },
                                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                                                }}
                                                            />
                                                        )}
                                                        <CardContent sx={{ p: 2 }}>
                                                            <Typography variant="subtitle2" color="#2E2E2E">
                                                                {dayjs(training.DateTime).format('HH:mm')}
                                                            </Typography>
                                                            <Typography variant="body2" color="#2E2E2E">
                                                                {training.Template.Title}
                                                            </Typography>
                                                            <Typography variant="caption" display="block" color="#666">
                                                                {training.Template.Duration} мин 
                                                            </Typography>
                                                            <Typography 
                                                                variant="caption" 
                                                                color={training.Status === 'cancelled' ? '#f44336' : '#2E2E2E'}
                                                            >
                                                                {training.Status === 'cancelled' ? 'Отменена' : 
                                                                training.Status === 'closed' ? 'Проведена' : 'Активна'}
                                                            </Typography>
                                                            <Typography variant="caption" display="block" color="#666">
                                                                Участников: {training.CurrentParticipants}/{training.Template.MaxParticipants}
                                                            </Typography>
                                                        </CardContent>
                                                    </Card>
                                                ))
                                            ) : (
                                                <Typography 
                                                    variant="caption" 
                                                    color="#666" 
                                                    sx={{ display: 'block', textAlign: 'center', pt: 2 }}
                                                >
                                                    Нет тренировок
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>
                </>
            )}

            <Modal 
                open={openModal} 
                onClose={() => setOpenModal(false)}
                disableAutoFocus
                disableEnforceFocus
            >
                <ModalDialog 
                    sx={{
                        maxHeight: '90vh',
                        width: isMobile ? '90vw' : '40vw',
                        overflowY: 'auto',
                        p: 0,
                        '&::-webkit-scrollbar': {
                            display: 'none'
                        },
                        scrollbarWidth: 'none'
                    }}
                >
                    <ModalClose 
                        onClick={() => setOpenModal(false)} 
                        sx={{ 
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            color: '#2E2E2E', 
                            '&:hover': { 
                                color: '#e37243' 
                            } 
                        }} 
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
                                <Typography variant="h6" color="#e37243">
                                    {dayjs(selectedTraining.DateTime).format('DD MMMM YYYY, HH:mm')}
                                </Typography>
                            </Box>

                            <Box sx={{ 
                                bgcolor: selectedTraining.Status === 'cancelled' ? '#ffebee' : 
                                        selectedTraining.Status === 'closed' ? '#e8f5e9' : '#f5f5f5',
                                p: 2, 
                                borderRadius: 1,
                                my: 2
                            }}>
                                <Typography variant="body1" color={
                                    selectedTraining.Status === 'cancelled' ? '#d32f2f' : 
                                    selectedTraining.Status === 'closed' ? '#2e7d32' : '#2E2E2E'
                                }>
                                    <strong>Статус:</strong> {
                                        selectedTraining.Status === 'cancelled' ? 'Отменена' : 
                                        selectedTraining.Status === 'closed' ? 'Проведена' : 'Активна'
                                    }
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" color="#2E2E2E" sx={{ mb: 1 }}>
                                    Описание тренировки:
                                </Typography>
                                <Typography variant="body1" color="#2E2E2E" sx={{ mb: 2 }}>
                                    {selectedTraining.Template.Description}
                                </Typography>
                            </Box>

                            {trainingParticipants.length > 0 && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="h6" color="#2E2E2E" sx={{ mb: 1 }}>
                                        Участники ({trainingParticipants.filter(p => p.orderStatus === 'active').length}/{selectedTraining.Template.MaxParticipants}):
                                    </Typography>
                                    <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                                        {trainingParticipants.map(user => (
                                            <ListItem key={user.UserID}>
                                                <ListItemAvatar>
                                                    <Avatar sx={{ bgcolor: '#e37243' }}>
                                                        <PersonIcon />
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Typography component="span">
                                                                {user.FirstName} {user.LastName}
                                                            </Typography>
                                                            {user.orderStatus === 'cancelled' && (
                                                                <Chip 
                                                                    label="Отменил запись"
                                                                    size="small"
                                                                    sx={{
                                                                        backgroundColor: '#ffebee',
                                                                        color: '#f44336',
                                                                        fontSize: '0.75rem',
                                                                        height: 20,
                                                                        '& .MuiChip-label': {
                                                                            paddingLeft: '6px',
                                                                            paddingRight: '6px'
                                                                        }
                                                                    }}
                                                                />
                                                            )}
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <>
                                                            <Box component="span" display="block" color="text.secondary">
                                                                {user.Email}
                                                            </Box>
                                                            <Box component="span" display="block" color="text.secondary">
                                                                {user.Phone}
                                                            </Box>
                                                        </>
                                                    }
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            )}

                            <Button
                                fullWidth
                                variant="contained"
                                sx={{
                                    backgroundColor: selectedTraining.Status === 'cancelled' ? '#ccc' : 
                                                   selectedTraining.Status === 'closed' ? '#81c784' : '#e37243',
                                    color: 'white',
                                    py: 1.5,
                                    '&:hover': { 
                                        backgroundColor: selectedTraining.Status === 'cancelled' ? '#ccc' : 
                                                       selectedTraining.Status === 'closed' ? '#81c784' : '#DF8A51' 
                                    }
                                }}
                                onClick={() => handleCancell(selectedTraining)}
                                disabled={selectedTraining.Status === 'cancelled' || 
                                          selectedTraining.Status === 'closed' || 
                                          isLoadingAction}
                            >
                                {isLoadingAction 
                                    ? <CircularProgress size={24} color="inherit" /> 
                                    : selectedTraining.Status === 'cancelled' 
                                        ? 'Тренировка отменена' 
                                        : selectedTraining.Status === 'closed'
                                            ? 'Тренировка проведена'
                                            : 'Отменить тренировку'}
                            </Button>
                        </Box>
                    )}
                </ModalDialog>
            </Modal>
        </Box>
    );
};

export default TrainingManager;