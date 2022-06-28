import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/auth.service";
import ProjectService from "../services/project.service";
import UserService from "../services/user.service";

import Form  from "react-validation/build/form"
import Input from "react-validation/build/input"
import Select from 'react-select';
import CheckButton from "react-validation/build/button"

import Notification from "../notification.png"

import { format } from 'date-fns';

import "./CreateProject.css"

const CreateProject = () => {
    const [currentUser, setCurrentUser] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [unreadNoti, setUnreadNoti] = useState([]);
    const [openNoti, setOpenNoti] = useState(false);

    const formAdd = useRef()

    const [formState, setFormState] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [projectDate, setProjectDate] = useState(Date.now())
    const [workName, setWorkName] = useState("");
    const [workTime, setWorkTime] = useState("1");
    const [works, setWorks] = useState([]);
    const [worksWithID, setWorksWithID] = useState([]);
    const [worksWithTime, setWorksWithTime] = useState([]);
    const [workOrder, setWorkOrder] = useState([]);
    const [isEmptyWorks, setIsEmptyWorks] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const checkBtn = useRef();

    const navigate = useNavigate();

    const getData = async (username) => {
        let noti = await UserService.getUnreadNotifications(username);
        setUnreadNoti(noti);
    }

    const logout = () => {
        AuthService.logout();
    }

    const onClickNoti = () => {
        setOpenNoti(!openNoti)
    }

    const displayNoti = (notification) => {
        let notiDate = new Date(notification.createdAt);
        let dateNow = new Date(Date.now());

        if (notiDate.getFullYear() === dateNow.getFullYear())
            notiDate = format(notiDate, "dd-MM")
        else
            notiDate = format(notiDate, "dd-MM-yyyy")
        
        return <div className="notification">
            <li className="notiMessage" key={notification.id}>{notification.message}</li>
            <li className="notiDate">{notiDate}</li>
        </div>        
    }

    const onClickAppIcon = () => {
        if (currentUser) {
            navigate("/home")
        }
        else {
            navigate("/login")
        }
    }

    const onChangeProjectName = (e) => {
        const name = e.target.value;
        setProjectName(name);
    }

    const onChangeProjectDate = (e) => {
        const date = e.target.value;
        setProjectDate(date);
    }

    const onChangeWorkName = (e) => {
        const name = e.target.value;
        setWorkName(name);
    }

    const onChangeWorkTime = (e) => {
        const time = e.target.value;
        setWorkTime(time);
    }

    const required = value => {
        if (!value) {
            return (
                <div className="alert alert-danger" role="alert">
                    This field is required!
                </div>
            );
        }
    };

    const addWork = (e) => {
        e.preventDefault();
        let new_works = works;
        if (workName !== "") {
            new_works.push(workName);
            worksWithTime.push({[workName]: workTime})
            setWorkName("");
            setWorkTime("1");
            setWorks(new_works);
        }
        else {
            alert("Please enter work name!!!")
        }
    }

    const removeWork = (e) => {
        e.preventDefault();
        const target = e.target.parentElement.parentElement.getAttribute("value");
        let new_works = works; 
        let new_worksTime = worksWithTime;
        const foundId = new_worksTime.findIndex((item) => Object.keys(item)[0] === target);
        if (foundId !== -1) {
            new_worksTime.splice(foundId, 1)
        }
        new_works = new_works.filter(work => work !== target)
        setWorks(new_works);
    }

    const changeFormState = (e) => {
        e.preventDefault();
        if (e.target.className === "btn-form-add") {
            if (works.length === 0)
                setIsEmptyWorks(true);
            else
                setIsEmptyWorks(false);
            formAdd.current.validate("project-name");
            formAdd.current.validate("project-date");
            if (works.length > 0) {
                works.map((work, index) => {
                    let workWithID = {value: index+1, label: index+1};
                    let new_worksWithID = worksWithID;
                    new_worksWithID.push(workWithID);
                    setWorksWithID(new_worksWithID);
                    return 0;
                })
                setWorkOrder([])
                setFormState(true);
            }
        }
        else if (e.target.className === "btn-form-back") {
            setFormState(false);
            setWorksWithID([])
            setWorkOrder([])
        }
    }

    const handleSelect = (val, id) => {
        let work_order = workOrder;
        const newVal = val.map((item) => item.label.toString());

        const foundId = work_order.findIndex((item) => Object.keys(item)[0] === id.toString());
        
        if (foundId !== -1) {
            work_order.splice(foundId, 1)
        }

        if (newVal.length > 0)
            work_order.push({[id.toString()]: newVal})
        setWorkOrder(work_order);
    }

    const handleAdd =  async (e) => {
        e.preventDefault();

        setMessage("");
        setLoading(true);

        formAdd.current.validateAll();

        if (checkBtn.current.context._errors.length === 0) {
            console.log(worksWithTime)
            let project_id = await ProjectService.createProject(projectName, projectDate, worksWithTime, workOrder);
            let response = await ProjectService.evaluateProject(project_id, projectDate);
            console.log(response);
            setLoading(false);
            setMessage("Create success")
            setTimeout(() => {
                navigate("/home");
            }, 1000);
        }
        else {
            setMessage("Missing field")
            setTimeout(() => {
                setLoading(false);
            }, 1000);
        }
    }

    const handleCancel = (e) => {
        e.preventDefault();
        navigate("/home");
    }

    useEffect(() => {
        const username = AuthService.getCurrentUser();
        if (username) {
            setCurrentUser(username);
            setIsAdmin(AuthService.isAdmin());
            async function fetchData() {
                let valid = await AuthService.checkToken();
                if (valid.includes("Valid")) {
                    await getData(username);
                }
                else {
                    async function refresh() {
                        let res = await AuthService.refreshToken();
                        if (res) {
                            await getData(username);
                        }
                        else {
                            alert("Cuts");
                            navigate("/login");
                        }
                    }
                    refresh();
                }
            }
            fetchData();
        }
        else {
            navigate("/login")
        }
    }, [navigate]);

    return (<>
        <nav className="navbar navbar-expand navbar-dark bg-dark">
            <div className="navbar-brand" onClick={onClickAppIcon}>
                Protrack
            </div>
            <div className="narbar-nav me-auto">
                {isAdmin && (
                    <a href={"/admin"} className="navbar-brand">
                    Admin
                    </a>
                )}
            </div>

            <div className="navbar-nav rnavbar">
                {currentUser ? (
                    <>
                        <div className="nav-item notiIcon">
                            <img src={Notification} className="notiImg" alt="" onClick={onClickNoti}/>
                            {unreadNoti.length > 0 && (
                                <div className="counter">
                                    {unreadNoti.length}
                                </div>
                            )}
                            {openNoti && (
                                <div className="notifications">
                                    {unreadNoti.map(noti => displayNoti(noti))}
                                </div>
                            )}
                        </div>
                        <div className="nav-item">
                            {currentUser}
                        </div>
                        <div className="nav-item">
                            <a href="/login" className="nav-link" onClick={logout}>
                            Logout
                            </a>
                        </div>
                    </>
                ) : (
                    <div className="navbar-nav">
                        <li className="nav-item">
                            <a href={"/login"} className="nav-link">
                            Login
                            </a>
                        </li>
                        <li className="nav-item">
                        <a href={"/register"} className="nav-link">
                            Register
                            </a>
                        </li>
                    </div>
                )}
            </div>
        </nav>
        <Form className="form-create" ref={formAdd} onSubmit={handleAdd}>
                <h1>Create project</h1>
                {(!formState) ? (
                    <>
                        <div className="form-row">
                            <div className="col">
                                <label htmlFor="project-name">Project name:</label>
                                <Input
                                    type="text"
                                    className="form-control"
                                    name="project-name"
                                    value={projectName}
                                    onChange={onChangeProjectName}
                                    validations={[required]}
                                />
                            </div>
                            <div className="col">
                                <label htmlFor="project-date">Project start date:</label>
                                <Input
                                    type="date"
                                    className="form-control"
                                    name="project-date"
                                    value={projectDate}
                                    onChange={onChangeProjectDate}
                                    validations={[required]}
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="col">
                                <label htmlFor="work-name">Work name:</label>
                                <Input
                                    type="text"
                                    className="form-control"
                                    name="work-name"
                                    value={workName}
                                    onChange={onChangeWorkName}
                                />
                            </div>
                            <div className="col">
                                <label htmlFor="work-time">Work time:</label>
                                <Input
                                    type="number"
                                    className="form-control"
                                    name="work-time"
                                    value={workTime}
                                    min="1"
                                    max="100"
                                    onChange={onChangeWorkTime}
                                />
                            </div>
                            
                            <button className="btn-work-add" onClick={addWork}>Add work</button>
                        </div>
                    
                        <div className="works">
                            <label htmlFor="works">Works:</label>
                            {works.length > 0 && (
                                <>   
                                    {works.map((work, index) => {
                                        return <div className="work" value={work}>
                                            <div className="work-content">
                                                <h2>{index+1}/ {work}</h2>
                                            </div>
                                            <div className="work-actions">
                                                <button className="btn-work-edit">Edit</button>
                                                <button className="btn-work-delete" onClick={removeWork}>Delete</button>
                                            </div>
                                        </div>
                                    })}
                                </>
                            )}
                            {works.length === 0 && isEmptyWorks && (
                                <div className="alert alert-danger" role="alert">
                                    Please add some works to project!
                                </div>
                            )}
                            {message && (
                            <div className="form-group">
                                <div className="alert alert-danger" role="alert">
                                    {message}
                                </div>
                            </div>
                        )}

                        </div>
                        
                    </>
                ) : (
                    <>
                        {works.length > 0 && (
                            <div className="work-order">
                                <label htmlFor="works">Works:</label>
                                    {works.map((work, index) => {
                                        return <div className="work">
                                            <div className="work-content">
                                                <h2>{index+1}/ {work}</h2>
                                            </div>
                                            <Select 
                                                name="select-order"
                                                placeholder="--"
                                                // value={work_order[index+1]}
                                                // defaultValue={worksWithID[0]}
                                                options={worksWithID.filter(item => item.value !== index + 1)}
                                                onChange={(val) => handleSelect(val, index + 1)}
                                                isMulti
                                                isClearable
                                            />
                                        </div>
                                    })}
                            </div>
                        )}
                    </>
                )}
                

                {(!formState) ? (
                    <button className="btn-form-add" onClick={changeFormState}>Add</button>
                ) : (<>
                        {loading ? (
                            <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                        <>
                            <button className="btn-form-finish" type="submit">Finish</button>
                            <button className="btn-form-back" onClick={changeFormState}>Back</button>
                        </>
                        )}
                    </>
                )}
                <button className="btn-form-cancel" onClick={handleCancel}>Cancel</button>
                <CheckButton style={{display: "none"}} ref={checkBtn} />
        </Form>
    </>)
}
export default CreateProject;