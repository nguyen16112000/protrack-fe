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
        return error;
    }
}

const inviteMember = async (project_id, username) => {
    try {
        const response = await axios.post(API_URL + project_id + "/invite/" + username, {}, {headers: authHeader()})
        return response.data.message
        
    }
    catch(error){
        if (error.response.data.error_message)
            return error.response.data.error_message
        return error.response.data.message;
    }
}

const updateWork = async (project_id, work_id, work_name, work_detail, work_time, es_date, lf_date, worker) => {
    try {
        const params = new URLSearchParams();
        params.append("name", work_name);
        params.append("detail", work_detail);
        params.append("work_time", work_time);
        params.append("es_date", es_date.toString());
        params.append("lf_date", lf_date.toString());
        console.log(worker)
        if (worker !== "")
            params.append("worker", worker);
        const response = await axios.put(API_URL + project_id + "/work/" + work_id, params, {headers: authHeader()})
        return response
        
    }
    catch(error){
        if (error.response.data.error_message)
            return error.response.data.error_message
        return error.response.data.message;
    }
}

const startWork = async (project_id, work_id) => {
    try {
        const response = await axios.post(API_URL + project_id + "/work/" + work_id + "/start", {}, {headers: authHeader()})
        return response
    }
    catch(error){
        if (error.response.data.error_message)
            return error.response.data.error_message
        return error.response.data.message;
    }
}

const getProof = async (project_id, work_id) => {
    try {
        const response = await axios.get(API_URL + project_id + "/work/" + work_id + "/proof", {headers: authHeader()})
        return response
        
    }
    catch(error){
        if (error.response.data.error_message)
            return error.response.data.error_message
        return error.response.data.message;
    }
}

const setProof = async (file, project_id, work_id) => {
    try {
        let formData = new FormData();
        formData.append("file", file);
        const response = await axios.post(API_URL + project_id + "/work/" + work_id + "/proof", 
            formData, 
            {headers: 
                authHeader(),
                "Content-Type": "multipart/form-data"
            })
        return response
        
    }
    catch(error){
        if (error.message && error.message === "Network Error") {
            return "File too large to submit"
        }
        if (error.response.data.error_message)
            return error.response.data.error_message
        return error.response.data.message;
    }
}

const approveWork = async (project_id, work_id, status) => {
    try {
        const params = new URLSearchParams();
        params.append("status", status);
        const response = await axios.post(API_URL + project_id + "/work/" + work_id + "/approve", params, {headers: authHeader()})
        return response;
    }
    catch(error){
        if (error.response.data.message)
            return error.response.data.message;
        return error.response.data.error_message
    }
}

const ProjectService = {
    getProjectsByUsers,
    createProject,
    evaluateProject,
    inviteMember,
    updateWork,
    startWork,
    getProof,
    setProof,
    approveWork
}

export default ProjectService;