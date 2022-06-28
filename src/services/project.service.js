import axios from "axios";
import authHeader from "./auth-header"

const API_URL = "http://localhost:9090/api/project/";

const getProjectsByUsers = async (username) => {
    try {
        
        const response = await axios.get(API_URL + "user/" + username, {headers: authHeader()})
        
        return response.data.data.projects
        
    }
    catch(error){
        return error.response.data.error_message;
    }
}

const createProject = async (name, date, work_object, work_order_object) => { 
    try {
        console.log(date)
        let works_map = new Map();
        work_object.forEach((value, index) => {
            works_map.set([(index+1).toString()], [Object.keys(value)[0], value[Object.keys(value)]])
        })

        let work_order = new Map()
        work_order_object.forEach(value => {    
            work_order.set(Object.keys(value), value[Object.keys(value)])
        })

        let body = {
            name: name,
            start_date: date,
            work: Object.fromEntries(works_map.entries()),
            work_order: Object.fromEntries(work_order.entries())
        }
        const response = await axios.post(API_URL + "create", 
            body, 
            {headers: authHeader()}
        )

        return response.data.data.id;

        
    }

    catch(error) {
        console.log(error)
    }
}

const evaluateProject = async (project_id, start_date) => {
    try {
        
        const response = await axios.put(API_URL + "evaluate", 
            {id: project_id, start_date: start_date},
            {headers: authHeader()}
        )
        
        if (response.data.status === "OK")
            return true;
        return false;
    }
    catch(error){
        console.log(error)
        return error;
    }
}

const ProjectService = {
    getProjectsByUsers,
    createProject,
    evaluateProject
}

export default ProjectService;