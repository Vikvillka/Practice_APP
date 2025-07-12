import $api from '../http';

export default class AuthService {

    static async login(email, password) {
        return $api.post('auth/login', { email, password });
    }

    static async registration(data) {
        return $api.post('auth/registration', data);
    }
    
    static async logout() {
        return $api.post('auth/logout');
    }

    static async generateTelegramCode(userId) {
        return $api.post('telegram/generate-code', { id: userId });
    }
}