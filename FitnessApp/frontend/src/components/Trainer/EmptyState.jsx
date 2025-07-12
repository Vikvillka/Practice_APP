// components/Common/EmptyState.jsx
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const EmptyState = ({ message, actionText, actionLink }) => {
    return (
        <Box 
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '300px',
                textAlign: 'center',
                p: 3,
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 1
            }}
        >
            <Typography variant="h6" color="text.secondary" gutterBottom>
                {message}
            </Typography>
            {actionText && actionLink && (
                <Button 
                    component={Link}
                    to={actionLink}
                    variant="contained"
                    sx={{ 
                        bgcolor: '#e37243',
                        '&:hover': { bgcolor: '#db5c35' },
                        height: '45px',
                        mt: '20px',
                        fontSize: '0.95rem'
                    }}
                >
                    {actionText}
                </Button>
            )}
        </Box>
    );
};

export default EmptyState;