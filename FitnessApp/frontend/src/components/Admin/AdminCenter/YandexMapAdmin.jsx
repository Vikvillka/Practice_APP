import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import useYandexMaps from '../../../services/UseYandexMaps';
import { Button, Box, CircularProgress, Typography } from '@mui/material';

const YandexMapAdmin = ({ 
  address, 
  initialCoords, 
  onMapClick, 
  height = '400px',
  city
}) => {
  const [mapError, setMapError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const mapRef = useRef(null);
  const placemarkRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const isInitializedRef = useRef(false);

  const updatePlacemark = useCallback((coords) => {
    if (!mapInstanceRef.current) return;

    if (placemarkRef.current) {
      mapInstanceRef.current.geoObjects.remove(placemarkRef.current);
    }

    const newPlacemark = new window.ymaps.Placemark(
      coords,
      { 
        hintContent: 'Местоположение центра',
        balloonContent: `Координаты: ${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`
      },
      {
        preset: 'islands#redIcon',
        draggable: true
      }
    );

    newPlacemark.events.add('dragend', () => {
      const newCoords = newPlacemark.geometry.getCoordinates();
      if (onMapClick) onMapClick(newCoords);
    });

    mapInstanceRef.current.geoObjects.add(newPlacemark);
    placemarkRef.current = newPlacemark;
    mapInstanceRef.current.setCenter(coords, 15);
  }, [onMapClick]);

const findAddress = useCallback(() => {
  if (!window.ymaps || !mapInstanceRef.current || !address || !city) return;

  setSearchLoading(true);
  setMapError(null);

  const fullAddress = `${city}, ${address}`;

  window.ymaps.geocode(fullAddress, { results: 1 })
    .then((res) => {
      const firstGeoObject = res.geoObjects.get(0);
      if (firstGeoObject) {
        const coords = firstGeoObject.geometry.getCoordinates();
        updatePlacemark(coords);
        if (onMapClick) onMapClick(coords);
      } else {
        setMapError('Адрес не найден');
      }
      setSearchLoading(false);
    })
    .catch((err) => {
      console.error('Geocoding error:', err);
      setMapError('Ошибка поиска адреса');
      setSearchLoading(false); 
    });
}, [address, city, updatePlacemark, onMapClick]);


  const initMap = useCallback(() => {
    if (isInitializedRef.current || !window.ymaps) return;
    isInitializedRef.current = true;

    try {
      setIsLoading(true);
      
      const map = new window.ymaps.Map(mapRef.current, {
        center: initialCoords || [53.9, 27.55],
        zoom: initialCoords ? 15 : 12,
        controls: ['zoomControl']
      });

      mapInstanceRef.current = map;

      map.events.add('click', (e) => {
        const coords = e.get('coords');
        updatePlacemark(coords);
        if (onMapClick) onMapClick(coords);
      });

      if (initialCoords) {
        updatePlacemark(initialCoords);
      }
      
      setMapError(null);
    } catch (error) {
      console.error('Map init error:', error);
      setMapError('Ошибка инициализации карты');
    } finally {
      setIsLoading(false);
    }
  }, [initialCoords, updatePlacemark, onMapClick]);

  useYandexMaps('0871bb9d-169f-4410-baeb-ec962e6a28ee', initMap);

  useEffect(() => {
    if (initialCoords && mapInstanceRef.current && !isLoading) {
      updatePlacemark(initialCoords);
    }
  }, [initialCoords, updatePlacemark, isLoading]);

  const memoizedMap = useMemo(() => (
    <div ref={mapRef} style={{ 
      width: '100%', 
      height, 
      border: '2px solid #d32f2f',
      visibility: isLoading ? 'hidden' : 'visible'
    }} />
  ), [height, isLoading]);

  if (mapError) {
    return (
      <Box sx={{ 
        height, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        border: '2px solid #d32f2f'
      }}>
        <Typography color="error" sx={{ mb: 2 }}>{mapError}</Typography>
        <Button 
          variant="outlined" 
          onClick={() => window.location.reload()}
          sx={{ color: '#d32f2f', borderColor: '#d32f2f' }}
        >
          Перезагрузить
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2, position: 'relative' }}>
      {(isLoading || searchLoading) && (
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
      
      {memoizedMap}
      
      <Button 
        variant="outlined" 
        onClick={findAddress}
        disabled={!address || !city || isLoading || searchLoading}
        sx={{ 
          mt: 1,
          color: '#d32f2f',
          borderColor: '#d32f2f',
          '&:hover': { borderColor: '#b71c1c' }
        }}
      >
        {searchLoading ? 'Поиск...' : 'Найти на карте'}
      </Button>
    </Box>
  );
};

export default YandexMapAdmin;