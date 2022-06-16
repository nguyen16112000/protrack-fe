import axios from "axios";
import authHeader from "/auth-header"

const API_URL = "http://localhost:9090/api/user/";
const getUsers = () => {
    return axios.get(API_URL, {headers: authHeader()});
}
const UserService = {
    getUsers
}

export default UserService;