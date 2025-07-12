import React, { useState, useContext } from 'react';
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
import InfoIcon from '@mui/icons-material/Info';
import { trainingAPI } from '../../../services/TrainingService';
import { templateAPI } from '../../../services/TemplateService';
import { Context } from '../../../index';
import EmptyState from '../EmptyState';
import { NavLink } from 'react-router-dom';

const TemplateManager = () => {  
    const orangeColor = '#e37243';
    const orangeHover = '#db5c35';
    
    const { store } = useContext(Context);
    const userId = store.user.UserId;
    const { data: templates = [], error, isLoading, refetch } = templateAPI.useFetchTemplateForTrainerByIDQuery(userId);
    const { data: trainingsAll = [] } = trainingAPI.useFetchAllTrainingsQuery();
    const [deleteTemplate, { isLoading: isDeleting }] = templateAPI.useDeleteTemplateMutation();
    const [isError, setIsError] = useState(null);
    const [infoMessage, setInfoMessage] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState(null);

    const isTemplateUsed = (templateId) => {
        return trainingsAll.some(training => training.TemplateId === templateId &&  training.Status === 'active');
    };
 
    const handleDeleteClick = (templateId) => {
        if (isTemplateUsed(templateId)) {
            setInfoMessage('Этот шаблон используется в тренировках и не может быть удален');
            setTimeout(() => setInfoMessage(null), 3000);
            return;
        }
        setTemplateToDelete(templateId);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await deleteTemplate(templateToDelete).unwrap();
            refetch();
        } catch (error) {
            setIsError(error.data?.message || "Ошибка при удалении шаблона");
        } finally {
            setDeleteConfirmOpen(false);
        }
    };

    if (isLoading) {
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
    
    if (error) {
        return (
            <Box sx={{ width: '90%', margin: 'auto', paddingTop: '30px', height: '70vh', }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    Ошибка загрузки шаблонов: {error.message}
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '90%', margin: 'auto', p: 3 }}>
            <Typography variant="h4" color="#2E2E2E" sx={{ mb: 3 }}>
                Мои шаблоны тренировок
            </Typography>
            
            {isError && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setIsError(null)}>
                    {isError}
                </Alert>
            )}

            {infoMessage && (
                <Alert severity="info" sx={{ mb: 3 }} onClose={() => setInfoMessage(null)}>
                    {infoMessage}
                </Alert>
            )}

            {templates.length === 0 ? (
                <EmptyState 
                    message="У вас пока нет созданных шаблонов"
                    actionText="Создать первый шаблон"
                    actionLink="/trainer/template/create"
                    sx={{ mt: 4 }}
                />
            ) : (
                <Grid container spacing={3}>
                    {templates.map((template) => {
                        const isUsed = isTemplateUsed(template.TemplateId);
                        
                        return (
                            <Grid item xs={12} md={6} lg={4} key={template.TemplateId}>
                                <Card sx={{ 
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: isUsed ? 'none' : 'translateY(-5px)',
                                        boxShadow: isUsed ? 1 : 3
                                    },
                                    opacity: isUsed ? 0.8 : 1
                                }}>
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            mb: 1
                                        }}>
                                            <Typography variant="h6" component="h3">
                                                {template.Title}
                                            </Typography>
                                            <Box display="flex" alignItems="center">
                                                <Chip 
                                                    label={`ID: ${template.TemplateId}`} 
                                                    size="small" 
                                                    variant="outlined"
                                                    sx={{ 
                                                        borderColor: orangeColor,
                                                        color: orangeColor,
                                                        backgroundColor: 'transparent',
                                                        mr: 1
                                                    }}
                                                />
                                                {isUsed && (
                                                    <Tooltip title="Используется в тренировках">
                                                        <InfoIcon  color='warning' fontSize="small" />
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        </Box>
                                        
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {template.Description || 'Описание отсутствует'}
                                        </Typography>
                                        
                                        <Divider sx={{ my: 2 }} />
                                        
                                        <Box sx={{ 
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(2, 1fr)',
                                            gap: 2
                                        }}>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Длительность
                                                </Typography>
                                                <Typography variant="body2">
                                                    {template.Duration} мин
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Участники
                                                </Typography>
                                                <Typography variant="body2">
                                                    {template.MaxParticipants} чел
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                    
                                    <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
                                        <Tooltip 
                                            title={isUsed ? 
                                                "Шаблон используется в тренировках и не может быть удален" : 
                                                "Удалить шаблон"}
                                        >
                                            <span>
                                                <IconButton
                                                    color={isUsed ? "default" : "error"}
                                                    onClick={() => handleDeleteClick(template.TemplateId)}
                                                    disabled={isDeleting && templateToDelete === template.TemplateId || isUsed}
                                                >
                                                    {isDeleting && templateToDelete === template.TemplateId ? (
                                                        <CircularProgress size={24} />
                                                    ) : (
                                                        <DeleteIcon />
                                                    )}
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    
                                    </CardActions>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            <Dialog
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Подтверждение удаления шаблона
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Вы точно уверены, что хотите удалить этот шаблон?
                        <br />
                        <strong>Вернуть удаленный шаблон не будет возможности!</strong>
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

export default TemplateManager;