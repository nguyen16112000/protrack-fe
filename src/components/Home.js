import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthService from "../services/auth.service";
import ProjectService from "../services/project.service";
import UserService from "../services/user.service";

import Notification from "../notification.png"
import Plus from "../plus.png"

import { format } from 'date-fns';

import "./Home.css"

const Home = () => {
    const [content, setContent] = useState([]);
    const [currentUser, setCurrentUser] = useState("")
    const [isAdmin, setIsAdmin] = useState(false)
    const [unreadNoti, setUnreadNoti] = useState([])
    const [openNoti, setOpenNoti] = useState(false)
    const [focus, setFocus] = useState(-1)
    const navigate = useNavigate();

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

    const onClickProject = (e) => {
        let index = e.target.getAttribute("array-index");
        setFocus(index);
        console.log(content[index]);
    }

    const getData = async (username) => {
        let project = await ProjectService.getProjectsByUsers(username);
        let noti = await UserService.getUnreadNotifications(username);
        setContent(project);
        setUnreadNoti(noti);
        setFocus(0);
    }

    const handleContainer1 = () => {
        return <>
            <div className="container-header">
                <div className="    ">Project</div>
                <img src={Plus} className="plusImg" alt="Add project"></img>
            </div>
            {content.length > 0 
            ?
                <>
                {content.map((value, index) => {
                    return (
                        <button className="button" key={value.id} array-index={index} onClick={onClickProject}>
                            {value.name}
                        </button>
                    )
                }
                )}
                </>
            :
                <>No project available</>
            }
        </>
    }

    const handleContainer2 = () => {
        return <>
            {focus !== -1 && content.length > 0 && (<>
                    Project Name: {content[focus].name}<br/>
                    Project Works:
                    {(content[focus].works.length > 0) 
                    ? (content[focus].works.map((value => {
                        return (
                            <div>{(value.name) 
                                ? value.name 
                                : value.id
                                + " es_date:" + value.es_date
                                + " ef_date:" + value.ef_date
                                + " ls_date:" + value.ls_date
                                + " lf_date:" + value.lf_date
                                + " work_time:" + value.work_time
                            }
                            </div>
                        )
                    })))
                    : ("No work available")
                    }
                    </>
                )}
        </>
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
                        console.log(res);
                        if (res) {
                            await getData(username);
                        }
                        else {
                            navigate("/login")
                        }
                    }
                    refresh();
                }
            }
            fetchData();
            console.log(content.length)
        }
        else {
            navigate("/login")
        }
    }, [navigate]);
    
    return (
    <>
        <nav className="navbar navbar-expand">
            <div className="navbar-brand nav-link" onClick={onClickAppIcon}>
                Protrack
            </div>
            <div className="narbar-nav me-auto">
                {isAdmin && (
                    <a href={"/admin"} className="navbar-brand nav-link">
                    Admin
                    </a>
                )}
            </div>

            <div className="navbar-nav rnavbar">
                {currentUser ? (
                    <>
                        <div className="notiIcon">
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
        <div className="actions-wrapper">
            <div className="container container1">
                {handleContainer1()}
            </div>
            <div className="container container2">
                {handleContainer2()}
            </div>
        </div>
    </>
    );
    
}
export default Home;