import React, { useEffect, useState } from 'react';
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
  Avatar,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/ReportGmailerrorredOutlined';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useParams} from 'react-router-dom';
import { trainerAPI } from '../../../services/TrainerService';
import { centerAPI } from '../../../services/CenterService'; 
import { useForm } from 'react-hook-form';
import { inputStyles } from '../../styles/themeStyles';


const TrainerUpdate = () => {
    const orangeColor = '#e37243';
    const orangeHover = '#db5c35';
    
    const { userID } = useParams();
    const { data, error, isLoading } = trainerAPI.useFetchTrainerByIDQuery(userID);
    const { data: centers = [], error: centersError, isLoading: centersLoading } = centerAPI.useFetchAllCentersQuery();
    const { 
        register, 
        handleSubmit,  
        formState: { errors, isDirty }, 
        watch,
        reset
    } = useForm();
    
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isError, setIsError] = useState(null);
    const [isSuccess, setIsSuccess] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateTrainer] = trainerAPI.useUpdateTrainerMutation();
  
    useEffect(() => {
        if (data) {
            reset({
                email: data.User.Email || '',
                firstName: data.User.FirstName || '',
                lastName: data.User.LastName || '',
                description: data.Description || '',
                specialization: data.Specialization || '',
                experienceYears: data.ExperienceYears || '',
                centerId: data.CenterId || '',
                img: data.Img || null
            });
            if (data.Img) {
                setImagePreview(`https://localhost:7066/api/trainer/${data.TrainerId}/image`);
            }
        }
    }, [data, reset]);


    const onSubmit = async (formData) => {
        setIsUpdating(true);
        const formDataObj = new FormData();
        formDataObj.append("email", formData.email);
        formDataObj.append("firstName", formData.firstName);
        formDataObj.append("lastName", formData.lastName);
        formDataObj.append("centerId", formData.centerId);
        formDataObj.append("description", formData.description);
        formDataObj.append("specialization", formData.specialization);
        formDataObj.append("experienceYears", formData.experienceYears);
        
        if (selectedFile) {
            formDataObj.append("img", selectedFile);
        } else if (data?.Img) {
            formDataObj.append("img", data.Img);
        }

        try {

            await updateTrainer({ userID, trainerData: formDataObj }).unwrap();
            setIsSuccess("Данные тренера успешно обновлены");
            setIsError(null);
            setTimeout(() => setIsSuccess(null), 3000);
        } catch (error) {
            let errorMessage;
            if (error.data?.errors?.length > 0) {
                errorMessage = error.data.errors.map(err => err.msg).join(', ');
            } else if (error.data?.message) {
                errorMessage = error.data.message;
            } else {
                errorMessage = 'Не удалось обновить данные тренера';
            }
            setIsError(errorMessage);
            setIsSuccess(null);
            setTimeout(() => setIsError(null), 3000);
        } finally {
            setIsUpdating(false);
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
    const description = watch('description');
    const specialization = watch('specialization');
    const experienceYears = watch('experienceYears');
    const centerId = watch('centerId');
    const selectedCenter = centers.find(c => c.CenterId === centerId);

    const hasChanges = isDirty;

    if (isLoading || centersLoading) {
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
            <Box sx={{ width: '90%', margin: 'auto', paddingTop: '30px' }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    Ошибка загрузки данных тренера. {error.message}
                </Alert>
            </Box>
        );
    }

    if (centersError) {
        return (
            <Box sx={{ width: '90%', margin: 'auto', height: '70vh', paddingTop: '30px' }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    Ошибка загрузки центров: {centersError.message}
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
            }}>            <Box sx={{ flex: 1 }}>
                <Typography variant="h4" color="#2E2E2E" sx={{ mb: 3 }}>
                    Редактирование тренера
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
                            maxLength: { value: 25, message: 'Максимум 25 символов'}, 
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
                            pattern: {
                                value: /^[A-Za-zА-Яа-яЁё]+$/,
                                message: "Только буквы"
                            }
                        })}
                        error={Boolean(errors.lastName)}
                        helperText={errors.lastName?.message || " "}
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
                                {imagePreview ? 'Изменить фото' : 'Загрузить фото'}
                            </Button>
                        </label>
                        {(imagePreview || data?.Img) && (
                            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar 
                                    src={imagePreview || `https://localhost:7066/api/trainer/${data.TrainerId}/image`}                                                                                    
                                    alt="Preview" 
                                    sx={{ 
                                        width: 100, 
                                        height: 100,
                                        border: `3px solid ${orangeColor}`
                                    }}
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
                        disabled={!hasChanges || isUpdating }                         
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
                            value: (imagePreview || data?.Img) ? 'Загружено' : 'Не загружено', 
                            hasValue: !!(imagePreview || data?.Img),
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

export default TrainerUpdate;