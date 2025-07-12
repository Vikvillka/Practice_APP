import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress,
  Alert,
  Chip,
  Grid,
  Divider,
  Button as MuiButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { subscriptionAPI } from '../../services/SubscriptionService';
import { centerAPI } from '../../services/CenterService';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SubscriptionModal from '../../components/Default/SubscriptionModal'
import '../styles/scheduleDefault.css';

const AllSubscription = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    const { data: centers, error: centersError, isLoading: centersLoading } = centerAPI.useFetchAllCentersQuery();
    const { data: subscriptions, error: subscriptionError, isLoading: subscriptionLoading } = subscriptionAPI.useFetchAllSubscriptionsQuery();
    
    const [selectedCenter, setSelectedCenter] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isArrowRotated, setIsArrowRotated] = useState(false);
    const [visibleCount, setVisibleCount] = useState(10);
    
    const handleOpenModal = (subscription) => {
      setSelectedSubscription(subscription);
      setModalOpen(true);
    };

    const handleCloseModal = () => {
      setModalOpen(false);
      setSelectedSubscription(null);
    };

    const selectCenter = (centerID) => {
        setSelectedCenter(centerID);
        setIsOpen(false);
        setVisibleCount(10);
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
        setIsArrowRotated(!isArrowRotated);
    };

    const filteredSubscriptions = selectedCenter
        ? subscriptions?.filter(sub => sub.CenterID === selectedCenter)
        : subscriptions;

    const visibleSubscriptions = filteredSubscriptions?.slice(0, visibleCount) || [];
    const canLoadMore = filteredSubscriptions && filteredSubscriptions.length > visibleCount;

    const loadMore = () => {
        setVisibleCount(prev => prev + 10);
    };

    const selectedCenterName = centers?.find(center => center.CenterID === selectedCenter)?.CenterName;

    if (centersLoading || subscriptionLoading) {
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

    if (centersError || subscriptionError) {
        return (
            <Box sx={{ width: '80%', height: '70vh', margin: 'auto', paddingTop: '30px' }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    Ошибка загрузки абонементов. {centersError?.message || subscriptionError?.message}
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ 
            width: { xs: '95%', md: '80%' }, 
            margin: 'auto', 
            paddingTop: '20px',
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
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
                Абонементы
            </Typography>
            
                <div className='icon-select-container'>
                    <LocationOnIcon sx={{ 
                        color: '#e37243', 
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
                            {selectedCenterName || 'Выберите центр'}
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
                                {centers?.map((center) => (
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

            <Typography variant="h5" color="#2E2E2E" sx={{ mt: 3, mb: 2 }}>
                {selectedCenterName || 'Все абонементы'}
            </Typography>

            {filteredSubscriptions?.length === 0 ? (
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
                        Абонементы не найдены
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Попробуйте выбрать другой центр
                    </Typography>
                </Box>
            ) : (
                <>
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        {visibleSubscriptions.map(sub => {
                            const center = centers?.find(c => c.CenterID === sub.CenterID);
                            return (
                                <Grid item xs={12} sm={6} md={4} key={sub.SubscriptionID}>
                                    <Box
                                        onClick={() => handleOpenModal(sub)}
                                        sx={{
                                            height: '100%',
                                            borderRadius: 2,
                                            background: 'linear-gradient(135deg, #fff9f5 0%, #ffffff 50%)',
                                            border: '1px solid rgba(227, 114, 67, 0.2)',
                                            transition: 'all 0.3s ease',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                            '&:hover': {
                                                transform: 'translateY(-5px)',
                                                boxShadow: '0 10px 20px rgba(227, 114, 67, 0.1)',
                                                background: 'linear-gradient(135deg, #fff4ed 0%, #fff9f5 50%)',
                                                borderColor: 'rgba(227, 114, 67, 0.4)'
                                            }
                                        }}
                                    >
                                        <Box sx={{ p: 2 }}>
                                            <Typography 
                                                variant="h5" 
                                                fontWeight="bold" 
                                                sx={{ 
                                                    mb: 2,
                                                    background: 'linear-gradient(to right, #e37243, #ee8e4a)',
                                                    WebkitBackgroundClip: 'text',
                                                    WebkitTextFillColor: 'transparent',
                                                    fontSize: '1.3rem'
                                                }}
                                            >
                                                {sub.Title}
                                            </Typography>
                                            <Chip 
                                                label={center?.CenterName || 'Неизвестный центр'} 
                                                size="small" 
                                                sx={{ 
                                                    mb: 2,
                                                    backgroundColor: 'rgba(227, 114, 67, 0.1)',
                                                    color: '#e37243',
                                                    fontWeight: 500
                                                }} 
                                            />
                                            <Divider sx={{ my: 2, borderColor: 'rgba(227, 114, 67, 0.1)' }} />
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                                <Typography variant="body2" color="text.secondary">Срок действия:</Typography>
                                                <Typography fontWeight="600">{sub.Duration} дней</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary">Цена:</Typography>
                                                <Typography fontWeight="600" color="#e37243">
                                                    {sub.Price} руб.
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Grid>
                            );
                        })}
                    </Grid>

                    {canLoadMore && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                            <MuiButton
                                variant="outlined"
                                onClick={loadMore}
                                sx={{
                                    color: '#e37243',
                                    borderColor: '#e37243',
                                    '&:hover': {
                                        backgroundColor: 'rgba(227, 114, 67, 0.08)',
                                        borderColor: '#e37243'
                                    },
                                    padding: '10px 24px',
                                    fontSize: '1rem'
                                }}
                            >
                                Загрузить еще
                            </MuiButton>
                        </Box>
                    )}

                    {filteredSubscriptions && filteredSubscriptions.length > 0 && (
                        <Typography 
                            variant="body2" 
                            color="textSecondary" 
                            sx={{ textAlign: 'center', mb: 2 }}
                        >
                            Показано {visibleSubscriptions.length} из {filteredSubscriptions.length} абонементов
                        </Typography>
                    )}
                </>
            )}
                  <SubscriptionModal 
                    open={modalOpen} 
                    handleClose={handleCloseModal} 
                    subscription={selectedSubscription} 
                    centers = {centers}
                  /> 
        </Box>
    );
};

export default AllSubscription;