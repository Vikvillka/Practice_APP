import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { centerAPI } from '../../services/CenterService';
import { useNavigate } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import '../styles/scheduleDefault.css';

const Schedule = () => {
    const { data } = centerAPI.useFetchAllCentersQuery();
    const [isOpen, setIsOpen] = useState(false);
    const [isArrowRotated, setIsArrowRotated] = useState(false);
    
    const navigate = useNavigate(); 
    const centers = data || [];

    const toggleDropdown = () => {
        setIsOpen(prev => !prev);
        setIsArrowRotated(prev => !prev);
    };

    const selectCenter = (centerName) => {
        navigate(`/centers/${centerName}/schedule`); 
    };

    return (
        <Box sx={{ 
            width: '80%',
            height: '70vh', 
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
                    Расписание
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
                            {'Выберите центр'}
                            <span className={`arrow ${isArrowRotated ? 'focus' : ''}`}></span>
                        </div>
                        {isOpen && (
                            <ul className="custom-select-list">
                                {centers.map((center) => (
                                    <li 
                                        key={center.CenterID} 
                                        onClick={() => selectCenter(center.CenterName)} 
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
            <div className='info-about-default-schedule'>
                <FitnessCenterIcon sx={{ 
                    color: '#e37243', 
                    marginBottom: '10px', 
                    fontSize: '90px' 
                }}/> 
                <Typography 
                    variant="h4" 
                    sx={{
                        color: '#2E2E2E',
                        fontFamily: 'inherit' 
                    }}
                >
                    Выберите центр
                </Typography>
                <p style={{
                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif', 
                    color: '#666' 
                }}>
                    Для просмотра актуального расписания
                </p>
            </div>
        </Box>
    );
}

export default Schedule;