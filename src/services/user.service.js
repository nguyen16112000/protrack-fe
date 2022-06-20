import axios from "axios";
import authHeader from "./auth-header"

const API_URL = "http://localhost:9090/api/user/";
const getUsers = () => {
    return axios.get(API_URL, {headers: authHeader()});
}

const getUnreadNotifications = async (username) => {
    try {
        const response = await axios.get(API_URL + username + "/unread", {headers: authHeader()})

        return response.data.data.notifications;
    }
    catch(error){
        return error.response.data.error_message
    }
}
const UserService = {
    getUsers,
    getUnreadNotifications
}

export default UserService;