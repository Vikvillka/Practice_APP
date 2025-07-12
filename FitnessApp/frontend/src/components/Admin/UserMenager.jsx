import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Card, 
  CardContent, 
  TextField,
  InputAdornment,
  Avatar,
  Chip,
  Divider,
  Alert,
  Pagination,
  Stack,
  CircularProgress
} from '@mui/material';
import { 
    searchInputStyles
  } from '../styles/themeStyles';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import { userAPI } from '../../services/UserService';

const UserManager = () => {
    const orangeColor = '#e37243';
    const orangeHover = '#db5c35';
    
    const { data: usersData, error, isLoading } = userAPI.useFetchAllUsersQuery();
    const [selectedRole, setSelectedRole] = useState('Все');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const usersPerPage = 20;

    const filteredUsers = usersData ? usersData.filter(user => {
        const matchesRole = selectedRole === 'Все' || user.Role === selectedRole;
        const matchesSearch = searchQuery === '' || 
            user.Email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            `${user.FirstName} ${user.LastName}`.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesRole && matchesSearch;
    }) : [];

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const paginatedUsers = filteredUsers.slice(
        (page - 1) * usersPerPage,
        page * usersPerPage
    );

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
                <CircularProgress size={60} sx={{ color: '#e37243' }}/>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ width: '90%', margin: 'auto',  height: '70vh', paddingTop: '30px' }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    Ошибка загрузки пользователей. {error.message}
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '90%', margin: 'auto', p: 3 }}>
            <Typography variant="h4" color="#2E2E2E" sx={{ mb: 3 }}>
                Пользователи
            </Typography>

            <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap',
                gap: 2, 
                mb: 3,
                alignItems: 'center'
            }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {['Все', 0, 1].map((role) => (
                        <Button 
                            key={role} 
                            variant={selectedRole === role ? 'contained' : 'outlined'}
                            onClick={() => {
                                setSelectedRole(role);
                                setPage(1); 
                            }}
                            sx={{
                                bgcolor: selectedRole === role ? orangeColor : 'transparent',
                                color: selectedRole === role ? 'white' : '#2E2E2E',
                                borderColor: orangeColor,
                                '&:hover': {
                                    bgcolor: selectedRole === role ? orangeHover : 'rgba(227, 114, 67, 0.1)',
                                    borderColor: orangeHover
                                }
                            }}
                        >
                            {role === 1 ? 'Клиенты' : role === 0 ? 'Тренеры' : 'Все'}
                        </Button>
                    ))}
                </Box>

                <TextField
                  placeholder="Поиск по email или фамилии..."
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
                  sx={searchInputStyles}
                />
            </Box>

            {paginatedUsers.length > 0 ? (
                <Box>
                    <Box sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' },
                        gap: 2,
                        mb: 3
                    }}>
                        {paginatedUsers.map((user) => (
                            <Card 
                                key={user.UserId} 
                                sx={{ 
                                    borderRadius: 2,
                                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: 3
                                    }
                                }}
                            >
                                <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar sx={{ bgcolor: orangeColor, mr: 2 }}>
                                      <PersonIcon />
                                    </Avatar>
                                    <Box>
                                      <Typography variant="h6" component="div">
                                        {user.FirstName} {user.LastName}
                                      </Typography>
                                      <Chip 
                                        label={user.Role === 0 ? 'Тренер' : user.Role === 1 ? 'Клиент' : 'Админ'} 
                                        size="small" 
                                        sx={{ 
                                          bgcolor: user.Role === 0 ? '#e8f5e9' : '#fcdec5',
                                          color: user.Role === 0 ? '#2e7d32' : '#d67320',
                                          mt: 0.5
                                        }}
                                      />
                                    </Box>
                                  </Box>
                                  <Chip 
                                    label={`ID: ${user.UserId}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ 
                                      borderColor: orangeColor,
                                      color: orangeColor,
                                      backgroundColor: 'transparent'
                                    }}
                                  />
                                </Box>
                                    <Divider sx={{ my: 2 }} />

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <EmailIcon color="action" sx={{ mr: 1 }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {user.Email}
                                            </Typography>
                                        </Box>

                                        {user.Phone && (
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <PhoneIcon color="action" sx={{ mr: 1 }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    {user.Phone}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>

                    <Stack spacing={2} sx={{ mt: 3, alignItems: 'center' }}>
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
                        <Typography variant="body2" color="text.secondary">
                            Показано {paginatedUsers.length} из {filteredUsers.length} пользователей
                        </Typography>
                    </Stack>
                </Box>
            ) : (
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '200px',
                    textAlign: 'center'
                }}>
                    <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
                        Пользователи не найдены
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Попробуйте изменить параметры поиска или фильтры
                    </Typography>
                </Box>
            )}
        </Box>
    );
}

export default UserManager;