import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/auth.service";
import ProjectService from "../services/project.service";
import UserService from "../services/user.service";

import Form  from "react-validation/build/form"

import Notification from "../notification.png"
import Plus from "../plus.png"

import { format } from 'date-fns';

import "./Home.css"

const Home = () => {
    const [content, setContent] = useState([]);
    const [currentUser, setCurrentUser] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [unreadNoti, setUnreadNoti] = useState([]);
    const [openNoti, setOpenNoti] = useState(false);
    const [dateNow, setDateNow] = useState(new Date(Date.now()))

    const [focusProject, setFocusProject] = useState(-1);
    const [focusWork, setFocusWork] = useState(-1);

    const actWrap = useRef(null);
    const r_container = useRef(null)
    const calGrid = useRef(null);
    const formWorkEdit = useRef(null)

    const navigate = useNavigate();

    const getData = async (username) => {
        let project = await ProjectService.getProjectsByUsers(username);
        let noti = await UserService.getUnreadNotifications(username);
        setContent(project);
        setUnreadNoti(noti);
        setFocusProject(0);
        setFocusProject(-1);
        setDateNow(new Date(Date.now()))
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

    const getWeeksByMonthYear = (month, year) => {
        let month_start = new Date(year, month, 1);
        let month_end = new Date(year, month + 1, 0);
        let month_dates = [];
        let start_date = month_start;
        // console.log(start_date);
        // console.log(end_date);
        while (start_date <= month_end) {
            month_dates.push({date: start_date.getDate(), day: start_date.getDay()})
            
            start_date.setDate(start_date.getDate() + 1);
        }
        return month_dates;
    }

    const getDayOfWeek = (day) => {
        let dayOfWeek = "";
        // eslint-disable-next-line default-case
        switch (day) {
            case 0:
                dayOfWeek = "Sun";
                break;
            case 1:
                dayOfWeek = "Mon";
                break;
            case 2:
                dayOfWeek = "Tue";
                break;
            case 3:
                dayOfWeek = "Wed";
                break;
            case 4:
                dayOfWeek = "Thu";
                break;
            case 5:
                dayOfWeek = "Fri";
                break;
            case 6:
                dayOfWeek = "Sat";
        }
        return dayOfWeek;
    }

    const getDaysOfWork = (start, end) => {
        let date1 = new Date(start);
        let date2 = new Date(end);
        return (date2.getTime() - date1.getTime()) / (1000 * 3600 * 24) + 1;
    }

    const displayMonth = () => {
        let month_dates = getWeeksByMonthYear(dateNow.getMonth(), dateNow.getFullYear());
        let d_date = new Date(Date.now())
        let todayInRange = (d_date.getMonth() === dateNow.getMonth() && d_date.getFullYear() === dateNow.getFullYear());
        return (
            <div className="calendar-headers">
                {month_dates.map(date => {
                    let style = {}
                    if (todayInRange){
                        if (date.date === d_date.getDate())
                            style["borderRight"] = "2px solid red";
                        else if (d_date.getDate() > 1 && date.date === d_date.getDate() - 1)
                            style["borderRight"] = "2px solid red";
                    }
                    return (
                        <div className="calendar-header">
                            <div className="calendar-date-header" style = {style}>{date.date}</div>
                            <div className="calendar-day-header" style = {style}>{getDayOfWeek(date.day)}</div>
                        </div>
                    )
                })}
            </div>
        )
    }

    const displayWorksName = (works) => {
        return (<div className="work-titles">
            {works.map((work, index) => {
                return (<button 
                        className="work-title" 
                        array-index={index}
                        onClick={onClickWork}
                        style={{height: `calc(100% / ${works.length})`}}
                    >
                    {work.name}
                </button>)
        })}
        </div>)
        
    }

    const displayWorksDays = (works) => {
        let month_dates = getWeeksByMonthYear(dateNow.getMonth(), dateNow.getFullYear());
        let d_date = new Date(Date.now())
        let todayInRange = (d_date.getMonth() === dateNow.getMonth() && d_date.getFullYear() === dateNow.getFullYear());
        
        return (<div className="work-days">
            {works.map((work, index) => {
                let occupied = new Array(month_dates.length).fill(0);
                let es =  new Date(work.es_date);
                let lf = new Date(work.lf_date);
                es.setHours(0);
                es.setMinutes(0);
                es.setSeconds(0);
                lf.setHours(0);
                lf.setMinutes(0);
                lf.setSeconds(0);
                let month_start = new Date(dateNow.getFullYear(), dateNow.getMonth(), 1)
                let month_last = new Date(dateNow.getFullYear(), dateNow.getMonth() + 1, 0)
                if (es < month_start)
                    es = month_start
                if (lf > month_last)
                    lf = month_last
                let dow = getDaysOfWork(es, lf);
                if (es > month_last || lf < month_start)
                    dow = 0;
                let bgcolor = (index % 2) ? ("blue") : ("yellow")
                for (let i = 0; i < dow; i++)
                    occupied[es.getDate() - 1 + i] = 1;
                
                return (<>
                    {dow !== 0 && (<div 
                        className="work-event"
                        style={{gridColumn: es.getDate() + "/ span " + dow  ,gridRow: index + 1, backgroundColor: bgcolor}}
                    />)}
                    {month_dates.map(date => {
                        let style = {gridColumn: date.date, gridRow: index + 1};
                        if (occupied[date.date - 1] === 0 || occupied[date.date + 1 - 1] === 0){
                            style["borderRight"] = "2px solid black";
                            style["borderBottom"] = "2px solid black";
                        }   
                        else {
                            style["borderBottom"] = "2px solid black";
                        }

                        if (todayInRange){
                            if (date.date === d_date.getDate())
                                style["borderRight"] = "2px solid red";
                            else if (d_date.getDate() > 1 && date.date === d_date.getDate() - 1)
                                style["borderRight"] = "2px solid red";
                        }
                        return (<div 
                            className="work-day"
                            style={style}
                        ></div>)
                    })}
                </>)
            })}

        </div>)
        
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
        setFocusProject(index);
        setFocusWork(-1);
        setDateNow(new Date(Date.now()));
        if (r_container.current.classList.contains("active")) {
            r_container.current.classList.toggle("active");
        }
        if (formWorkEdit.current !== null && formWorkEdit.current.classList !== undefined && formWorkEdit.current.classList.contains("active")) {
            formWorkEdit.current.classList.toggle("active");
        }
    }

    const onClickWork = (e) => {
        e.preventDefault();
        let index = e.target.getAttribute("array-index");
        console.log(content[focusProject].works[index])
        setFocusWork(index);
        if (!r_container.current.classList.contains("active")) {
            r_container.current.classList.toggle("active");
        }

        if (formWorkEdit.current !== null && !formWorkEdit.current.classList.contains("active")) {
            formWorkEdit.current.classList.toggle("active");
        }
    }

    const handleBtnCalendar = (e) => {
        e.preventDefault();

        if (e.target.className === "btn-calendar-next") {
            setDateNow(new Date(dateNow.getFullYear(), dateNow.getMonth() + 1, dateNow.getDate()))
        }
        else if (e.target.className === "btn-calendar-back") {
            setDateNow(new Date(dateNow.getFullYear(), dateNow.getMonth() - 1, dateNow.getDate()))
        }
        calGrid.current.scrollLeft = 0;
    }

    const handleBtnAdd = (e) => {
        e.preventDefault();
        navigate("/create");
    }

    const handleEditSubmit = (e) => {
        e.preventDefault();
    }

    const handleLContainer = () => {
        return <>
            <div className="container-header">
                <div></div>
                <div className="">Project</div>
                <img src={Plus} className="plusImg" alt="Add project" onClick={handleBtnAdd}></img>
            </div>
            {content.length > 0 
            ?
                <div className="projects">
                {content.map((value, index) => {
                    return (
                        <button className="project" key={value.id} array-index={index} onClick={onClickProject}>
                            {value.name}
                        </button>
                    )
                }
                )}
                </div>
            :
                <>No project available</>
            }
        </>
    }

    const handleRContainer = () => <>
        {focusProject !== -1 && content.length > 0 && (
            <Form className="project-content">
                <div className="project-content-name">Project Name: {content[focusProject].name}</div>
                {(content[focusProject].works.length > 0)
                    ? (<div className="project-calendar">
                            <div className="calendar-toolbar">
                                <button className="btn-calendar-back" onClick={handleBtnCalendar}>{"<"}</button>
                                <div className="time-label">{dateNow.getMonth() + 1}/{dateNow.getFullYear()}</div>    
                                <button className="btn-calendar-next" onClick={handleBtnCalendar}>{">"}</button>
                            </div>
                            <div className="calendar-grid" ref={calGrid}>
                                <div className="work-title-header">Works</div>
                                {displayMonth()}
                                {displayWorksName(content[focusProject].works)}
                                {displayWorksDays(content[focusProject].works)}
                            </div>
                        </div>
                    )
                    : ("No work available")}
            </Form>
        )}
    </>

    const handleFormWorkEdit = () => {
        if (focusProject === -1 || focusWork === -1)
            return <></>
        let work = content[focusProject].works[focusWork]
        return (<>
            <Form className="form-work-edit active" ref={formWorkEdit}>
                <h1>Work detail:</h1>
                <div className="work-detail">
                    <label htmlFor="work-name">Name:</label>
                    <input
                        type="text"
                        name="work-name"
                        value={work.name}
                        readOnly
                    />
                </div>
                <div className="work-detail">
                    <label htmlFor="work-description">Detail:</label>
                    <input
                        type="text"
                        name="work-description"
                        value={(work.detail !== null) ? (work.detail) : ("")}
                        readOnly
                    />
                </div>
                <button className="btn-work-cancel">Cancel</button>
            </Form>
        </>
        )
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
    
    return (
    <>
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
        <div className="actions-wrapper" ref={actWrap}>
            <div className="container lcontainer">
                {handleLContainer()}
            </div>
            <div className="container rcontainer" ref={r_container}>
                {handleRContainer()}
            </div>
            {handleFormWorkEdit()}
        </div>
    </>
    );
    
}
export default Home;