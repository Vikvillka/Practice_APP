import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import useYandexMaps from '../services/UseYandexMaps';

const AllCentersMap = ({ centers, height = '500px', zoom = 11 }) => {
  const [mapError, setMapError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const placemarksRef = useRef([]);

  const validCenters = centers?.filter(center => 
    center?.Latitude && center?.Longitude &&
    !isNaN(parseFloat(center.Latitude)) && 
    !isNaN(parseFloat(center.Longitude))
  );

  const initMap = useCallback(() => {
    if (!window.ymaps || !validCenters?.length) return;

    try {
      setIsLoading(true);
      
      const avgLat = validCenters.reduce((sum, c) => sum + parseFloat(c.Latitude), 0) / validCenters.length;
      const avgLon = validCenters.reduce((sum, c) => sum + parseFloat(c.Longitude), 0) / validCenters.length;

      const map = new window.ymaps.Map(mapRef.current, {
        center: [avgLat, avgLon],
        zoom: zoom,
        controls: ['zoomControl', 'typeSelector', 'fullscreenControl']
      });

      mapInstanceRef.current = map;

      placemarksRef.current.forEach(pm => map.geoObjects.remove(pm));
      placemarksRef.current = [];

      validCenters.forEach(center => {
        const coords = [parseFloat(center.Latitude), parseFloat(center.Longitude)];
        
        const placemark = new window.ymaps.Placemark(
          coords,
          { 
            hintContent: center.CenterName,
            balloonContent: `
              <strong>${center.CenterName}</strong><br>
              ${center.Address}<br>
              ${center.Phone ? `Телефон: ${center.Phone}` : ''}
            `
          },
          {
            preset: 'islands#orangeIcon'
          }
        );

        map.geoObjects.add(placemark);
        placemarksRef.current.push(placemark);
      });

      if (validCenters.length > 10) {
        map.options.set('clusterize', true);
        const clusterer = new window.ymaps.Clusterer({
          preset: 'islands#invertedOrangeClusterIcons',
          clusterDisableClickZoom: true,
          clusterHideIconOnBalloonOpen: false,
          geoObjectHideIconOnBalloonOpen: false
        });
        
        clusterer.add(placemarksRef.current);
        map.geoObjects.add(clusterer);
      }

      setMapError(null);
    } catch (error) {
      console.error('Map init error:', error);
      setMapError('Ошибка загрузки карты');
    } finally {
      setIsLoading(false);
    }
  }, [validCenters, zoom]);

  useYandexMaps('your-yandex-maps-api-key', initMap);

  if (!validCenters || validCenters.length === 0) {
    return (
      <Box sx={{ 
        height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 1
      }}>
        <Typography>Нет данных о расположении центров</Typography>
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
        backgroundColor: '#f5f5f5',
        borderRadius: 1
      }}>
        <Typography color="error" sx={{ mb: 2 }}>{mapError}</Typography>
        <Button 
          variant="outlined" 
          onClick={initMap}
          sx={{ color: '#e37243', borderColor: '#e37243' }}
        >
          Попробовать снова
        </Button>
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

export default AllCentersMap;