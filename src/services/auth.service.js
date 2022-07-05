import axios from"axios";
import authHeader from "./auth-header"

const API_URL = "http://localhost:9090/api/";

const login = async (username, password) => {
    const params = new URLSearchParams();
    params.append("username", username);
    params.append("password", password)
    let res = await axios.post(API_URL + "login", params)
                        .then(response => {
                            if (response.data.access_token) {
                                localStorage.setItem("access_token", response.data.access_token);
                                localStorage.setItem("refresh_token", response.data.refresh_token);
                                localStorage.setItem("username", response.data.username);
                                if (response.data.is_admin)
                                    localStorage.setItem("is_admin", true)
                            }
                            return response.data;
                        })
    return res
};

const recover = (username, password, email, phone) => {
    const params = new URLSearchParams();
    params.append("username", username);
    params.append("new_password", password);
    params.append("email", email);
    params.append("phone", phone);
    return axios
        .put(API_URL + "user/password", params)
        .then(response => {
            return response.data.message;
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
    if (localStorage.getItem("username"))
        return localStorage.getItem("username");
    else {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("username");
        localStorage.removeItem("is_admin");
        return null;
    }
};

const isAdmin = () => {
    if (localStorage.getItem("is_admin"))
        return true;
    else
        return false;
};

const checkToken = () => {
    return axios.get(`${API_URL}user/check_token`, {headers: authHeader()})
    .then((res) => {
        return res.data.message;
    })
}


const refreshToken = async () => {
    try {
        if (localStorage.getItem("refresh_token")) {
            const response = await axios.get(API_URL + "user/refresh_token", {headers: authHeader("refresh")});

            if (response.data.access_token) {
                localStorage.removeItem("access_token");
                localStorage.setItem("access_token", response.data.access_token);
            }
            else {
                return false;
            }

            return true;
        }
        logout();
        return false;
    } catch (error) {
        logout();
        return false;
    }
}

const AuthService = {
    login,
    recover,
    logout,
    register,
    getCurrentUser,
    isAdmin,
    checkToken,
    refreshToken
}

export default AuthService;