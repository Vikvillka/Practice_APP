import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
    Box, 
    Typography, 
    Card, 
    CardContent, 
    Button, 
    Alert, 
    Avatar, 
    Divider,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    TextField,
    IconButton,
    Tooltip,
    Snackbar
} from '@mui/material';
import { orderAPI } from '../services/OrderService';
import { userAPI } from '../services/UserService';
import { Context } from '../index';
import { observer } from 'mobx-react-lite';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Warning as WarningIcon
} from '@mui/icons-material';  
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import weekday from 'dayjs/plugin/weekday';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TelegramIcon from '@mui/icons-material/Telegram';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(weekday);
dayjs.extend(weekOfYear);
dayjs.locale('ru');

const orangeColor = '#e37243';

const Profile = observer(() => {
    const { store } = React.useContext(Context);
    const { data: orders = [], isLoading, refetch } = orderAPI.useFetchOrderForUserByIDQuery(store.user.UserId, {
        refetchOnMountOrArgChange: true, 
    });

    const { data: userData } = userAPI.useFetchUserByIDQuery(store.user.UserId);

    const [cancelOrder] = orderAPI.useCancelOrderMutation();
    //const [createOrder] = orderAPI.useCreateOrderMutation();
    const [currentDate, setCurrentDate] = React.useState(dayjs());
    const [error, setError] = React.useState(null);
    const [success, setSuccess] = React.useState(null);
    
    const { pathname } = useLocation();

    const [telegramDialogOpen, setTelegramDialogOpen] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    useEffect(() => {
        refetch();
    }, [store.user.UserID, refetch]);

    const handleGenerateTelegramCode = async () => {
        try {
            const response = await store.generateTelegramCode();
            setTelegramDialogOpen(true);
        } catch (err) {
            setError('Не удалось сгенерировать код для Telegram');
        }
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(store.telegramCode);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const handleCloseTelegramDialog = () => {
        setTelegramDialogOpen(false);
    };

    const userOrders = React.useMemo(() => {
        const ordersByTraining = orders.reduce((acc, order) => {
            if (order.UserID !== store.user.UserID || !order.Training || !order.Training.DateTime) {
                return acc;
            }
            
            if (!acc[order.TrainingID]) {
                acc[order.TrainingID] = [];
            }
            acc[order.TrainingID].push(order);
            return acc;
        }, {});

        const ordersToShow = [];
        Object.values(ordersByTraining).forEach(trainingOrders => {
            const activeOrder = trainingOrders.find(o => o.Status === 'active');
            
            if (activeOrder) {
                ordersToShow.push(activeOrder);
            } else {
                const sorted = [...trainingOrders].sort((a, b) => 
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                if (sorted.length > 0) {
                    ordersToShow.push(sorted[0]);
                }
            }
        });

        return ordersToShow.reduce((acc, order) => {
            const date = dayjs(order.Training.DateTime).format('YYYY-MM-DD');
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(order);
            return acc;
        }, {});
    }, [orders, store.user.UserID]);

    const handleCancelOrder = async (orderId) => {
        try {
            await cancelOrder(orderId).unwrap();
            setSuccess('Запись на тренировку успешно отменена');
            setError(null);
            refetch();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.data?.message || 'Не удалось отменить запись');
            setSuccess(null);
        }
    };

    // const handleReBookOrder = async (trainingId) => {
    //     try {
    //         await createOrder({
    //             TrainingID: trainingId,
    //             UserID: store.user.UserID
    //         }).unwrap();
    //         setSuccess('Вы успешно записаны на тренировку!');
    //         setError(null);
    //         refetch();
    //         setTimeout(() => setSuccess(null), 3000);
    //     } catch (err) {
    //         setError(err.data?.message || 'Не удалось записаться на тренировку');
    //         setSuccess(null);
    //     }
    // };

    const getWeekDays = () => {
        const startOfWeek = currentDate.startOf('week');
        return Array.from({ length: 7 }).map((_, i) => 
            startOfWeek.add(i, 'day')
        );
    };

    const handlePrevWeek = () => {
        setCurrentDate(currentDate.subtract(1, 'week'));
    };

    const handleNextWeek = () => {
        setCurrentDate(currentDate.add(1, 'week'));
    };

    const getTrainingStatusText = (training) => {
        if (training.Status === 'cancelled') return 'Отменена тренером';
        if (training.Status === 'closed') return 'Закрыта';
        return 'Активна';
    };

    const isTrainingDisabled = (training) => {
        return training.Status === 'closed' || 
               training.Status === 'cancelled' ||
               dayjs(training.DateTime).isBefore(dayjs(), 'day');
    };

    const isTrainingCancelled = (training) => {
        return training.Status === 'cancelled';
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

    const weekDays = getWeekDays();

    return (
        <Box sx={{ width: '80%', mx: 'auto', p: 3 }}>
            <Card sx={{ 
                mb: 4,
                p: 3,
                borderRadius: 2,
                boxShadow: 3,
                background: 'linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%)',
                borderLeft: '4px solid #e37243'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                    <Avatar 
                        sx={{ 
                            width: 80, 
                            height: 80,
                            bgcolor: '#e37243',
                            fontSize: 32,
                            fontWeight: 'bold'
                        }}
                    >
                        {userData?.FirstName?.[0]}{userData?.LastName?.[0]}
                    </Avatar>
                
                    <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Typography variant="h5" color="#2E2E2E" fontWeight="bold">
                                {userData?.FirstName} {userData?.LastName}
                            </Typography>
                        </Box>
                        
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ 
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: '1fr ' },
                            gap: 2
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <EmailIcon color="action" fontSize="small" />
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Email
                                    </Typography>
                                    <Typography variant="body1" color="#2E2E2E">
                                        {userData?.Email}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-start' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                        Хотите получать уведомления об отмененных тренировках на которые вы записались?
                        Привяжите свой Telegram аккаунт к нашему боту.
                    </Typography>          
                </Box>
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-start' }}>
                    <Button
                        variant="outlined"
                        startIcon={<TelegramIcon />}
                        onClick={handleGenerateTelegramCode}
                        sx={{
                            color: '#e37243',
                            borderColor: '#e37243',
                            '&:hover': {
                                backgroundColor: 'rgba(204, 95, 0, 0.1)',
                                borderColor: '#db5c35'
                            }
                        }}
                    >
                        {store.telegramCode ? 'Получить код повторно' : 'Привязать Telegram'}
                    </Button>
                </Box>
            </Card>

            <Dialog open={telegramDialogOpen} onClose={handleCloseTelegramDialog}>
                <DialogTitle>Привязка Telegram аккаунта</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        1. Перейдите в Telegram на нашего бота @YFitness_bot<br />
                        2. Отправьте ему команду /start<br />
                        3. Отправьте данный код {store.telegramCode}<br/>
                    </DialogContentText>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                            value={store.telegramCode || ''}
                            size="small"
                            fullWidth
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                        <Tooltip title="Копировать">
                            <IconButton onClick={handleCopyCode}>
                                <ContentCopyIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Button
                            variant="contained"
                            href={`https://t.me/YFitness_bot`}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<TelegramIcon />}
                            sx={{
                                backgroundColor: '#e37243',
                                '&:hover': {
                                    backgroundColor: '#db5c35'
                                }
                            }}
                        >
                            Перейти в Telegram
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseTelegramDialog}
                                sx={{
                                color: '#e37243',
                                '&:hover': {
                                    color: '#db5c35'
                                }
                            }}
                    >Закрыть</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={copySuccess}
                autoHideDuration={2000}
                message="Код скопирован в буфер обмена"
                onClose={() => setCopySuccess(false)}
            />
            <Typography variant="h4" color="#2E2E2E" sx={{ mb: 2 }}>
                Мои записи на тренировки
            </Typography>

            {error && <Alert severity="error" sx={{  position: 'fixed',bottom: 16,left: '50%',transform: 'translateX(-50%)',width: '80%',maxWidth: 600,zIndex: 9999,boxShadow: 3,mb: 2}}>{error}</Alert>}
            {success && <Alert severity="success" sx={{  position: 'fixed',bottom: 16,left: '50%',transform: 'translateX(-50%)',width: '80%',maxWidth: 600,zIndex: 9999,boxShadow: 3,mb: 2}}>{success}</Alert>}

            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                mb: 2,
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
                >
                    Следующая неделя
                </Button>
            </Box>

            {Object.keys(userOrders).length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    У вас нет активных записей на тренировки
                </Typography>
            ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
                    {weekDays.map(day => {
                        const dateStr = day.format('YYYY-MM-DD');
                        const dayOrders = userOrders[dateStr] || [];
                        
                        return (
                            <Box key={dateStr} sx={{ 
                                border: '1px solid #eee', 
                                borderRadius: 1,
                                backgroundColor: '#f5f5f5'
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
                                
                                <Box sx={{ p: 1, minHeight: 120 }}>
                                    {dayOrders.length > 0 ? (
                                        dayOrders.map(order => {
                                            const isDisabled = isTrainingDisabled(order.Training);
                                            const isCancelled = isTrainingCancelled(order.Training);
                                            const isUserCancelled = order.Status === 'cancelled';

                                            return (
                                                <Card 
                                                    key={order.OrderID} 
                                                    sx={{ 
                                                        mb: 1,
                                                        bgcolor: isCancelled ? '#ffebee' : 
                                                                isUserCancelled ? 'rgba(0, 0, 0, 0.04)' : 'white',
                                                        borderLeft: `3px solid ${
                                                            isCancelled ? '#f44336' : 
                                                            isUserCancelled ? '#9e9e9e' :
                                                            isDisabled ? '#9e9e9e' : 
                                                            '#e37243'
                                                        }`,
                                                        opacity: isDisabled || isUserCancelled ? 0.6 : 1
                                                    }}
                                                >
                                                    <CardContent sx={{ p: 1 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <Typography variant="subtitle2" color="#2E2E2E">
                                                                {dayjs(order.Training.DateTime).format('HH:mm')}
                                                            </Typography>
                                                            {isCancelled && (
                                                                <WarningIcon 
                                                                    sx={{ 
                                                                        color: '#f44336',
                                                                        fontSize: '1.2rem'
                                                                    }} 
                                                                />
                                                            )}
                                                        </Box>
                                                        <Typography variant="body2" color="#2E2E2E">
                                                            {order.Training.Template.Title}
                                                        </Typography>
                                                        <Typography variant="caption" display="block" color="#666">
                                                            {order.Training.Template.Duration} мин
                                                        </Typography>
                                                        <Typography 
                                                            variant="caption" 
                                                            color={
                                                                isCancelled ? '#f44336' : 
                                                                isUserCancelled ? '#9e9e9e' :
                                                                isDisabled ? '#9e9e9e' : 
                                                                '#4caf50'
                                                            }
                                                        >
                                                            {isUserCancelled ? 'Вы отменили запись' : 
                                                            isCancelled ? (
                                                                <>
                                                                    Тренер отменил эту тренировку. Приносим свои извинения.<br />
                                                                </>
                                                            ) : 
                                                            getTrainingStatusText(order.Training)}
                                                        </Typography>
                                                            
                                                        {order.Status === 'active' && !isCancelled && (
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                fullWidth
                                                                disabled={isDisabled}
                                                                sx={{ 
                                                                    mt: 1,
                                                                    color: isDisabled ? '#9e9e9e' : '#e37243',
                                                                    borderColor: isDisabled ? '#9e9e9e' : '#e37243',
                                                                    '&:hover': {
                                                                        borderColor: isDisabled ? '#9e9e9e' : '#DF8A51',
                                                                        backgroundColor: isDisabled ? 'transparent' : 'rgba(227, 114, 67, 0.1)'
                                                                    }
                                                                }}
                                                                onClick={() => handleCancelOrder(order.OrderID)}
                                                            >
                                                                Отменить запись
                                                            </Button>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            );
                                        })
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
            )}
        </Box>
    );
});

export default Profile;