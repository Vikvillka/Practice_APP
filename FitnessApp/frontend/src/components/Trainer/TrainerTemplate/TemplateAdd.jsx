import React, { useContext, useState } from 'react';
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
import { templateAPI } from '../../../services/TemplateService';
import { trainerAPI } from '../../../services/TrainerService';
import { useForm } from 'react-hook-form';
import { Context } from '../../../index';
import { inputStyles } from '../../styles/themeStyles';

const TemplateAdd = () => {
    const { store } = useContext(Context);
    const userId = store.user.UserId;
    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
    const [createTemplate] = templateAPI.useCreateTemplateMutation();
    const [isError, setIsError] = useState(null);
    const [isSuccess, setIsSuccess] = useState(null);
    const { data: trainer, error: trainerError, isLoading: trainerLoading } = trainerAPI.useFetchTrainerByIDQuery(userId);
    
    const title = watch("title");
    const description = watch("description");
    const maxParticipants = watch('maxParticipants');
    const duration = watch('duration');

    const orangeColor = '#e37243';
    const orangeHover = '#db5c35';

    const onSubmit = async (data) => {
        try {
            const templateData = {
                ...data,
                trainerId: trainer.TrainerId 
            };
            
            await createTemplate(templateData).unwrap();
            
            setIsSuccess('Шаблон успешно добавлен!');
            setIsError(null);
            reset();
            
            setTimeout(() => setIsSuccess(null), 3000);
        } catch (error) {
            let errorMessage;
            if (error.data?.errors?.length > 0) {
              errorMessage = error.data.errors.map(err => err.msg).join(', ');
            } 
            else if (error.data?.message) {
              errorMessage = error.data.message;
            }
            else {
              errorMessage = 'Не удалось добавить шаблон';
            }
            setIsError(errorMessage);
            setIsSuccess(null);
            setTimeout(() => setIsError(null), 3000);
        }
    };

    if (trainerLoading) {
      return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100wh',
                width: '90%', 
                height: '70vh',
                margin: 'auto', 
                paddingTop: '30px' 
            }}>
                <CircularProgress size={60} sx={{ color: orangeColor }}/>
            </Box>
        );
    }

    if (trainerError) {
        return (
            <Box sx={{ width: '90%', margin: 'auto', paddingTop: '30px', height: '70vh'}}>
                <Alert severity="error">
                    Ошибка загрузки данных тренера: {trainerError.message}
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
                    Добавление шаблона для тренировок
                </Typography>
                
                {isError && <Alert severity="error" sx={{ position: 'fixed',bottom: 16,left: '50%',transform: 'translateX(-50%)',width: '80%',maxWidth: 600,zIndex: 9999,boxShadow: 3,mb: 2}}>{isError}</Alert>}
                {isSuccess && <Alert severity="success" sx={{  position: 'fixed',bottom: 16,left: '50%',transform: 'translateX(-50%)',width: '80%',maxWidth: 600,zIndex: 9999,boxShadow: 3,mb: 2}}>{isSuccess}</Alert>}
                
                <Box 
                    component="form" 
                    onSubmit={handleSubmit(onSubmit)} 
                    sx={{ display: 'flex', flexDirection: 'column', gap: '5px', mt: '20px' }}
                >
                    <TextField
                        label="Название тренировки *"
                        {...register("title", { 
                            required: "Введите название тренировки", 
                            minLength: { value: 3, message: "Минимум 3 символа" },
                            maxLength: { value: 20, message: 'Максимум 20 символов'}, 
                        })}
                        error={Boolean(errors.title)}
                        helperText={errors.title?.message || " "}
                        sx={inputStyles}
                    />
                    
                    <TextField
                        label="Описание *"
                        multiline
                        rows={3}
                        {...register("description", { 
                            required: "Введите описание",
                            minLength: { value: 5, message: "Минимум 5 символов" } 
                        })}
                        error={Boolean(errors.description)}
                        helperText={errors.description?.message || " "}
                        sx={inputStyles}
                    />
                    
                    <TextField
                        label="Продолжительность (минуты) *"
                        type="number"
                        {...register("duration", { 
                            valueAsNumber: true,
                            validate: {
                                positive: value => value >= 20  || "Продолжительность должна минимум 20 минут",
                                max: value => value <= 120 || "Не более 120 минут"
                            }
                        })}
                        error={Boolean(errors.duration)}
                        helperText={errors.duration?.message || " "}
                        sx={inputStyles}
                        inputProps={{ min: 1 }}
                    />
                    
                    <TextField
                        label="Максимальное число участников *"
                        type="number"
                        {...register("maxParticipants", { 
                            valueAsNumber: true,
                            validate: {
                                positive: value => value > 0 || "Число участников должно быть больше 0",
                                max: value => value <= 30 || "Не более 30 участников"
                            }
                        })}
                        error={Boolean(errors.maxParticipants)}
                        helperText={errors.maxParticipants?.message || " "}
                        sx={inputStyles}
                        inputProps={{ min: 1, max: 30 }}
                    />
                    
                    <Button 
                        type="submit" 
                        variant="contained" 
                        sx={{ 
                            bgcolor: orangeColor,
                            '&:hover': { bgcolor: orangeHover },
                            height: '45px',
                            mt: '10px',
                            fontSize: '0.95rem'
                        }}
                    >
                        Добавить шаблон
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
                            value: title || 'Не указано', 
                            hasValue: !!title,
                            icon: '🏷️',
                            fullWidth: true
                        },
                        { 
                            label: 'Описание', 
                            value: description || 'Не указано', 
                            hasValue: !!description,
                            icon: '📝',
                            fullWidth: true
                        },
                        { 
                            label: 'Продолжительность', 
                            value: duration !== undefined && !isNaN(duration) ? `${duration} мин.` : 'Не указана', 
                            hasValue: duration !== undefined && !isNaN(duration) && duration >= 20  && duration <= 120,
                            icon: '⏱️'
                        },
                        { 
                            label: 'Макс. участников', 
                            value: maxParticipants !== undefined && !isNaN(maxParticipants) ? `${maxParticipants} чел.` : 'Не указано', 
                            hasValue: maxParticipants !== undefined && !isNaN(maxParticipants) && maxParticipants >= 1  && maxParticipants <= 30,
                            icon: '👥'
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

export default TemplateAdd;