import { makeAutoObservable } from "mobx";
import axios from "axios";
import AuthService from "../services/AuthService";
import { API_URL } from "../http";

export default class Store {
    constructor() {
        this.user = {};
        this.isAuth = false;
        this.reserv = null;
        this.telegramCode = null;
        makeAutoObservable(this);
    }

    setAuth(bool) {
        this.isAuth = bool;
    }

    setUser(user) {
        this.user = user;
    }

    setLoading(bool){
        this.isLoading = bool;
    }

    async login(email, password){
        try{
            const response = await AuthService.login(email, password);
            console.log(response);
            localStorage.setItem('token', response.data.accessToken);
            this.setAuth(true);
            this.setUser(response.data.user)
        } 
        catch(e){
            console.log(e.response?.data?.message || 'Вход завершен с ошибкой');
            return e
        }
    }

    async registration(data) {
        try {
            const response = await AuthService.registration(data);
            console.log(response);
            localStorage.setItem('token', response.data.accessToken);
            this.setAuth(true);
            this.setUser(response.data.user);
        }
        catch(e){
            console.log(e.response?.data?.message || 'Регистрация завершена с ошибкой');
            return e
        }
    }

    async logout() {
        try {
            const response = await AuthService.logout();
            console.log(response);
            localStorage.removeItem('token');
            this.setAuth(false);
            this.setUser({});
        }
        catch(e){
            console.log(e.response?.data?.message || 'Выход завершен с ошибкой');
            return e
        }
    }

    async checkAuth(){
        this.setLoading(true);
        try {
        const response = await axios.get(`${API_URL}/auth/refresh`, { 
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }});
            localStorage.setItem('token', response.data.accessToken);
            this.setAuth(true);
            this.setUser(response.data.user);
        }
        catch(e){
            console.log('Проверка авторизации завершена с ошибкой', e);
            localStorage.removeItem('token');
            this.setAuth(false);
            this.setUser({});
        }
    }

     async generateTelegramCode() {
        try {
            if (!this.user?.UserID) {
                throw new Error('Пользователь не авторизован');
            }
            const response = await AuthService.generateTelegramCode(this.user.UserID);
            this.telegramCode = response.data.code;
            return response.data;
        } catch (e) {
            console.error('Ошибка генерации кода Telegram:', e.response?.data?.message || e.message);
            throw e;
        }
    }

}