import axios from"axios";

const API_URL = "http://localhost:9090/api/";

const login = (username, password) => {
    const params = new URLSearchParams();
        params.append("username", username);
        params.append("password", password)
        return axios
            .post(API_URL + "login", params)
            .then(response => {
                console.log(response.data.access_token)
                if (response.data.access_token) {
                    localStorage.setItem("access_token", response.data.access_token);
                    localStorage.setItem("refresh_token", response.data.refresh_token);
                    localStorage.setItem("username", response.data.username);
                    localStorage.setItem("is_admin", response.data.is_admin)
                }
                return response.data;
            });
};

const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");
    localStorage.removeItem("is_admin");
};

const register = (username, password) => {
    const params = new URLSearchParams();
    params.append("username", username);
    params.append("password", password);
    return axios
        .post(API_URL + "user/", params)
        .then(response => {
            console.log(response.data)
            return response.data;
        });
};

const getCurrentUser = () => {
    return localStorage.getItem("username");
};

const isAdmin = () => {
    if (localStorage.getItem("is_admim"))
        return true;
    else
        return false;
};

const AuthService = {
    login,
    logout,
    register,
    getCurrentUser,
    isAdmin
}

export default AuthService;