import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Alert, 
  Paper,
  CircularProgress,
  MenuItem,
  Select, 
  FormControl, 
  InputLabel,
  Avatar
} from '@mui/material';
import WarningIcon from '@mui/icons-material/ReportGmailerrorredOutlined';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useForm } from 'react-hook-form';
import { trainerAPI } from '../../../services/TrainerService';
import { centerAPI } from '../../../services/CenterService';
import { inputStyles } from '../../styles/themeStyles';

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

const TrainerAdd = () => {
    const orangeColor = '#e37243';
    const orangeHover = '#db5c35';
    
    const { register, handleSubmit, formState: { errors, isDirty }, watch, reset, setValue } = useForm();
    const [createTrainer] = trainerAPI.useCreateTrainerMutation();
    const { data: centers = [], error: centersError, isLoading: centersLoading } = centerAPI.useFetchAllCentersQuery();
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isError, setIsError] = useState(null);
    const [isSuccess, setIsSuccess] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [phoneValue, setPhoneValue] = useState('+375(');
    const [phoneValid, setPhoneValid] = useState(false);
    const [phoneError, setPhoneError] = useState(null);

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

    useEffect(() => {
        if (phoneValue && phoneValue.length > 5) {
            validatePhoneFormat(phoneValue);
        }
    }, [phoneValue]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            if (!validatePhoneFormat(phoneValue)) {
                throw new Error("Неверный формат телефона");
            }
            
            const formData = new FormData();
            formData.append("email", data.email);
            formData.append("firstName", data.firstName);
            formData.append("lastName", data.lastName);
            formData.append("phone", `375${phoneValue.replace(/\D/g, '').substring(3)}`);
            formData.append("password", data.password);
            formData.append("centerId", data.centerId);
            formData.append("description", data.description);
            formData.append("specialization", data.specialization);
            formData.append("experienceYears", data.experienceYears);
            if (selectedFile) {
                formData.append("img", selectedFile);
            }

            await createTrainer(formData).unwrap();
            setIsSuccess("Тренер успешно добавлен");
            setIsError(null);
            reset();
            setSelectedFile(null);
            setImagePreview(null);
            setPhoneValue('+375(');
            setPhoneValid(false);
            setTimeout(() => setIsSuccess(null), 3000);
        } catch (error) {
            let errorMessage;
            if (error.data?.errors?.length > 0) {
                errorMessage = error.data.errors.map(err => err.msg).join(', ');
            } else if (error.data?.message) {
                errorMessage = error.data.message;
            } else {
                errorMessage = 'Не удалось добавить тренера';
            }
            setIsError(errorMessage);
            setIsSuccess(null);
            setTimeout(() => setIsError(null), 3000);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        setSelectedFile(null);
        setImagePreview(null);
    };

    const email = watch('email');
    const firstName = watch('firstName');
    const lastName = watch('lastName');
    const centerId = watch('centerId');
    const description = watch('description');
    const specialization = watch('specialization');
    const experienceYears = watch('experienceYears');
    const selectedCenter = centers.find(c => c.CenterId == centerId);

    if (centersLoading) {
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

    if (centersError) {
        return (
            <Box sx={{ width: '90%', margin: 'auto', height: '70vh', paddingTop: '30px' }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    Ошибка загрузки центров для добавления тренеров. {centersError.message}
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
                    Добавление тренера
                </Typography>
                
                {isError && <Alert severity="error" sx={{  position: 'fixed',bottom: 16,left: '50%',transform: 'translateX(-50%)',width: '80%',maxWidth: 600,zIndex: 9999,boxShadow: 3,mb: 2}}>{isError}</Alert>}
                {isSuccess && <Alert severity="success" sx={{  position: 'fixed',bottom: 16,left: '50%',transform: 'translateX(-50%)',width: '80%',maxWidth: 600,zIndex: 9999,boxShadow: 3,mb: 2}}>{isSuccess}</Alert>}
                
                <Box 
                    component="form" 
                    onSubmit={handleSubmit(onSubmit)} 
                    sx={{ display: 'flex', flexDirection: 'column', gap: '5px', mt: '20px' }}
                >
                    <TextField
                        label="Email *"
                        {...register('email', {
                            required: 'Введите email',
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'Введите действительный email',
                            },
                        })}
                        error={Boolean(errors.email)}
                        helperText={errors.email?.message || " "}
                        sx={inputStyles}
                    />
                    
                    <TextField
                        label="Имя *"
                        {...register("firstName", { 
                            required: "Введите имя",
                            maxLength: { value: 20, message: 'Максимум 20 символов'}, 
                            minLength: { value: 2, message: 'Минимум 2 символа'},
                            pattern: {
                                value: /^[A-Za-zА-Яа-яЁё]+$/,
                                message: "Только буквы"
                            }
                        })}
                        error={Boolean(errors.firstName)}
                        helperText={errors.firstName?.message || " "}
                        sx={inputStyles}
                    />
                    
                    <TextField
                        label="Фамилия *"
                        {...register("lastName", { 
                            required: "Введите фамилию",
                            maxLength: { value: 25, message: 'Максимум 25 символов'}, 
                            minLength: { value: 2, message: 'Минимум 2 символа'}, 
                            pattern: {
                                value: /^[A-Za-zА-Яа-яЁё]+$/,
                                message: "Только буквы"
                            }
                        })}
                        error={Boolean(errors.lastName)}
                        helperText={errors.lastName?.message || " "}
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
                    
                    <TextField
                        label="Пароль *"
                        type="password"
                        {...register("password", { 
                            required: "Введите пароль", 
                            minLength: { value: 6, message: "Минимум 6 символов" },
                            maxLength: { value: 30, message: 'Максимум 30 символов'},  
                        })}
                        error={Boolean(errors.password)}
                        helperText={errors.password?.message || " "}
                        sx={inputStyles}
                    />
                    
                    <TextField
                        label="Описание *"
                        multiline
                        rows={3}
                        {...register("description", { required: "Введите описание",
                            minLength: { value: 10, message: "Минимум 10 символов" },
                         })}
                        error={Boolean(errors.description)}
                        helperText={errors.description?.message || " "}
                        sx={inputStyles}
                    />
                    
                    <TextField
                        label="Специализация *"
                        {...register("specialization", { required: "Введите специализацию",
                            minLength: { value: 5, message: "Минимум 5 символов" },
                         })}
                        error={Boolean(errors.specialization)}
                        helperText={errors.specialization?.message || " "}
                        sx={inputStyles}
                    />
                    
                    <TextField
                        label="Опыт (лет) *"
                        type="number"
                        {...register("experienceYears", { 
                            valueAsNumber: true,
                            validate: {
                                positive: value => value > 0 || "Опыт должен быть больше 0",
                                max: value => value <= 40 || "Не более 40 лет"
                            }
                        })}
                        error={Boolean(errors.experienceYears)}
                        helperText={errors.experienceYears?.message || " "}
                        sx={inputStyles}
                        inputProps={{ min: 1, max: 40 }}
                    />
                    
                    <FormControl sx={inputStyles} error={Boolean(errors.centerId)}>
                        <InputLabel>Центр *</InputLabel>
                        <Select
                            {...register("centerId", { required: "Выберите центр" })}
                            value={centerId || ''}
                            label="Центр *"
                            sx={{
                                '& .MuiSelect-select': {
                                    padding: '14px'
                                }
                            }}
                        >
                            <MenuItem value="" disabled>Выберите центр</MenuItem>
                            {centers.map(center => (
                                <MenuItem key={center.CenterId} value={center.CenterId}>
                                    {center.CenterName}
                                </MenuItem>
                            ))}
                        </Select>
                        {errors.centerId && (
                            <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                                {errors.centerId.message}
                            </Typography>
                        )}
                    </FormControl>
                    
                    <Box sx={{ mt: 2, mb: 2 }}>
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="trainer-photo-upload"
                            type="file"
                            onChange={handleFileChange}
                        />
                        <label htmlFor="trainer-photo-upload">
                            <Button
                                variant="outlined"
                                component="span"
                                startIcon={<CloudUploadIcon />}
                                sx={{
                                    borderColor: orangeColor,
                                    color: orangeColor,
                                    '&:hover': {
                                        borderColor: orangeHover,
                                        color: orangeHover
                                    }
                                }}
                            >
                                Загрузить фото
                            </Button>
                        </label>
                        {imagePreview && (
                            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar 
                                    src={imagePreview} 
                                    alt="Preview" 
                                    sx={{ width: 80, height: 80 }}
                                />
                                <Button 
                                    color="error"
                                    onClick={handleRemoveImage}
                                    size="small"
                                >
                                    Удалить
                                </Button>
                            </Box>
                        )}
                    </Box>
                    
                    <Button 
                        type="submit" 
                        variant="contained"
                        disabled={!isDirty || isSubmitting || phoneError}
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
                        {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Добавить тренера'}
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
                            label: 'Email', 
                            value: email || 'Не указан', 
                            hasValue: !!email,
                            icon: '✉️',
                            fullWidth: true
                        },
                        { 
                            label: 'Имя', 
                            value: firstName || 'Не указано', 
                            hasValue: !!firstName,
                            icon: '👤'
                        },
                        { 
                            label: 'Фамилия', 
                            value: lastName || 'Не указано', 
                            hasValue: !!lastName,
                            icon: '👥'
                        },
                        { 
                            label: 'Телефон', 
                            value: phoneValue || 'Не указан', 
                            hasValue: phoneValid,
                            icon: '📞'
                        },
                        { 
                            label: 'Центр', 
                            value: selectedCenter?.CenterName || 'Не выбран', 
                            hasValue: !!selectedCenter,
                            icon: '🏢'
                        },
                        { 
                            label: 'Специализация', 
                            value: specialization || 'Не указана', 
                            hasValue: !!specialization,
                            icon: '🎯'
                        },
                        { 
                            label: 'Опыт', 
                            value: experienceYears != null && !isNaN(experienceYears) ? `${experienceYears} лет` : 'Не указан', 
                            hasValue: experienceYears != null && !isNaN(experienceYears)  && experienceYears >= 1,
                            icon: '📅'
                        },
                        { 
                            label: 'Описание', 
                            value: description || 'Не указано', 
                            hasValue: !!description,
                            icon: '📝',
                            fullWidth: true
                        },
                        { 
                            label: 'Фото', 
                            value: imagePreview ? 'Загружено' : 'Не загружено', 
                            hasValue: !!imagePreview,
                            icon: '📷',
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

export default TrainerAdd;