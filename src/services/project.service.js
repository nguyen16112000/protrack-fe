import axios from "axios";
import authHeader from "./auth-header"

const API_URL = "http://localhost:9090/api/";

const getProjectsByUsers = async (username) => {

    try {
        
        const response = await axios.get(API_URL + "project/user/" + username, {headers: authHeader()})
        
        return response.data.data.projects
        
    }
    catch(error){
        return error.response.data.error_message;
    }
}

const ProjectService = {
    getProjectsByUsers
}

export default ProjectService;