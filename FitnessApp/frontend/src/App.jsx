import React, { useContext, useEffect, useState  } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Context } from './index';
import './App.css';
import {Box, CircularProgress} from '@mui/material';
import LoginForm from './components/LoginForm';
import SignUpForm from './components/SignUpForm';
import Profile from './components/Profile';
import UserManager from './components/Admin/UserMenager';
import CenterAdd from './components/Admin/AdminCenter/CenterAdd';
import CenterUpdate from './components/Admin/AdminCenter/CenterUpdate';
import CenterManager from './components/Admin/AdminCenter/CenterManager';
import TrainerAdd from './components/Admin/AdminTrainer/TrainerAdd';
import TrainerManager from './components/Admin/AdminTrainer/TrainerManager';
import TrainerUpdate from './components/Admin/AdminTrainer/TrainerUpdate';
import TrainingAdd from './components/Trainer/TrainerTraining/TrainingAdd';
import TrainingManager from './components/Trainer/TrainerTraining/TrainingManager';
import TemplateAdd from './components/Trainer/TrainerTemplate/TemplateAdd';
import TemplateManager from './components/Trainer/TrainerTemplate/TemplateManager';
import AllCenter from './components/Default/AllCenters';
import CenterDetails from './components/Default/CenterDetails';
import Schedule from './components/Default/Schedule';
import AllTrainers from './components/Default/AllTrainers';
import SelectedSchedule from './components/Default/SelectedSchedule';
import AdminQuickNav from './components/Admin/AdminQuickNav';
import TrainerQuickNav from './components/Trainer/TrainerQuickNav';
import Header from './components/Header';
import Footer from './components/Footer';
import NotFound from './components/NotFound';
import { observer } from 'mobx-react-lite';
import HomePage from './components/HomePage';

function App() {
  const { store } = useContext(Context);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
      const fetch = async () => {
          if (localStorage.getItem('token')) {
              await store.checkAuth();
          }
          setIsAuthChecked(true);
      };
      fetch();
  }, []);

  if (!isAuthChecked) {
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
          <CircularProgress size={60} sx={{ color: '#e37243' }} />
      </Box>
  );
}

  return (

    <Box>
      <Header/>
      <Routes>
          {!store.isAuth && (
            <>
              <Route path='/' element={<HomePage />} />
              <Route path='/signin' element={<LoginForm />} />
              <Route path='/signup' element={<SignUpForm />} />
              <Route path='/shedule' element={<Schedule />} />
              <Route path='/centers' element={<AllCenter />} />
              <Route path='/centers/:centerName' element={<CenterDetails />} />
              <Route path='/centers/:centerName/schedule' element={<SelectedSchedule />} />
              <Route path='/trainers' element={<AllTrainers />} />
            </>
          )}

          {store.isAuth && store.user.Role === 1 && (
            <>
              <Route path='/' element={<HomePage />} />
              <Route path='/profile' element={<Profile />} />
              <Route path='/shedule' element={<Schedule />} />
              <Route path='/centers' element={<AllCenter />} />
              <Route path='/centers/:centerName' element={<CenterDetails />} />
              <Route path='/centers/:centerName/schedule' element={<SelectedSchedule />} />
              <Route path='/trainers' element={<AllTrainers />} />
            </>
          )}
          {(store.user.Role === 2) && <>
            <Route path='/admin/user' element={<UserManager />} />

            <Route path='/admin/center/create' element={<CenterAdd />} />
            <Route path='/admin/center/update/:centerId' element={<CenterUpdate />} />
            <Route path='/admin/center' element={<CenterManager />} />

            <Route path='/admin/trainer/create' element={<TrainerAdd/>} />
            <Route path='/admin/trainer/update/:userID' element={<TrainerUpdate />} />
            <Route path='/admin/trainer' element={<TrainerManager />} />
            
            <Route path='/admin/quickNav' element={<AdminQuickNav />} />
          </>}
          {
            (store.user.Role === 0) && <>
              <Route path='/trainer/template/create' element={<TemplateAdd />} />
              <Route path='/trainer/template/:userID/templates' element={<TemplateManager />} />
          
              <Route path='/trainer/training/create' element={<TrainingAdd />} />
              <Route path='/trainer/training/:userID/trainings' element={<TrainingManager />} />
              
              <Route path='/trainer/quickNav' element={<TrainerQuickNav/>} />
            </>
          }
          <Route path='*' element={<NotFound />} />

      </Routes>
      <Footer/> 
  </Box>
  );
}

export default observer(App);
