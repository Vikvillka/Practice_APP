import React, { useState, useContext } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Alert, 
  MenuItem,
  CircularProgress,
  Paper,
  Chip
} from '@mui/material';
import { 
    inputStyles, 
    autocompleteStyles, 
    dateTimePickerStyles 
  } from '../../styles/themeStyles';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import WarningIcon from '@mui/icons-material/ReportGmailerrorredOutlined';
import { Autocomplete } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useForm } from 'react-hook-form';
import { trainerAPI } from '../../../services/TrainerService';
import { trainingAPI } from '../../../services/TrainingService';
import { templateAPI } from '../../../services/TemplateService';
import { Context } from '../../../index';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

const TrainingAdd = () => {
    const { store } = useContext(Context);
    const userId = store.user.UserId;
    const [dateTime, setDateTime] = useState(null);
    const { register, handleSubmit, formState: { errors }, setValue, reset, watch } = useForm();
    const [isError, setIsError] = useState(null);
    const [isSuccess, setIsSuccess] = useState(null);
    const [searchInput, setSearchInput] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [autocompleteKey, setAutocompleteKey] = useState(0); 

    const templateId = watch("templateId");
    const price = watch("price");

    const { data: trainer, error: trainerError, isLoading: trainerLoading } = 
        trainerAPI.useFetchTrainerByIDQuery(userId);
    const { data: templates = [], error: templatesError, isLoading: templatesLoading } = 
        templateAPI.useFetchAllTemplatesQuery();
    const [createTraining] = trainingAPI.useCreateTrainingMutation();

    const filteredTemplates = templates.filter(t => 
        t.Title.toLowerCase().includes(searchInput.toLowerCase()) && 
        t.Trainer?.CenterId === trainer?.CenterId
    );

    const handleTemplateChange = (_, value) => {
        setValue("templateID", value?.TemplateId, { shouldValidate: true });
        setSelectedTemplate(value); 
    };

    const orangeColor = '#e37243';
    const orangeHover = '#db5c35';
    const ownTemplateColor = '#e8f5e9';
    const otherTemplateColor = '#ffebee';

    const onSubmit = async (data) => {
        try {
            if (!dateTime) {
                setIsError('Укажите дату проведения тренировки');
                setTimeout(() => setIsError(null), 3000);
                return;
            }

            await createTraining({
                ...data,
                dateTime,
                trainerId: trainer.TrainerId,
                centerId: trainer.CenterId
            }).unwrap();
            
            setIsSuccess('Тренировка успешно добавлена');
            setIsError(null);
            reset();
            setDateTime(null);
            setSearchInput('');
            setSelectedTemplate(null);
            setAutocompleteKey(prev => prev + 1); 
            setTimeout(() => setIsSuccess(null), 3000);
        }catch (error) {
            let errorMessage;
            if (error.data?.errors?.length > 0) {
              errorMessage = error.data.errors.map(err => err.msg).join(', ');
            } 
            else if (error.data?.message) {
              errorMessage = error.data.message;
            }
            else {
              errorMessage = 'Не удалось добавить тренировку';
            }
            setIsError(errorMessage);
            setIsSuccess(null);
            setTimeout(() => setIsError(null), 3000);
        }
    };

    if (trainerLoading || templatesLoading) {
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

    if (templatesError || templatesError){
    return (
            <Box sx={{ width: '80%', height: '70vh', margin: 'auto', paddingTop: '30px' }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    Ошибка загрузки тренеров. {trainerError.message}
                </Alert>
            </Box>
        );
    }


    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
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
                        Добавление тренировки
                    </Typography>
                    
                    {isError && <Alert severity="error" sx={{  position: 'fixed',bottom: 16,left: '50%',transform: 'translateX(-50%)',width: '80%',maxWidth: 600,zIndex: 9999,boxShadow: 3,mb: 2}}>{isError}</Alert>}
                    {isSuccess && <Alert severity="success" sx={{  position: 'fixed',bottom: 16,left: '50%',transform: 'translateX(-50%)',width: '80%',maxWidth: 600,zIndex: 9999,boxShadow: 3,mb: 2}}>{isSuccess}</Alert>}
                    
                    <Box 
                        component="form" 
                        onSubmit={handleSubmit(onSubmit)} 
                        sx={{ display: 'flex', flexDirection: 'column', gap: '5px' , mt: '20px'}}
                    >
                        <Autocomplete
                            key={autocompleteKey}
                            options={filteredTemplates}
                            getOptionLabel={(option) => option.Title}
                            onChange={handleTemplateChange}
                            onInputChange={(_, value) => setSearchInput(value)}
                            filterOptions={(options) => options}
                            renderOption={(props, option) => (
                                <MenuItem 
                                    {...props}
                                    key={option.TemplateId}
                                    sx={{
                                        backgroundColor: option.TrainerId === trainer.TrainerId 
                                            ? ownTemplateColor 
                                            : otherTemplateColor,
                                        '&:hover': {
                                            backgroundColor: option.TrainerId === trainer.TrainerId 
                                                ? '#c8e6c9' 
                                                : '#ffcdd2',
                                        },
                                        my: 0.5,
                                        borderRadius: 1
                                    }}
                                >
                                    <Box sx={{ width: '100%' }}>
                                        <Typography fontWeight={option.TrainerId === trainer.TrainerId ? 500 : 300} fontSize={14}>
                                            {option.Title}
                                        </Typography>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center',
                                            mt: 0.5,
                                            gap: 1
                                        }}>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Chip 
                                                    label={`${option.Duration} мин`}
                                                    size="small"
                                                />
                                                <Chip 
                                                    label={`${option.MaxParticipants} чел`}
                                                    size="small"
                                                />
                                            </Box>
                                                
                                            {option.TrainerId !== trainer.TrainerId && (
                                                <Chip 
                                                    label="Чужой шаблон"
                                                    size="small"
                                                    sx={{
                                                        fontSize: '0.7rem',
                                                        backgroundColor: 'rgba(239, 83, 80, 0.12)', 
                                                        color: '#d32f2f', 
                                                        border: '1px solid rgba(239, 83, 80, 0.3)',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(239, 83, 80, 0.2)'
                                                        }
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    </Box>
                                </MenuItem>
                            )}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Поиск шаблона *"
                                    error={Boolean(errors.templateId)}
                                    helperText={errors.templateId?.message || " "}
                                    sx={inputStyles}
                                />
                            )}
                            noOptionsText="Шаблоны не найдены"
                            isOptionEqualToValue={(option, value) => option.TemplateId === value.TemplateId}
                            sx={autocompleteStyles}
                        />
                        
                        <TextField
                            label="Цена тренировки *"
                            type="number"
                            {...register("price", { 
                                required: "Введите цену",
                                valueAsNumber: true,
                                validate: {
                                    positive: v => v > 0 || "Цена должна быть больше 0",
                                    max: v => v <= 150 || "Цена не может превышать 150 р.",
                                    min: v => v >= 1 || "Минимальная цена - 1 рубль"
                                }
                            })}
                            error={Boolean(errors.price)}
                            helperText={errors.price?.message || " "}
                            sx={inputStyles}
                            inputProps={{
                                min: 1,
                                max: 150,
                                step: 1
                            }}
                        />
                        
                        <Box sx={dateTimePickerStyles}>
                            <DateTimePicker
                                label="Дата проведения *"
                                value={dateTime}
                                sx={{width: '100%'}}
                                renderInput={(params) => (
                                    <TextField 
                                        {...params} 
                                        error={!dateTime}
                                        helperText={!dateTime ? "Укажите дату проведения" : " "}
                                        sx={inputStyles} 
                                    />
                                )}
                                onChange={(newValue) => {
                                    setDateTime(newValue);
                                    if (!newValue) {
                                        setIsError('Укажите дату проведения тренировки');
                                        setTimeout(() => setIsError(null), 3000);
                                    }
                                }}
                                minDateTime={dayjs().add(1, 'hour')}
                                format="DD/MM/YYYY HH:mm"
                            />
                        </Box>
                        
                        <Button 
                            type="submit" 
                            variant="contained" 
                            sx={{ 
                                bgcolor: orangeColor,
                                '&:hover': { bgcolor: orangeHover },
                                height: '45px',
                                mt: '20px',
                                fontSize: '0.95rem'
                            }}
                        >
                            Добавить тренировку
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
                                label: 'Шаблон', 
                                value: templateId ? 'Выбран' : 'Не выбран', 
                                hasValue: !!templateId,
                                icon: '📋'
                            },
                            { 
                                label: 'Название', 
                                value: selectedTemplate?.Title || 'Не выбрано', 
                                hasValue: !!selectedTemplate,
                                icon: '🏷️' 
                            },
                            { 
                                label: 'Описание', 
                                value: selectedTemplate?.Description || 'Не выбрано', 
                                hasValue: !!selectedTemplate,
                                icon: '📝',
                                fullWidth: true 
                            },
                            { 
                                label: 'Макс. участников', 
                                value: selectedTemplate ? `${selectedTemplate.MaxParticipants} чел.` : 'Не выбрано', 
                                hasValue: !!selectedTemplate,
                                icon: '👥' 
                            },
                            { 
                                label: 'Продолжительность', 
                                value: selectedTemplate ? `${selectedTemplate.Duration} мин.` : 'Не выбрано', 
                                hasValue: !!selectedTemplate,
                                icon: '⏱️' 
                            },
                            {
                                label: 'Дата',
                                value: dateTime && dayjs(dateTime).isValid() 
                                    ? dayjs(dateTime).format('DD.MM.YYYY HH:mm') 
                                    : 'Не указана',
                                hasValue: !!dateTime && dayjs(dateTime).isValid(),
                                icon: '📅',
                            },
                            { 
                                label: 'Цена', 
                                value: price != null && !isNaN(price) ? `${price} руб.` : 'Не указана', 
                                hasValue: price != null && !isNaN(price),
                                icon: '💰' 
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
        </LocalizationProvider>
    );
};

export default TrainingAdd;