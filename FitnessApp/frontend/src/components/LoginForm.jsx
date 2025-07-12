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
  CircularProgress
} from '@mui/material';
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useForm } from 'react-hook-form';
import { Context } from '../index';
import { observer } from 'mobx-react-lite';
import { NavLink } from 'react-router-dom';

const LoginForm = observer(() => {
    const { store } = useContext(Context);
    const [serverErrors, setServerErrors] = useState({});
    const [generalError, setGeneralError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { 
        register, 
        handleSubmit, 
        setError,
        formState: { errors } 
    } = useForm();
    const navigate = useNavigate();

    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    const orangeColor = '#e37243';
    const orangeHover = '#db5c35';

    const textFieldStyles = {
        '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: '#e0e0e0' },
            '&:hover fieldset': { borderColor: orangeColor },
            '&.Mui-focused fieldset': { borderColor: orangeColor },
        },
        '& .MuiInputLabel-root.Mui-focused': { color: orangeColor },
        mb: 1
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        setGeneralError(null);
        setServerErrors({});
        
        try {
            const error = await store.login(data.Email, data.Password);
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
                    setGeneralError(error.response?.data?.message || "Ошибка авторизации");
                }
            } else {
                switch(store.user.Role) {
                    case 2:
                        navigate('/admin/quickNav');
                        break;
                    case 1:
                        navigate('/profile');
                        break;
                    case 0:
                        navigate('/trainer/quickNav');
                        break;
                    default:
                        navigate('/');
                }
            }
        } catch (error) {
            setGeneralError("Произошла ошибка при авторизации");
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="sm" sx={{height: '70vh'}}>
            <Paper
                elevation={3}
                sx={{
                    mt: 8,
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
                    <LockOutlinedIcon fontSize="medium" />
                </Avatar>
                
                <Typography component="h1" variant="h5" sx={{ 
                    color: '#2E2E2E',
                    fontWeight: 600,
                    mb: 1.5
                }}>
                    Вход в приложение
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
                    <TextField
                        fullWidth
                        label="Email"
                        variant="outlined"
                        {...register('Email', {
                            required: 'Введите email',
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'Введите корректный email'
                            }
                        })}
                        error={Boolean(errors.Email)}
                        helperText={errors.Email?.message || " "}
                        margin="normal"
                        sx={textFieldStyles}
                    />

                    <TextField
                        fullWidth
                        label="Пароль"
                        type="password"
                        variant="outlined"
                        {...register('Password', {
                            required: 'Введите пароль',
                        })}
                        error={Boolean(errors.Password)}
                        helperText={errors.Password?.message || " "}
                        margin="normal"
                        sx={textFieldStyles}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={isLoading}
                        sx={{
                            mt: 1.5,
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
                            'Войти'
                        )}
                    </Button>

                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        mt: 1.5
                    }}>
                        <Typography variant="body2" sx={{ color: '#555' }}>
                            Нет аккаунта?{' '}
                            <NavLink 
                                to="/signup" 
                                style={{ 
                                    color: orangeColor,
                                    textDecoration: 'none',
                                    '&:hover': {
                                        textDecoration: 'underline'
                                    }
                                }}
                            >
                                Зарегистрируйтесь
                            </NavLink>
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
});

export default LoginForm;