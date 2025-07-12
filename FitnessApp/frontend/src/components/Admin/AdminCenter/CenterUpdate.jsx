import React, { useEffect, useState } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Alert, 
  Paper,
  CircularProgress,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/ReportGmailerrorredOutlined';
import { useParams, useNavigate } from 'react-router-dom';
import { centerAPI } from '../../../services/CenterService';
import { useForm } from 'react-hook-form';
import { inputStyles } from '../../styles/themeStyles';
import YandexMapAdmin from './YandexMapAdmin';

const PhoneInput = ({ value, onChange, error, helperText, validatePhone }) => {
  const [isTouched, setIsTouched] = useState(false);
  
  const handlePhoneChange = (e) => {
    const input = e.target.value;
    const digits = input.replace(/\D/g, '');
    
    if (!digits.startsWith('375') && digits.length > 0) return;
    if (digits.length > 12) return;
    
    let formattedValue = '+375(';
    const phoneDigits = digits.substring(3);
    
    if (phoneDigits.length > 0) formattedValue += phoneDigits.substring(0, 2);
    if (phoneDigits.length > 2) formattedValue += ')' + phoneDigits.substring(2, 5);
    if (phoneDigits.length > 5) formattedValue += '-' + phoneDigits.substring(5, 7);
    if (phoneDigits.length > 7) formattedValue += '-' + phoneDigits.substring(7, 9);
    
    onChange(formattedValue);
    validatePhone(formattedValue);
    setIsTouched(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace' && value.length <= 5) {
      e.preventDefault();
    }
  };

  const handleBlur = () => {
    setIsTouched(true);
  };

  return (
    <TextField
      fullWidth
      label="Номер телефона *"
      variant="outlined"
      value={value}
      onChange={handlePhoneChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      inputProps={{ maxLength: 17 }}
      error={isTouched && error}
      helperText={isTouched ? (helperText || "Формат: +375(XX)XXX-XX-XX") : " "}
      sx={inputStyles}
    />
  );
};

const CenterUpdate = () => {
    const orangeColor = '#e37243';
    const orangeHover = '#db5c35';
    const { centerId } = useParams();
    console.log({centerId});
    const navigate = useNavigate();
    const { data: centerData, error, isLoading } = centerAPI.useFetchCenterByIDQuery(centerId);
    const [updateCenter] = centerAPI.useUpdateCenterMutation();
    const { 
        register, 
        handleSubmit, 
        setValue, 
        formState: { errors, isDirty }, 
        watch,
        reset
    } = useForm();
    const [isError, setIsError] = useState(null);
    const [isSuccess, setIsSuccess] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [phoneValue, setPhoneValue] = useState('+375(');
    const [phoneValid, setPhoneValid] = useState(false);
    const [phoneError, setPhoneError] = useState(null);
    const [initialPhone, setInitialPhone] = useState('+375(');
    const [isPhoneChanged, setIsPhoneChanged] = useState(false);
    const [coords, setCoords] = useState(null);
    const [initialCoords, setInitialCoords] = useState(null);

    const formatPhoneFromDB = (phone) => {
        if (!phone) return '+375(';
        const digits = phone.toString().replace(/\D/g, '');
        if (digits.length !== 12) return '+375(';
        
        return `+375(${digits.substring(3, 5)})${digits.substring(5, 8)}-${digits.substring(8, 10)}-${digits.substring(10)}`;
    };

    useEffect(() => {
        if (centerData) {
            const formattedPhone = formatPhoneFromDB(centerData.Phone);
            setPhoneValue(formattedPhone);
            setInitialPhone(formattedPhone);
            
            if (centerData.Latitude && centerData.Longitude) {
                const centerCoords = [centerData.Latitude, centerData.Longitude];
                setCoords(centerCoords);
                setInitialCoords(centerCoords);
            }
            
            reset({
                centerName: centerData.CenterName || '',
                address: centerData.Address || '',
                city: centerData.City || '',
                phone: centerData.Phone || '',
                latitude: centerData.Latitude || '',
                longitude: centerData.Longitude || ''
            });
        }
    }, [centerData, reset]);

    const validatePhoneFormat = (phone) => {
        const digits = phone.replace(/\D/g, '').substring(3);
        const isValid = digits.length === 9;
        setPhoneValid(isValid);
        
        if (!isValid) {
            setPhoneError("Введите полный номер телефона");
            return false;
        }
        setPhoneError(null);
        return true;
    };

    const handleMapClick = (newCoords) => {
        setCoords(newCoords);
        setValue('latitude', newCoords[0], { shouldValidate: true });
        setValue('longitude', newCoords[1], { shouldValidate: true });
    };

    useEffect(() => {
        if (phoneValue && phoneValue.length > 5) {
            validatePhoneFormat(phoneValue);
            setIsPhoneChanged(phoneValue !== initialPhone);
        }
    }, [phoneValue]);

    const onSubmit = async (formData) => {
        setIsUpdating(true);
        try {
            if (!validatePhoneFormat(phoneValue)) {
                throw new Error("Неверный формат телефона");
            }
            
            formData.phone = `375${phoneValue.replace(/\D/g, '').substring(3)}`;
            
            if (coords) {
                formData.latitude = coords[0];
                formData.longitude = coords[1];
            }
            
            await updateCenter({ centerId, centerData: formData }).unwrap();
            setIsSuccess('Данные центра успешно обновлены');
            setIsError(null);
            setTimeout(() => setIsSuccess(null), 3000);
            setInitialPhone(phoneValue);
            setInitialCoords(coords);
            setIsPhoneChanged(false);
        } catch (error) {
            let errorMessage;
            if (error.data?.errors?.length > 0) {
                errorMessage = error.data.errors.map(err => err.msg).join(', ');
            } else if (error.data?.message) {
                errorMessage = error.data.message;
            } else {
                errorMessage = 'Не удалось обновить данные центра';
            }
            setIsError(errorMessage);
            setIsSuccess(null);
            setTimeout(() => setIsError(null), 3000);
        } finally {
            setIsUpdating(false);
        }
    };

    const centerName = watch('centerName');
    const address = watch('address');
    const city = watch('city');

    const hasChanges = isDirty || isPhoneChanged || 
                      (coords && initialCoords && 
                       (coords[0] !== initialCoords[0] || coords[1] !== initialCoords[1]));

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
                <CircularProgress size={60} sx={{ color: '#e37243' }}/>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ width: '90%', margin: 'auto', height: '70vh', paddingTop: '30px' }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    Ошибка загрузки данных центра: {error.message}
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            width: '90%',
            mx: 'auto',
            p: 3,
        }}>
            <Box sx={{ flex: 1 }}>
                <Typography variant="h4" color="#2E2E2E" sx={{ mb: 3 }}>
                    Изменение центра
                </Typography>
                
                {isError && <Alert severity="error" sx={{ position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)', width: '80%', maxWidth: 600, zIndex: 9999, boxShadow: 3, mb: 2 }}>{isError}</Alert>}
                {isSuccess && <Alert severity="success" sx={{ position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)', width: '80%', maxWidth: 600, zIndex: 9999, boxShadow: 3, mb: 2 }}>{isSuccess}</Alert>}
                
                <Box 
                    component="form" 
                    onSubmit={handleSubmit(onSubmit)} 
                    sx={{ display: 'flex', flexDirection: 'column', gap: '5px', mt: '20px' }}
                >
                    <TextField
                        label="Название центра *"
                        {...register("centerName", { 
                            required: "Введите название центра", 
                            minLength: { value: 5, message: "Минимум 5 символов" },
                            maxLength: { value: 50, message: 'Максимум 50 символов'},
                        })}
                        error={Boolean(errors.centerName)}
                        helperText={errors.centerName?.message || " "}
                        sx={inputStyles}
                    />
                    
                    <TextField
                        label="Город *"
                        {...register("city", { 
                            required: "Введите город",
                            minLength: { value: 3, message: "Минимум 3 символа" },
                            maxLength: { value: 25, message: 'Максимум 25 символов'},
                            pattern: {
                                value: /^[A-Za-zА-Яа-яЁё\s-]+$/,
                                message: "Город не должен содержать цифры и специальные символы"
                            }
                        })}
                        error={Boolean(errors.city)}
                        helperText={errors.city?.message || " "}
                        sx={inputStyles}
                    />

                    <TextField
                        label="Адрес *"
                        {...register("address", { 
                            required: "Введите адрес",
                            minLength: { value: 5, message: "Минимум 5 символов" },
                            maxLength: { value: 50, message: 'Максимум 50 символов'},
                        })}
                        error={Boolean(errors.address)}
                        helperText={errors.address?.message || " "}
                        sx={inputStyles}
                    />
                    
                    <PhoneInput 
                        value={phoneValue}
                        onChange={(value) => {
                            setPhoneValue(value);
                            const digits = value.replace(/\D/g, '').substring(3);
                            setValue('phone', `375${digits}`, { shouldValidate: true });
                        }}
                        error={Boolean(phoneError)}
                        helperText={phoneError}
                        validatePhone={validatePhoneFormat}
                    />
                    
                    <input type="hidden" {...register("latitude")} />
                    <input type="hidden" {...register("longitude")} />
                    
                    <Typography variant="subtitle1" sx={{ color: '#333', mt: 2 }}>
                        Местоположение центра на карте:
                    </Typography>
                    <YandexMapAdmin 
                        address={address}
                        city={city}
                        initialCoords={coords}
                        onMapClick={handleMapClick}
                        height="300px"
                    />
                    
                    <Button 
                        type="submit" 
                        variant="contained"
                        disabled={!hasChanges || isUpdating || phoneError}
                        sx={{ 
                            bgcolor: orangeColor,
                            '&:hover': { bgcolor: orangeHover },
                            height: '45px',
                            mt: '10px',
                            fontSize: '0.95rem',
                            '&:disabled': {
                                bgcolor: '#f5f5f5',
                                color: '#bdbdbd'
                            }
                        }}
                    >
                        {isUpdating ? <CircularProgress size={24} color="inherit" /> : 'Сохранить изменения'}
                    </Button>
                </Box>
            </Box>

            <Paper sx={{ 
                p: 3, 
                flexBasis: '45%', 
                borderRadius: 2,
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                background: 'linear-gradient(145deg, #f5f5f5, #ffffff)'
            }}>
                <Box sx={{ 
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: '1fr 1fr'
                }}>
                    {[
                        { 
                            label: 'Название', 
                            value: centerName || 'Не указано', 
                            hasValue: !!centerName,
                            icon: '🏢',
                            fullWidth: true
                        },
                        { 
                            label: 'Город', 
                            value: city || 'Не указан', 
                            hasValue: !!city,
                            icon: '🏙️'
                        },
                        { 
                            label: 'Телефон', 
                            value: phoneValue || 'Не указан', 
                            hasValue: phoneValid,
                            icon: '📞'
                        },
                        { 
                            label: 'Адрес', 
                            value: address || 'Не указан', 
                            hasValue: !!address,
                            icon: '📍',
                            fullWidth: true
                        },
                        { 
                            label: 'Координаты', 
                            value: coords ? `${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}` : 'Не указаны', 
                            hasValue: !!coords,
                            icon: '🌐',
                            fullWidth: true
                        }
                    ].map((item, index) => (
                        <Box 
                            key={index} 
                            sx={{ 
                                gridColumn: item.fullWidth ? '1 / -1' : 'auto',
                                p: 2,
                                borderRadius: 1,
                                backgroundColor: item.hasValue ? '#f8f9fa' : '#fff8f8',
                                borderLeft: `3px solid ${item.hasValue ? '#4CAF50' : '#F44336'}`,
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                <Typography 
                                    variant="subtitle2" 
                                    sx={{ 
                                        fontWeight: 'bold',
                                        color: item.hasValue ? '#333' : '#d32f2f',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <span style={{ marginRight: 8, fontSize: '1.1rem' }}>{item.icon}</span>
                                    {item.label}
                                </Typography>
                                {!item.hasValue && (
                                    <WarningIcon 
                                        color="error" 
                                        sx={{ 
                                            ml: 1, 
                                            fontSize: '1rem',
                                            position: 'absolute',
                                            right: 8,
                                            top: 8
                                        }} 
                                    />
                                )}
                            </Box>
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    color: item.hasValue ? '#555' : '#d32f2f',
                                    fontStyle: !item.hasValue ? 'italic' : 'normal',
                                    pl: '24px'
                                }}
                            >
                                {item.value}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Paper>
        </Box>
    );
};

export default CenterUpdate;