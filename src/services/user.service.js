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

const readNotification = async (username, noti_id, status) => {
    try {
        const params = new URLSearchParams();
        params.append("status", status);
        const response = await axios.post(API_URL + username + "/read/" + noti_id, params, {headers: authHeader()})
        // console.log(response.data.message)
        return response.data.message;
    }
    catch(error){
        console.log(error.response.data.message)
        if (error.response.data.message)
            return error.response.data.message;
        return error.response.data.error_message
    }
}

const UserService = {
    getUsers,
    getUnreadNotifications,
    readNotification
}

export default UserService;