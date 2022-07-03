import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/auth.service";
import ProjectService from "../services/project.service";
import UserService from "../services/user.service";

import Form  from "react-validation/build/form"

import Notification from "../notification2.png"
import Admin from "../admin.svg"
import Plus from "../plus.svg"
import Member from "../group.svg";

import { format, parse } from 'date-fns';

import "./Home.css"

const Home = () => {
    const [content, setContent] = useState([]);
    const [currentUser, setCurrentUser] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [unreadNoti, setUnreadNoti] = useState([]);
    const [openNoti, setOpenNoti] = useState(false);
    const [dateNow, setDateNow] = useState(new Date(Date.now()))

    const [focusProject, setFocusProject] = useState(-1);
    const [isProjectAdmin, setIsProjectAdmin] = useState(false);
    const [openProjectMembers, setOpenProjectMembers] = useState(false);
    const [triggerRender, setTriggerRender] = useState(false);
    const [focusWork, setFocusWork] = useState(-1);

    const [workName, setWorkName] = useState(null);
    const [workTime, setWorkTime] = useState(null);
    const [workDetail, setWorkDetail] = useState(null);
    const [workESDate, setWorkESDate] = useState(null);
    const [workLFDate, setWorkLFDate] = useState(null);
    const [workSDate, setWorkSDate] = useState(null);
    const [workFDate, setWorkFDate] = useState(null);
    const [worker, setWorker] = useState(null);

    const notiImg = useRef(null);
    const notifications = useRef(null);
    const actWrap = useRef(null);
    const r_container = useRef(null);
    const projectMembers = useRef(null);
    const add_member = useRef(null);
    const calGrid = useRef(null);
    const formWorkEdit = useRef(null);
    const input_sdate = useRef(null);
    const navigate = useNavigate();

    const getData = async (username) => {
        let project = await ProjectService.getProjectsByUsers(username);
        let noti = await UserService.getUnreadNotifications(username);
        setContent(project);
        setUnreadNoti(noti);
        setFocusProject(0);
        setFocusProject(-1);
        setDateNow(new Date(format(Date.now(), "yyyy-MM-dd")))
    }

    const logout = () => {
        AuthService.logout();
    }

    const onClickNoti = () => {
        if (openNoti) {
            notifications.current.style.height = "0px";
            notifications.current.style.visibility = "hidden";
            // notifications.current.style.opacity = "0";
            // notifications.current.style.display = "none";

        }
        else {
            notifications.current.style.height = "25vh";
            notifications.current.style.visibility = "visible";
            // notifications.current.style.opacity = "1";
            // notifications.current.style.display = "initial";
        }
        setOpenNoti(!openNoti)
    }

    const handleReadNoti = async (e) => {
        let noti_id = e.target.parentElement.parentElement.getAttribute("noti-id");
        let index = e.target.parentElement.parentElement.getAttribute("array-index");
        let new_unreadNoti = unreadNoti;
        let selected = new_unreadNoti[index];
        new_unreadNoti = new_unreadNoti.filter(item => item !== selected);
        // new_unreadNoti.splice(index, 1)
        // console.log(unreadNoti)
        // console.log(new_unreadNoti)
        if (e.target.className === "noti-action-yes") {
            let response = await UserService.readNotification(currentUser, noti_id, 1);
            if (response.includes("Notification read")) {
                setUnreadNoti(new_unreadNoti);
            }
            else if (response.includes("Username not found")){
                alert("Username not found!");
            }
            else {
                alert("Error occured!");
            }
            window.location.reload();
        }
        else if (e.target.className === "noti-action-no") {
            let response = await UserService.readNotification(currentUser, noti_id, -1);
            if (response.includes("Notification read")) {
                setUnreadNoti(new_unreadNoti);
            }
            else {
                alert("Error occured!");
            }
        }
        else if (e.target.className === "noti-action-read") {
            let response = await UserService.readNotification(currentUser, noti_id, 0);
            if (response.includes("Notification read")) {
                setUnreadNoti(new_unreadNoti);
            }
            else {
                alert("Error occured!");
            }
        }
    }

    const displayNoti = (notification, index) => {
        let notiDate = new Date(notification.createdAt);
        let dateNow = new Date(Date.now());

        if (notiDate.getFullYear() === dateNow.getFullYear())
            notiDate = format(notiDate, "dd-MM")
        else
            notiDate = format(notiDate, "dd-MM-yyyy")
        
        return <div className="notification" key={notification.id} array-index={index} noti-id={notification.id}>
            <div className="noti-message">{notification.message}</div>
            <div className="noti-actions">
                {(notification.type && notification.type.includes("invitation")) 
                ? (
                    <>
                        <button className="noti-action-yes" onClick={handleReadNoti}>Yes</button>
                        <button className="noti-action-no" onClick={handleReadNoti}>No</button>
                    </>
                ) 
                : (
                    <button className="noti-action-read" onClick={handleReadNoti}>Read</button>
                )}
            </div>
            <div className="noti-date">{notiDate}</div>
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
                {month_dates.map((date, index) => {
                    let style_date = {gridColumn: index + 1, gridRow: 1}
                    let style_day = {gridColumn: index + 1, gridRow: 2}
                    if (todayInRange){
                        if (date.date === d_date.getDate())  {
                            style_date["borderRight"] = "2px solid red";
                            style_day["borderRight"] = "2px solid red";
                        }
                        else if (d_date.getDate() > 1 && date.date === d_date.getDate() - 1) {
                            style_date["borderRight"] = "2px solid red";
                            style_day["borderRight"] = "2px solid red";
                        }
                    }
                    return (
                        <>
                            <div className="calendar-date-header" style = {style_date}>{(date.date > 9) ? (date.date) : ("0" + date.date)}</div>
                            <div className="calendar-day-header" style = {style_day}>{getDayOfWeek(date.day)}</div>
                        </>
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
                // console.log(work.work_time)
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
                
                // if (dow > work.work_time) {
                //     let first_half = work.work_time / dow * 100;
                //     bgcolor = (index % 2) 
                //     ? (`linear-gradient(90deg, blue ${first_half}%, lightblue 0%)`) 
                //     : (`linear-gradient(90deg, yellow ${first_half}%, lightyellow 0%)`)
                // }

                return (<>
                    {/* {dow !== 0 && (<div 
                        className="work-event"
                        style={{gridColumn: es.getDate() + "/ span " + dow  , gridRow: index + 1, background: bgcolor}}
                    />)} */}
                    {month_dates.map(date => {
                        let style = {gridColumn: date.date, gridRow: index + 1};
                        let title = "";
                        if (occupied[date.date - 1] === 1) {
                            style["background"] = bgcolor;
                            title = "Work day"
                        }
                        if (occupied[date.date - 1] === 0 || occupied[date.date + 1 - 1] === 0){
                            style["borderRight"] = "2px solid black";
                            style["borderBottom"] = "2px solid black";
                        }   
                        else {
                            style["borderBottom"] = "2px solid black";
                        }

                        if (todayInRange){
                            if (date.date === d_date.getDate()) {
                                style["borderRight"] = "2px solid red";
                                title = "Today"
                            }
                            else if (d_date.getDate() > 1 && date.date === d_date.getDate() - 1)
                                style["borderRight"] = "2px solid red";
                        }

                        return (<div 
                            className="work-day"
                            style={style}
                            title={title}
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
        if (content[index].userProject[currentUser] !== undefined)
            setIsProjectAdmin(content[index].userProject[currentUser].includes("ADMIN"));
                
        setDateNow(new Date(format(Date.now(), "yyyy-MM-dd")));
        if (r_container.current.classList.contains("active")) {
            r_container.current.classList.toggle("active");
        }
        if (formWorkEdit.current !== null && formWorkEdit.current.classList.contains("active")) {
            formWorkEdit.current.classList.toggle("active");
        }
    }

    const onClickProjectMembers = (e) => {
        if (openProjectMembers) {
            projectMembers.current.style.height = "0px";
            projectMembers.current.style.visibility = "hidden";
            // projectMembers.current.style.opacity = "0";
            // projectMembers.current.style.display = "none";

        }
        else {
            projectMembers.current.style.height = "25vh";
            projectMembers.current.style.visibility = "visible";
            // projectMembers.current.style.opacity = "1";
            // projectMembers.current.style.display = "initial";
        }
        setOpenProjectMembers(!openProjectMembers)
    }

    const onClickWork = (e) => {
        e.preventDefault();
        let index = e.target.getAttribute("array-index");
        setFocusWork(index);
        setWorkName(content[focusProject].works[index].name);
        setWorkTime(content[focusProject].works[index].work_time);
        setWorkDetail(content[focusProject].works[index].detail);
        setWorkESDate(content[focusProject].works[index].es_date);
        setWorkLFDate(content[focusProject].works[index].lf_date);
        setWorkSDate(content[focusProject].works[index].s_date);
        setWorkFDate(content[focusProject].works[index].f_date);
        setWorker(content[focusProject].works[index].user);
        
        r_container.current.classList.toggle("active");
        if (formWorkEdit.current !== null)
            formWorkEdit.current.classList.toggle("active");
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

    const handleBtnAddProject = (e) => {
        e.preventDefault();
        navigate("/create");
    }

    const handleBtnAddMember = async (e) => {
        e.preventDefault();
        const username = add_member.current.value;
        if (!username || username === "" )
            alert("Please enter username to add!");
        let response = await ProjectService.inviteMember(content[focusProject].id , username)
        if (response.includes("NOT FOUND"))
            alert("User not found!");
        else alert(response)
        // if (response.includes("successful"))    {
        //     //need to update content[focusProject].userProject
        //     let new_content = content;
        //     new_content[focusProject].userProject[username] = "ROLE_USER";
        //     add_member.current.value = ""
        //     setContent(new_content);
        //     setTriggerRender(!triggerRender);
        //     // window.location.reload();
        // }

    }

    const onChangeWorkName = (e) => {
        const name = e.target.value;
        setWorkName(name);
    }
    
    const onChangeWorkDetail = (e) => {
        const detail = e.target.value;
        setWorkDetail(detail);
    }

    const onChangeWorkTime = (e) => {
        const time = parseInt(e.target.value, 10);
        setWorkTime(time);
        if (workSDate)  {
            let s_date = new Date(workSDate);
            s_date.setDate(s_date.getDate() + time - 1);
            setWorkFDate(format(s_date, "yyyy-MM-dd"));
        }
    }

    const onChangeWorker = (e) => {
        const name = e.target.value;
        setWorker(name);
    }

    const onChangeWorkES = (e) => {
        const es = e.target.value;
        setWorkESDate(es);
    }

    const onChangeWorkLF = (e) => {
        const lf = e.target.value;
        setWorkLFDate(lf);

    }

    const onChangeWorkS = (e) => {
        console.log(e.target.value);
        const s = e.target.value;
        console.log(s);
        setWorkSDate(s);
        let new_date = new Date(s);
        new_date.setDate(new_date.getDate() + workTime - 1);
        setWorkFDate(format(new_date, "yyyy-MM-dd"));
    }

    const handleBtnWorkEdit = async (e) => {
        e.preventDefault();
        if (e.target.className === "btn-work-cancel") {
            r_container.current.classList.toggle("active");
            formWorkEdit.current.classList.toggle("active");
        }
        else if (e.target.className === "btn-work-update") {
            r_container.current.classList.toggle("active");
            formWorkEdit.current.classList.toggle("active");
        }
    }

    const handleEditSubmit = (e) => {
        e.preventDefault();
    }

    const datetoTxt = (value) => {
        let new_date = new Date(value);
        return format(new_date, "MM/dd/yyyy");
    }

    const handleFormWorkEdit = () => {
        if (focusProject === -1 || focusWork === -1)
            return <></>
        let members = Object.keys(content[focusProject].userProject);
        let displayBtnUpdate = {display: (!isProjectAdmin && worker !== currentUser) ? ("none") : ("initial")};
        
        let max_sdate = new Date(workLFDate);
        max_sdate.setDate(max_sdate.getDate() - parseInt(workTime) + 1);
        max_sdate = format(max_sdate, "yyyy-MM-dd")

        let isWorkStarted = false;
        let isWorkFinished = false;
        let date_now = new Date(Date.now())
        if (workSDate && workSDate < format(date_now, "yyyy-MM-dd"))
            isWorkStarted = true
        if (workFDate || content[focusProject].works[focusWork].approved)
            isWorkFinished = true

        return (<div className="container-form active" ref={formWorkEdit}>
            <Form className="form-work-edit" onSubmit={handleEditSubmit}>
                <h1>Work detail:</h1>
                <div className="work-detail">
                    <label htmlFor="work-name">Name:</label>
                    <textarea
                        className="form-control"
                        name="work-name"
                        value={workName}
                        onChange={onChangeWorkName}
                        readOnly={!isProjectAdmin || isWorkStarted}
                    />
                </div>

                <div className="work-detail">
                    <label htmlFor="work-description">Detail:</label>
                    <textarea
                        className="form-control"
                        name="work-description"
                        value={(workDetail !== null) ? (workDetail) : ("")}
                        onChange={onChangeWorkDetail}
                        readOnly={!isProjectAdmin || isWorkStarted}
                    />
                </div>

                <div className="work-detail">
                    <label htmlFor="work-time">Work time:</label>
                    <input
                        type="number"
                        className="form-control"
                        name="work-time"
                        min="1"
                        max="100"
                        value={workTime}
                        onChange={onChangeWorkTime}
                        readOnly={!isProjectAdmin || isWorkStarted}
                    />
                </div>

                <div className="work-detail">
                    <label htmlFor="worker">Worker:</label>
                    <select 
                        className="worker form-control"
                        disabled={!isProjectAdmin}
                        onChange={onChangeWorker}
                    >
                        {worker === "" && (<option disabled selected value="" style={{display: "none"}}>Unassigned</option>)}
            
                        {members.map((member) => {
                            if (worker === member) return <option value ={member} selected>{member}</option>
                            return <option value ={member}>{member}</option>
                        })}
                    </select>
                </div>
                
                <div className="form-row">
                    <div className="form-col">
                        <label htmlFor="work-es-date">Early Start:</label>
                        <input
                            type="date"
                            className="form-control"
                            name="work-es-date"
                            value={workESDate}
                            onChange={onChangeWorkES}
                            disabled={!isProjectAdmin || isWorkStarted}
                            
                        />
                    </div>
                    <div className="form-col">
                        <label htmlFor="work-lf-date">Late Finish:</label>
                        <input
                            type="date"
                            className="form-control"
                            name="work-lf-date"
                            value={(workLFDate !== null) ? (workLFDate) : ("mm/dd/yyyy")}
                            onChange={onChangeWorkLF}
                            disabled={!isProjectAdmin || isWorkStarted}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-col">
                        <label htmlFor="work-s-date">Start:</label>
                        <input
                            type="text"
                            className="form-control"
                            name="work-s-date"
                            ref={input_sdate}
                            onFocus={() => {                                
                                let value = input_sdate.current.value;
                                input_sdate.current.type = "date";
                                if (value) {
                                    // console.log(parse(value, "MM/dd/yyyy", new Date()))
                                    let display_date = value;
                                    if (value.includes("/"))
                                        display_date = parse(value, "MM/dd/yyyy", new Date());
                                    else 
                                        display_date = new Date(value)
                                    input_sdate.current.value = format(display_date, "yyyy-MM-dd");
                                }
                                else {
                                    input_sdate.current.value = value;
                                }
                            }}
                            onBlur={() => {
                                let value = input_sdate.current.value
                                input_sdate.current.type = "text";
                                if (value) {
                                    let display_date = new Date(parse)
                                    input_sdate.current.value = format(display_date, "MM/dd/yyyy");
                                }
                            }}
                            value={(workSDate === null) ? ("") : (datetoTxt(workSDate))}
                            onChange={onChangeWorkS}
                            disabled={!isProjectAdmin && worker !== currentUser && !isWorkStarted}
                            min={workESDate}
                            max={max_sdate}
                            placeholder="Havene't started"
                        />
                    </div>
                    <div className="form-col">
                        {(isWorkFinished ? (
                            <>
                            <label htmlFor="work-f-date">Estimated finish:</label>
                            <input
                                type="date"
                                className="form-control"
                                name="work-f-date"
                                value={workFDate}
                                disabled
                            />
                            </>
                        ) : (
                            <>
                            <label htmlFor="work-f-date">Finish:</label>
                            <input
                                type="text"
                                className="form-control"
                                name="work-f-date"
                                value={"Haven't finished"}
                                disabled
                            />
                            </>
                        ))}
                        
                    </div>
                </div>

                <div className="form-row">
                    <button className="btn-work-update" onClick={handleBtnWorkEdit} style={displayBtnUpdate}>Update</button>
                    <button className="btn-work-cancel" onClick={handleBtnWorkEdit}>Cancel</button>
                </div>
            </Form>
        </div>
        )
    }

    const handleLContainer = () => {
        return <>
            <div className="container-header">
                <div></div>
                <div className="">Project</div>
                <img src={Plus} className="plusImg" alt="Add project" onClick={handleBtnAddProject}></img>
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
                <div className="project-content-header" style={{border: "1px solid black", borderBottom: "none"}}>
                    <div className="project-content-name">
                        <h4 style={{paddingLeft: "5px"}}>{content[focusProject].name}</h4>
                    </div>
                    <div className="project-content-toolbar">
                        {/* <img src={Member} className= "helpImg" alt="Members" onClick={onClickProjectMembers}></img> */}
                        <img src={Member} className= "membersImg" alt="Members" onClick={onClickProjectMembers}></img>
                    </div>
                    <div className="project-members" ref={projectMembers}>
                        <h4>Members</h4>
                        <div className="project-members-add">
                            <input type="text" ref={add_member} />
                            <img src={Plus} className="plusImg" alt="Add member" onClick={handleBtnAddMember}></img>
                        </div>
                        
                        {Object.keys(content[focusProject].userProject).map((user, index) => {
                            return <div className="project-member">
                                {user}
                                {(content[focusProject].userProject[user] === "ROLE_ADMIN") && 
                                (<img src={Admin} className="adminImg" alt="admin" title="Project admin"/>)}
                            </div>
                        })}
                    </div>
                </div>
                
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

    

    useEffect(() => {
        const username = AuthService.getCurrentUser();
        if (username) {
            setCurrentUser(username);
            setIsAdmin(AuthService.isAdmin());
            async function fetchData() {
                if (localStorage.getItem("access_token") === null) {
                    localStorage.removeItem("username");
                    navigate("/login");
                }
                let valid = await AuthService.checkToken();
                if (valid.includes("Valid")) {
                    await getData(username);
                }
                else {
                    async function refresh() {
                        if (localStorage.getItem("refresh_token")) {
                            let res = await AuthService.refreshToken();
                            if (res) {
                                await getData(username);
                            }
                            else {
                                alert("Session ended1.");
                                navigate("/login");
                            }
                        }
                        else {
                            alert("Session ended2.");
                            await AuthService.logout();
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
                        <div className="nav-item">
                            <img src={Notification} className="notiImg" ref={notiImg} alt="" onClick={onClickNoti}/>
                            {unreadNoti.length > 0 && (
                                <div className="counter">
                                    {unreadNoti.length}
                                </div>
                            )}
                            {unreadNoti.length > 0 && (
                            <div className="notifications" ref={notifications} id="box">
                                <h4>Notifications</h4>
                                {unreadNoti.map((noti, index) => displayNoti(noti, index))}
                            </div>)}

                            {/* <img src={Notification} className="notiImg" alt="" onClick={onClickNoti}/>
                            {unreadNoti.length > 0 && (
                                <div className="counter">
                                    {unreadNoti.length}
                                </div>
                            )}
                            {openNoti && (
                                <div className="notifications">
                                    {unreadNoti.map(noti => displayNoti(noti))}
                                </div>
                            )} */}
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
            <div className="lcontainer">
                {handleLContainer()}
            </div>
            <div className="rcontainer" ref={r_container}>
                {handleRContainer()}
            </div>
            {handleFormWorkEdit()}
        </div>
        <div className="footer">
        </div>
    </>
    );
    
}
export default Home;