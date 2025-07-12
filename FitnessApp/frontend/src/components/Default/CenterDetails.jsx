import { React} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { centerAPI } from '../../services/CenterService';
import CenterLocationMap from '../../components/Default/CenterLocationMap';
import '../styles/centerDetails.css';

const CenterDetails = () => {
    const { centerName } = useParams();
    const { data: centers, error: centersError, isLoading: centersLoading } = centerAPI.useFetchAllCentersQuery();
    const decodedCenterName = decodeURIComponent(centerName.replace(/-/g, ' '));
    const navigate = useNavigate();

    const handleClick = (centerName) => {
      navigate(`/centers/${centerName}/schedule`); 
    };

    const center=centers?.find(c=>c.CenterName.toLowerCase().replace(/\s+/g,'')===decodedCenterName.toLowerCase().replace(/\s+/g,''));
    const { error: centerError, isLoading: centerLoading } =
        centerAPI.useFetchCenterByIDQuery(center?.CenterId, {
            skip: !center,
    });

    if (centersLoading || centerLoading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '300px',
                width: '80%', 
                margin: 'auto', 
                paddingTop: '30px' 
            }}>
                <CircularProgress size={60} sx={{ color: '#e37243' }} />
            </Box>
        );
    }

    if (centersError || centerError) {
        return (
            <Box sx={{ width: '80%', margin: 'auto', paddingTop: '30px' }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    Ошибка загрузки центра. {centersError?.message || centerError?.message}
                </Alert>
            </Box>
        );
    }

    if (!center) return <div>Центр с названием "{decodedCenterName}" не найден.</div>;

    return (
        <>
            <div className='test'>
                <div className="parallax">
                    <div className="contact-section">
                        <Box sx={{p: '120px 0px 10px 10%'}}>
                        <Typography variant="h4" color={'#E2E2E2'} sx={{ marginBottom: '0px' }}>{center.CenterName}</Typography>
                        <p>Наша концепция — FITNESS&FUN, спорт в удовольствие! Для вас — групповые и индивидуальные программы, дружеская атмосфера, современное оборудование и просторные залы. Выбирайте комфортный для себя режим тренировок и двигайтесь к намеченной цели, а мы сделаем всё для того, чтобы ваши занятия были эффективными и приносили радость.</p>
                        <div className='buttons-container'>
                            <Button
                              variant="contained"
                              sx={{ backgroundColor: '#e37243', color: 'white', '&:hover': { backgroundColor: '#DF8A51' } }}
                              onClick={() => handleClick(center.CenterName)} 
                            >
                              Расписание
                            </Button>
                        </div>
                        </Box>
                    </div>
                </div>
            </div>
            
            <Box sx={{ width: '80%', margin: 'auto', paddingTop: '0px', mb: 6}}>
                <Typography variant="h4" color={'#2E2E2E'} sx={{ marginBottom: '20px' }}>Контактная информация</Typography>
                <div className="contact-details-container">
                    <div className="contact-block">
                      <Typography variant="h5" component="h2" color={'#2E2E2E'} >Адрес</Typography>
                      <p>{center.Address}</p>
                    </div>

                    <div className="contact-block">
                      <Typography variant="h5" component="h2" color={'#2E2E2E'} >Режим работы</Typography>
                      <div className="schedule">
                        <div>
                          <p>Ежедневно</p>
                          <p fontWeight="bold">08:00 — 23:00</p>
                        </div>

                      </div>
                    </div>

                    <div className="contact-block">
                      <Typography variant="h5" component="h2" color={'#2E2E2E'} >Контакты</Typography>
                      <p>{center.Phone}</p>
                    </div>
                </div>
                <Grid item xs={12} md={6}>
            {center?.Latitude && center?.Longitude && (
                <Grid item xs={12} md={6}>
                    <Typography variant="h5" component="h2" color={'#2E2E2E'} sx={{ mb: 2, mt: 2 }}>
                        Расположение на карте
                    </Typography>
                    <CenterLocationMap center={center} height="400px" />
                </Grid>
            )}
            </Grid>
            </Box>
        </> 
    );
};

export default CenterDetails;