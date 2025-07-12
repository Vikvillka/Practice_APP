import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Button, 
  Card, 
  CardContent, 
  CardActions, 
  Alert, 
  Chip,
  Grid,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Avatar,
  Stack,
  TextField,
  InputAdornment,
  Pagination
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { trainerAPI } from '../../../services/TrainerService';
import { NavLink } from 'react-router-dom';
import EmptyState from '../../Trainer/EmptyState';

const TrainerManager = () => {
    const orangeColor = '#e37243';
    const orangeHover = '#db5c35';
    
    const { data: trainers = [], error, isLoading, refetch } = trainerAPI.useFetchAllTrainersQuery();
    const [deleteTrainer] = trainerAPI.useDeleteTrainerMutation();
    const [isError, setIsError] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [trainerToDelete, setTrainerToDelete] = useState(null);
    
    // Состояния для поиска и пагинации
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const trainersPerPage = 9;

    // Фильтрация тренеров по поисковому запросу
    const filteredTrainers = trainers.filter(trainer => {
        const fullName = `${trainer.User.FirstName} ${trainer.User.LastName}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
    });

    // Пагинация
    const totalPages = Math.ceil(filteredTrainers.length / trainersPerPage);
    const paginatedTrainers = filteredTrainers.slice(
        (page - 1) * trainersPerPage,
        page * trainersPerPage
    );

    const handleDeleteClick = (trainerId) => {
        setTrainerToDelete(trainerId);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            await deleteTrainer(trainerToDelete).unwrap();
            refetch();
        } catch (error) {
            setIsError(error.data?.message || "Ошибка при удалении тренера");
        } finally {
            setIsDeleting(false);
            setDeleteConfirmOpen(false);
        }
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

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
                <CircularProgress size={60} sx={{ color: orangeColor }}/>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ width: '90%', margin: 'auto',  height: '70vh', paddingTop: '30px' }}>
                <Alert severity="error" sx={{ mb: 3 }} >
                    Ошибка загрузки тренеров. {error.message}
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '90%', margin: 'auto', p: 3 }}>
            <Typography variant="h4" color="#2E2E2E" sx={{ mb: 3 }}>
                Управление тренерами
            </Typography>
            
            {/* Панель поиска */}
            <Box sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    placeholder="Поиск по имени или фамилии тренера..."
                    variant="outlined"
                    size="small"
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPage(1); 
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '& fieldset': {
                                borderColor: '#ddd',
                            },
                            '&:hover fieldset': {
                                borderColor: orangeColor,
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: orangeColor,
                                borderWidth: 1,
                            },
                        },
                        maxWidth: 500
                    }}
                />
            </Box>

            {isError && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setIsError(null)}>
                    {isError}
                </Alert>
            )}

            {filteredTrainers.length === 0 ? (
                <EmptyState 
                    message={searchQuery ? "Тренеры по вашему запросу не найдены" : "У вас пока нет зарегистрированных тренеров"}
                    actionText="Добавить тренера"
                    actionLink="/admin/trainer/create"
                    sx={{ mt: 4 }}
                />
            ) : (
                <>
                    <Grid container spacing={3}>
                        {paginatedTrainers.map((trainer) => (
                            <Grid item xs={12} sm={6} md={4} key={trainer.TrainerId}>
                                <Card sx={{ 
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: 3
                                    }
                                }}>
                                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                        <Stack direction="row" spacing={3} alignItems="center">
                                            {trainer.Img ? (
                                                <Avatar
                                                    src={`https://localhost:7066/api/trainer/${trainer.TrainerId}/image`}
                                                    alt={`${trainer.User.FirstName} ${trainer.User.LastName}`}
                                                    sx={{ 
                                                        width: 100, 
                                                        height: 100,
                                                        border: `3px solid ${orangeColor}`
                                                    }}
                                                />
                                            ) : (
                                                <Avatar 
                                                    sx={{ 
                                                        width: 100, 
                                                        height: 100,
                                                        bgcolor: orangeColor,
                                                        fontSize: '2.5rem',
                                                        border: `3px solid ${orangeColor}`
                                                    }}
                                                >
                                                    {trainer.User.FirstName[0]}{trainer.User.LastName[0]}
                                                </Avatar>
                                            )}
                                            
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                                                    {trainer.User.FirstName} {trainer.User.LastName}
                                                </Typography>
                                                <Chip 
                                                    label={trainer.Specialization}
                                                    size="small"
                                                    sx={{ 
                                                        bgcolor: orangeColor,
                                                        color: 'white',
                                                        mt: 0.5,
                                                        mb: 1
                                                    }}
                                                />
                                                <Typography variant="body2" color="text.secondary">
                                                    Опыт: {trainer.ExperienceYears} лет
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        <Divider sx={{ my: 2 }} />
                                        
                                        <Box>
                                            <Typography variant="body2" sx={{ mb: 1 }}>
                                                <strong>Email:</strong> {trainer.User.Email}
                                            </Typography>
                                            {trainer.Center && (
                                                <Typography variant="body2" sx={{ mb: 1 }}>
                                                    <strong>Центр:</strong> {trainer.Center.CenterName}
                                                </Typography>
                                            )}
                                            <Typography variant="body2" sx={{
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                <strong>Описание:</strong> {trainer.Description}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                    
                                    <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                                        <Tooltip title="Удалить тренера">
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDeleteClick(trainer.TrainerId)}
                                                disabled={isDeleting}
                                            >
                                                {isDeleting && trainerToDelete === trainer.TrainerId ? (
                                                    <CircularProgress size={24} />
                                                ) : (
                                                    <DeleteIcon />
                                                )}
                                            </IconButton>
                                        </Tooltip>
                                        
                                        <NavLink to={`/admin/trainer/update/${trainer.TrainerId}`}>
                                            <Tooltip title="Изменить тренера">
                                                <IconButton
                                                    color="primary"
                                                    sx={{ color: orangeColor }}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </NavLink>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Пагинация */}
                    {totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                                sx={{
                                    '& .MuiPaginationItem-root': {
                                        color: '#2E2E2E',
                                        '&.Mui-selected': {
                                            backgroundColor: orangeColor,
                                            color: 'white',
                                            '&:hover': {
                                                backgroundColor: orangeHover
                                            }
                                        }
                                    }
                                }}
                            />
                        </Box>
                    )}
                </>
            )}

            <Dialog
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Подтверждение удаления тренера
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Вы точно уверены, что хотите удалить этого тренера?
                        <br />
                        <strong>Все связанные данные (тренировки) также будут удалены!</strong>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setDeleteConfirmOpen(false)}
                        sx={{ color: '#2E2E2E' }}
                    >
                        Отмена
                    </Button>
                    <Button 
                        onClick={handleDeleteConfirm}
                        color="error"
                        autoFocus
                        disabled={isDeleting}
                        sx={{
                            bgcolor: orangeColor,
                            color: 'white',
                            '&:hover': {
                                bgcolor: orangeHover
                            }
                        }}
                    >
                        {isDeleting ? <CircularProgress size={24} color="inherit" /> : 'Удалить'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TrainerManager;