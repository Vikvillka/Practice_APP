export default class AuthResponse {
    constructor(accessToken, refreshToken, user) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.user = user;
    }
}
