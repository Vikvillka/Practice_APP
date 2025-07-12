import React, { useContext } from 'react';
import { Context } from "../index";
import { NavLink } from 'react-router-dom';
import TrainerNavigate from './TrainerNavigate';
import AdminNavigate from './AdminNavigate';
import DefaultNavigate from './DefaultNavigate';
import Tooltip from '@mui/material/Tooltip';
import './styles/header.css';
import PersonIcon from '@mui/icons-material/PersonTwoTone';
import ExitIcon from '@mui/icons-material/ExitToApp';

const Header = () => {
    const { store } = useContext(Context);

    const handleLogout = () => {
        store.logout();
    };

    const StyledNavLink = (props) => (
        <NavLink {...props} style={{ textDecoration: 'none', color: 'white', fontWeight: 'inherit' }} />
    );

    return (
        <header className='header'>
            {(store.user.Role === 1 || !store.isAuth) && (
                <NavLink to="/" style={{ textDecoration: 'none' }}>
                    <h2 style={{ color: 'white', margin: 0 }}>YourFit</h2>
                </NavLink>
            )}
            {( store.user.Role === 2) && (
                <NavLink to={`/admin/quickNav`} style={{ textDecoration: 'none' }}>
                    <h2 style={{ color: 'white', margin: 0 }}>YourFit</h2>
                </NavLink>
            )}
            {(store.user.Role === 0 ) && (
                <NavLink to={`/trainer/quickNav`} style={{ textDecoration: 'none' }}>
                    <h2 style={{ color: 'white', margin: 0 }}>YourFit</h2>
                </NavLink>
            )}
            <div className='header-container'>
                <div className='nav-container'>
                    {store.user.Role === 2 && <AdminNavigate /> }
                    {store.user.Role === 0 && <TrainerNavigate />}
                    {store.user.Role === 1 && <DefaultNavigate />}
                </div>
                <div className='login-logout-container' style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {store.isAuth ? (
                        <>
                        {store.user.Role === 2 && 
                            <Tooltip title="Быстрая навигация" arrow>
                                 <StyledNavLink to="admin/quickNav">
                                     <PersonIcon sx={{ 
                                         color: 'white', 
                                         fontSize: 25,
                                         ml: '15px',
                                         '&:hover': {
                                             color: '#e37243'
                                         }
                                     }} />
                                 </StyledNavLink>
                             </Tooltip>
                            }
                         {store.user.Role === 1 && 
                            <Tooltip title="Профиль" arrow>
                                 <StyledNavLink to="/profile">
                                     <PersonIcon sx={{ 
                                         color: 'white', 
                                         fontSize: 25,
                                         ml: '15px',
                                         '&:hover': {
                                             color: '#e37243'
                                         }
                                     }} />
                                 </StyledNavLink>
                             </Tooltip>
                            }
                            {store.user.Role === 0 && 
                            <Tooltip title="Быстрая навигация" arrow>
                                 <StyledNavLink to="trainer/quickNav">
                                     <PersonIcon sx={{ 
                                         color: 'white', 
                                         fontSize: 25,
                                         ml: '15px',
                                         '&:hover': {
                                             color: '#e37243'
                                         }
                                     }} />
                                 </StyledNavLink>
                             </Tooltip>
                            }
                             <Tooltip title="Выйти" arrow>
                                <StyledNavLink to="/" onClick={handleLogout}>
                                    <ExitIcon sx={{ 
                                        color: 'gray', 
                                        fontSize: 25,
                                        '&:hover': {
                                            color: '#e37243'
                                        }
                                    }} />
                                </StyledNavLink>
                            </Tooltip>
                        </>
                    ) : (
                        <>
                            <DefaultNavigate  />
                            <NavLink
                                to="/signin"
                                style={{
                                    color: 'white',
                                    textDecoration: 'none',
                                    fontWeight: 'inherit',
                                }}
                            >
                                Войти
                            </NavLink>
                            <NavLink
                                to="/signup"
                                style={{
                                    color: 'white',
                                    textDecoration: 'none',
                                    fontWeight: 'inherit',
                                }}
                            >
                                Регистрация
                            </NavLink>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;