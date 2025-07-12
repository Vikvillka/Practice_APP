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
  DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PhoneIcon from '@mui/icons-material/Phone';
import { centerAPI } from '../../../services/CenterService';
import { NavLink } from 'react-router-dom';
import EmptyState from '../../Trainer/EmptyState';

const CenterManager = () => {
    const orangeColor = '#e37243';
    const orangeHover = '#db5c35';
    
    const { data: centers = [], error, isLoading, refetch } = centerAPI.useFetchAllCentersQuery();
    const [deleteCenter] = centerAPI.useDeleteCenterMutation();
    const [isError, setIsError] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [centerToDelete, setCenterToDelete] = useState(null);

    const handleDeleteClick = (centerId) => {
        setCenterToDelete(centerId);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            await deleteCenter(centerToDelete).unwrap();
            refetch();
        } catch (error) {
            setIsError(error.data?.message || "Ошибка при удалении центра");
        } finally {
            setIsDeleting(false);
            setDeleteConfirmOpen(false);
        }
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
                <CircularProgress size={60} sx={{ color: '#e37243' }}/>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ width: '90%', margin: 'auto',  height: '70vh', paddingTop: '30px' }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    Ошибка загрузки центров. {error.message}
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '90%', margin: 'auto', p: 3 }}>
            <Typography variant="h4" color="#2E2E2E" sx={{ mb: 3 }}>
                Управление центрами
            </Typography>
            
            {isError && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setIsError(null)}>
                    {isError}
                </Alert>
            )}

            {centers.length === 0 ? (
                <EmptyState 
                    message="У вас пока нет созданных центров"
                    actionText="Создать первый центр"
                    actionLink="/admin/center/create"
                    sx={{ mt: 4 }}
                />
            ) : (
                <Grid container spacing={3}>
                    {centers.map((center) => (
                        <Grid item xs={12} md={6} lg={4} key={center.CenterId}>
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
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        mb: 1
                                    }}>
                                        <Typography variant="h6" component="h3">
                                            {center.CenterName}
                                        </Typography>
                                        <Chip 
                                            label={`ID: ${center.CenterId}`}
                                            size="small"
                                            variant="outlined"
                                            sx={{ 
                                                borderColor: orangeColor,
                                                color: orangeColor,
                                                backgroundColor: 'transparent'
                                            }}
                                        />
                                    </Box>
                                    
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {center.City}, {center.Address}
                                    </Typography>
                                    
                                    <Divider sx={{ my: 2 }} />
                                    
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <PhoneIcon color="action" sx={{ mr: 1 }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {center.Phone}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                                
                                <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
                                    <Tooltip title="Удалить центр">
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDeleteClick(center.CenterId)}
                                            disabled={isDeleting}
                                        >
                                            {isDeleting && centerToDelete === center.CenterId ? (
                                                <CircularProgress size={24} />
                                            ) : (
                                                <DeleteIcon />
                                            )}
                                        </IconButton>
                                    </Tooltip>
                                    
                                    <NavLink to={`/admin/center/update/${center.CenterId}`}>
                                        <Tooltip title="Изменить центр">
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
            )}

            <Dialog
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Подтверждение удаления центра
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Вы точно уверены, что хотите удалить этот центр?
                        <br />
                        <strong>Все связанные данные (тренеры, тренировки, абонементы) также будут удалены!</strong>
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

export default CenterManager;