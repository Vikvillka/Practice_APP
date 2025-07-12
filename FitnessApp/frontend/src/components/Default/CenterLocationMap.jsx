import React, { useCallback, useRef, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import useYandexMaps from '../../services/UseYandexMaps';

const CenterLocationMap = ({ center, height = '400px' }) => {
  const [mapError, setMapError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef(null);
  const placemarkRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const initMap = useCallback(() => {
    if (!window.ymaps || !center?.Latitude || !center?.Longitude) return;

    try {
      setIsLoading(true);
      
      const coords = [center.Latitude, center.Longitude];
      
      const map = new window.ymaps.Map(mapRef.current, {
        center: coords,
        zoom: 15,
        controls: ['zoomControl']
      });

      mapInstanceRef.current = map;

      const placemark = new window.ymaps.Placemark(
        coords,
        { 
          hintContent: center.CenterName,
          balloonContent: `
            <strong>${center.CenterName}</strong><br>
            ${center.City}, ${center.Address}<br>
            Телефон: ${center.Phone}
          `
        },
        {
          preset: 'islands#orangeIcon'
        }
      );

      map.geoObjects.add(placemark);
      placemarkRef.current = placemark;
      
      setMapError(null);
    } catch (error) {
      console.error('Map init error:', error);
      setMapError('Ошибка загрузки карты');
    } finally {
      setIsLoading(false);
    }
  }, [center]);

  useYandexMaps('your-yandex-maps-api-key', initMap);

  if (!center?.Latitude || !center?.Longitude) {
    return (
      <Box sx={{ 
        height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 1
      }}>
        <Typography>Координаты центра не указаны</Typography>
      </Box>
    );
  }

  if (mapError) {
    return (
      <Box sx={{ 
        height, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        border: '2px solid rgb(162, 18, 18)',
        borderRadius: 1
      }}>
        <Typography color="error" sx={{ mb: 2 }}>{mapError}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', height, borderRadius: 1, overflow: 'hidden' }}>
      {isLoading && (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.1)',
          zIndex: 1
        }}>
          <CircularProgress color="secondary" />
        </Box>
      )}
      
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          visibility: isLoading ? 'hidden' : 'visible'
        }} 
      />
    </Box>
  );
};

export default CenterLocationMap;