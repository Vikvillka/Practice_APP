import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Avatar,
  Container,
  Paper,
  CircularProgress,
  Grid,
} from '@mui/material';
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { useForm } from 'react-hook-form';
import { Context } from '../index';
import { observer } from 'mobx-react-lite';
import { NavLink } from 'react-router-dom';

const SignUp = observer(() => {
    const { store } = useContext(Context);
    const [serverErrors, setServerErrors] = useState({});
    const [generalError, setGeneralError] = useState(null);

    // const [isError, setIsError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit,setError, formState: { errors }, watch } = useForm({
      mode: 'onChange'
    });

    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    const navigate = useNavigate();
    const orangeColor = '#e37243';
    const orangeHover = '#db5c35';
    const password = watch("Password");

    const onSubmit = async (data) => {
        setIsLoading(true);
        setGeneralError(null);
        setServerErrors({});
         try {
            const error = await store.registration({
                email: data.Email,
                password: data.Password,
                firstName: data.FirstName,
                lastName: data.LastName
            });

            if (error) {
                if (error.response?.status === 400 && error.response.data?.errors) {
                    const validationErrors = error.response.data.errors;
                    Object.keys(validationErrors).forEach(field => {
                        setError(field, {
                            type: 'server',
                            message: validationErrors[field][0]
                        });
                    });
                } else {
                    setGeneralError(error.response?.data?.message || "Ошибка регистрации");
                }
            } else {
                navigate('/profile');
            }
        } catch (error) {
            setGeneralError("Произошла ошибка при регистрации");
            console.error('Registration error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="sm">
            <Paper
                elevation={3}
                sx={{
                    mt: 6,
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderRadius: 2,
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                    background: 'linear-gradient(145deg, #f5f5f5, #ffffff)'
                }}
            >
                <Avatar sx={{ 
                    m: 1, 
                    bgcolor: orangeColor,
                    width: 56,
                    height: 56
                }}>
                    <PersonOutlineIcon fontSize="medium" />
                </Avatar>
                
                <Typography component="h1" variant="h5" sx={{ 
                    color: '#2E2E2E',
                    fontWeight: 600,
                    mb: 1.5
                }}>
                    Регистрация
                </Typography>

                {generalError && (
                    <Alert severity="error" sx={{ width: '100%', mb: 1.5 }}>
                        {generalError}
                    </Alert>
                )}

                <Box 
                    component="form" 
                    onSubmit={handleSubmit(onSubmit)} 
                    sx={{ width: '100%' }}
                    noValidate
                >
                    <Grid container spacing={1.5}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Фамилия"
                                variant="outlined"
                                {...register('LastName', {
                                    required: 'Введите фамилию',
                                    minLength: {
                                        value: 2,
                                        message: 'Минимум 2 символа',
                                    },
                                    maxLength: {
                                        value: 25,
                                        message: 'Максимум 25 символов',
                                    },
                                    pattern: {
                                        value: /^[A-Za-zА-Яа-яЁё]+$/,
                                        message: "Только буквы"
                                    }
                                })}
                                error={Boolean(errors.LastName)}
                                helperText={errors.LastName?.message || " "}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: '#e0e0e0',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: orangeColor,
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: orangeColor,
                                        },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: orangeColor,
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Имя"
                                variant="outlined"
                                {...register('FirstName', {
                                    required: 'Введите имя',
                                    minLength: {
                                        value: 2,
                                        message: 'Минимум 2 символа',
                                    },
                                    maxLength: {
                                        value: 25,
                                        message: 'Максимум 25 символов',
                                    },
                                    pattern: {
                                        value: /^[A-Za-zА-Яа-яЁё]+$/,
                                        message: "Только буквы"
                                    }
                                })}
                                error={Boolean(errors.FirstName)}
                                helperText={errors.FirstName?.message || " "}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: '#e0e0e0',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: orangeColor,
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: orangeColor,
                                        },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: orangeColor,
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Email"
                                variant="outlined"
                                {...register('Email', {
                                    required: 'Введите email',
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: 'Введите корректный email'
                                    },
                                })}
                                error={Boolean(errors.Email)}
                                helperText={errors.Email?.message || " "}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: '#e0e0e0',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: orangeColor,
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: orangeColor,
                                        },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: orangeColor,
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Пароль"
                                type="password"
                                variant="outlined"
                                {...register('Password', {
                                    required: 'Введите пароль',
                                    minLength: {
                                        value: 8,
                                        message: 'Минимум 8 символов'
                                    },
                                })}
                                error={Boolean(errors.Password)}
                                helperText={errors.Password?.message || " "}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: '#e0e0e0',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: orangeColor,
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: orangeColor,
                                        },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: orangeColor,
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Повторите пароль"
                                type="password"
                                variant="outlined"
                                {...register('confirmPassword', {
                                    required: 'Повторите пароль',
                                    validate: value => 
                                      value === password || 'Пароли не совпадают'
                                })}
                                error={Boolean(errors.confirmPassword)}
                                helperText={errors.confirmPassword?.message || " "}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: '#e0e0e0',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: orangeColor,
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: orangeColor,
                                        },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: orangeColor,
                                    },
                                }}
                            />
                        </Grid>
                    </Grid>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={isLoading}
                        sx={{
                            mt: 2,
                            mb: 1.5,
                            height: 45,
                            bgcolor: orangeColor,
                            color: 'white',
                            fontSize: '0.95rem',
                            '&:hover': {
                                bgcolor: orangeHover
                            },
                            '&:disabled': {
                                bgcolor: '#f5f5f5',
                                color: '#bdbdbd'
                            }
                        }}
                    >
                        {isLoading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Зарегистрироваться'
                        )}
                    </Button>

                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        mt: 1.5
                    }}>
                        <Typography variant="body2" sx={{ color: '#555' }}>
                            Уже есть аккаунт?{' '}
                            <NavLink 
                                to="/signin" 
                                style={{ 
                                    color: orangeColor,
                                    textDecoration: 'none',
                                    '&:hover': {
                                        textDecoration: 'underline'
                                    }
                                }}
                            >
                                Войдите
                            </NavLink>
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
});

export default SignUp;