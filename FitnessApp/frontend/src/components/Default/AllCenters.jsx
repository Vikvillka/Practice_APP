import React, { useState } from 'react';
import { 
  Box, 
  Typography,
  CircularProgress,
  Alert,
  Divider,
  Button
} from '@mui/material';
import { centerAPI } from '../../services/CenterService';
import { NavLink } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationIcon from '@mui/icons-material/LocationOnTwoTone';
import '../styles/cardCenter.css';
import '../styles/scheduleDefault.css';

const AllCenters = () => {
    const { data: centersData, error, isLoading } = centerAPI.useFetchAllCentersQuery();
    const [selectedCity, setSelectedCity] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isArrowRotated, setIsArrowRotated] = useState(false);
    const [visibleCount, setVisibleCount] = useState(10); 

    const cities = [...new Set(centersData?.map(center => center.City) || [])];
    const filteredCenters = selectedCity
        ? centersData?.filter(center => center.City === selectedCity)
        : centersData;

    const visibleCenters = filteredCenters?.slice(0, visibleCount) || [];
    const canLoadMore = filteredCenters && filteredCenters.length > visibleCount; 

    const toggleDropdown = () => {
        setIsOpen(prev => !prev);
        setIsArrowRotated(prev => !prev);
    };

    const selectCity = (city) => {
        setSelectedCity(city);
        setIsOpen(false);
        setIsArrowRotated(false);
        setVisibleCount(10); 
    };

    const loadMore = () => {
        setVisibleCount(prev => prev + 10); 
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
                <CircularProgress size={60} sx={{ color: '#e37243' }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ width: '80%',height: '70vh', margin: 'auto', paddingTop: '30px' }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    Ошибка загрузки центров. {error.message}
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ 
            width: '80%', 
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
                    Список центров
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
                            {selectedCity || 'Выберите город'}
                            <span className={`arrow ${isArrowRotated ? 'focus' : ''}`}></span>
                        </div>
                        {isOpen && (
                            <ul className="custom-select-list">
                                <li 
                                    onClick={() => selectCity('')} 
                                    className="custom-select-item"
                                    style={{
                                        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
                                    }}
                                >
                                    Все города
                                </li>
                                {cities.map((city, index) => (
                                    <li 
                                        key={index} 
                                        onClick={() => selectCity(city)} 
                                        className="custom-select-item"
                                        style={{
                                            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
                                        }}
                                    >
                                        {city}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            <div className='cards-container'>
                {visibleCenters.length > 0 ? (
                    <div className="center-card-container">
                        {visibleCenters.map((center) => (
                            <NavLink 
                                to={`/centers/${center.CenterName}`} 
                                key={center.CenterId} 
                                className="center-card"
                                style={{ textDecoration: 'none' }}
                            >
                                <div className="card-content">
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                                            {center.CenterName}
                                        </Typography>
                                        
                                    </Box>
                                    <Divider sx={{ my: 1.5 }} />
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <LocationIcon sx={{ color: '#e37243', mr: 1 }} />
                                        <Typography variant="body2" color="text.secondary">
                                            {center.City}, {center.Address}
                                        </Typography>
                                    </Box>
                                    
                                    {center.Phone && (
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <PhoneIcon sx={{ color: '#e37243', mr: 1 }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {center.Phone}
                                            </Typography>
                                        </Box>
                                    )}
                                </div>
                            </NavLink>
                        ))}
                    </div>
                ) : (
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        height: '200px',
                        textAlign: 'center'
                    }}>
                        <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
                            Центры не найдены
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Попробуйте изменить параметры фильтрации
                        </Typography>
                    </Box>
                )}
            </div>

            {canLoadMore && (
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    marginTop: '30px',
                    marginBottom: '20px'
                }}>
                    <Button
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
                    </Button>
                </Box>
            )}

            {filteredCenters && filteredCenters.length > 0 && (
                <Typography 
                    variant="body2" 
                    color="textSecondary" 
                    sx={{ 
                        textAlign: 'center',
                        marginTop: '20px'
                    }}
                >
                    Показано {visibleCenters.length} из {filteredCenters.length} центров
                </Typography>
            )}
        </Box>
    );
}

export default AllCenters;