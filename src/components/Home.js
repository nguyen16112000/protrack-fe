import React, { useState, useEffect, useRef } from "react";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import AuthService from "../services/auth.service";
import ProjectService from "../services/project.service";
import UserService from "../services/user.service";

import Form  from "react-validation/build/form"

import Notification from "../notification2.png"
import Admin from "../admin.svg"
import Plus from "../plus.svg"
import Member from "../group.svg";

import { format } from 'date-fns';

import "react-toastify/dist/ReactToastify.css"
import "./Home.css"

toast.configure();

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
    const [file, setFile] = useState(undefined);

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

    const notify = (message, type = "info") => {
        switch(type) {
            case "success":
                toast.success(message)
                break;
            case "warning":
                toast.warn(message)
                break;
            case "error":
                toast.error(message)
                break;
            default:
                toast.info(message)
                break;
        }
    }

    const getData = async (username) => {
        let project = await ProjectService.getProjectsByUsers(username);
        let noti = await UserService.getUnreadNotifications(username);
        setContent(project);
        setUnreadNoti(noti);
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
                notify("Username not found!", "warning");
            }
            else {
                notify("Error occured!", "error");
            }
            window.location.reload();
        }
        else if (e.target.className === "noti-action-no") {
            let response = await UserService.readNotification(currentUser, noti_id, -1);
            if (response.includes("Notification read")) {
                setUnreadNoti(new_unreadNoti);
            }
            else {
                notify("Error occured!", "error");
            }
        }
        else if (e.target.className === "noti-action-read") {
            let response = await UserService.readNotification(currentUser, noti_id, 0);
            if (response.includes("Notification read")) {
                setUnreadNoti(new_unreadNoti);
            }
            else {
                notify("Error occured!", "error");
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
                let isWorkFinished = false
                if (work.f_date !== null || work.approved !== false)
                    isWorkFinished = true
                return (<button 
                        className="work-title" 
                        array-index={index}
                        onClick={onClickWork}
                        style={{height: `calc(100% / ${works.length})`}}
                    >
                    {work.name}
                    {/* {(isWorkFinished) ? ("Yes") : ("No")} */}
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
                let work_time = work.work_time;
                let s = (work.s_date !== null) ? (new Date(work.s_date)) : (null);
                let f = (work.f_date !== null) ? (new Date(work.f_date)) : (null);
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
                

                for (let i = 0; i < dow; i++){
                    occupied[es.getDate() - 1 + i] = 1;
                    if (s === null || f === null && i <= work_time - 1)
                        occupied[es.getDate() - 1 + i] = 2;
                        
                }

                if (s !== null && f !== null) {
                    dow = getDaysOfWork(s, f);
                    if (s > month_last || f < month_start)
                        dow = 0;
                        for (let i = 0; i < dow; i++)
                            occupied[s.getDate() - 1 + i] = 2;
                }
                
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
                        if (occupied[date.date - 1] === 2) {
                            style["background"] = (index % 2) ? ("blue") : ("yellow");
                            title = "Work day"
                        }
                        else if (occupied[date.date - 1] === 1) {
                            style["background"] = (index % 2) ? ("lightblue") : ("lightyellow");
                            title = "Reserved work day"
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
        if (content[index].userProject[currentUser] !== undefined){
            setIsProjectAdmin(content[index].userProject[currentUser].includes("ADMIN"));
        }
            
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

    const b64toBlob = (b64Data, contentType='', sliceSize=512) => {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];
      
        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
          const slice = byteCharacters.slice(offset, offset + sliceSize);
      
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
      
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
      
        const blob = new Blob(byteArrays, {type: contentType});
        return blob;
    }

    const onClickWork = (e) => {
        e.preventDefault();
        let index = e.target.getAttribute("array-index");
        async function getFile() {
            if (content[focusProject].works[index].proof !== null
                && (isProjectAdmin
                || currentUser === content[focusProject].works[index].user)
                ) {
                let proof_file = await ProjectService.getProof(content[focusProject].id, content[focusProject].works[index].id)
                // console.log(proof_file)
                // const blob = new Blob([proof_file.data], { type: "application/octet-stream" });
                const blob = b64toBlob(proof_file.data, "application/octet-stream");
                const url = URL.createObjectURL(blob);
                setFile(url);
                // let file_url = window.URL.createObjectURL(new Blob(proof_file))
                // setFile(file_url);
            }
            else {
                setFile(undefined);
            }
        }
        getFile();

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
            notify("Please enter username to add!", "warning");
        let response = await ProjectService.inviteMember(content[focusProject].id , username)
        if (response.includes("Invited"))
            notify(response);
        else if (response.includes("NOT FOUND"))
            notify("User not found!", "warning");
        else notify(response, "error")
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

    const onChangeFile = (e) => {
        // console.log(e)
        setFile(e.target.files[0])
    }

    const handleBtnWorkEdit = async (e) => {
        e.preventDefault();
        if (e.target.className === "btn-work-update") {
            // console.log(content[focusProject].works[focusWork])
            // console.log(workName)
            // console.log(workDetail)
            // console.log(workESDate)
            // console.log(workLFDate)
            // console.log(worker !== "")
            let response = await ProjectService.updateWork(
                content[focusProject].id,
                content[focusProject].works[focusWork].id,
                workName,
                workDetail,
                workTime,
                workESDate,
                workLFDate,
                worker
            )
            if (response.data) {
                notify(response.data.message, "success")
                content[focusProject].works[focusWork].name = workName;
                content[focusProject].works[focusWork].detail = workDetail;
                content[focusProject].works[focusWork].work_time = workTime;
                content[focusProject].works[focusWork].es_date = workESDate;
                content[focusProject].works[focusWork].lf_date = workLFDate;
                content[focusProject].works[focusWork].user = worker;
            }
            else {
                notify("Error occured!", "error")
            }
            setTriggerRender(!triggerRender)
        }
        else if (e.target.className === "btn-work-start") {
            let response = await ProjectService.startWork(content[focusProject].id,
                content[focusProject].works[focusWork].id)
            
            if (response.data) {
                if (response.data.message === "Work started") {
                    notify(response.data.message, "success")
                    content[focusProject].works[focusWork].s_date = response.data.data.s_date;
                }
                else {
                    if (content[focusProject].works[focusWork].user === "")
                        notify(response.data.message + "\nWork isn't assigned to anyone.", "warning");
                    else
                    notify(response.data.message + "\nPrevious works hasn't finfished.", "warning");
                }
                    
            }
            else {
                notify("Error occured!", "error")
            }
        }
        else if (e.target.className === "btn-work-submit") {
            if (file === undefined) {
                notify("Please add file before submit.", "warning");
                return;
            }
            let response = await ProjectService.setProof(
                file,
                content[focusProject].id,
                content[focusProject].works[focusWork].id)
            if (response === "File too large to submit") {
                notify(response, "warning");
                return;
            }
            if (response.data.status === "OK") {
                notify("Proof submitted", "success");
            }
            else {
                notify("Error occured!", "error")
            }
        }
        else if (e.target.className === "btn-work-accept") {
            let response = await ProjectService.approveWork(
                content[focusProject].id,
                content[focusProject].works[focusWork].id,
                1
            )
            if (response.data.message.includes("Success")) {
                notify("Approved", "success");
                content[focusProject].works[focusWork].approved = true;
                content[focusProject].works[focusWork].f_date = response.data.data.f_date;
            }
            else {
                notify("Error occured!", "error")
            }
        }
        else if (e.target.className === "btn-work-decline") {
            let response = await ProjectService.approveWork(
                content[focusProject].id,
                content[focusProject].works[focusWork].id,
                0
            )
            if (response.data.message.includes("Success")) {
                notify("Declined", "success");
                content[focusProject].works[focusWork].proof = null;
            }
            else {
                notify("Error occured!", "error")
            }
        }
        r_container.current.classList.toggle("active");
        formWorkEdit.current.classList.toggle("active");
    }

    const handleEditSubmit = (e) => {
        e.preventDefault();
        console.log(e);
    }

    const dateToText = (date) => {
        let new_date = new Date(date)
        return format(new_date, "MM/dd/yyyy");
    }

    const handleFormWorkEdit = () => {
        if (focusProject === -1 || focusWork === -1)
            return <></>
        let isWorkStarted = false;
        let isWorkFinished = false;
        let date_now = new Date(Date.now())
        if (workSDate && workSDate <= format(date_now, "yyyy-MM-dd"))
            isWorkStarted = true
        if (workFDate || content[focusProject].works[focusWork].approved !== false)
            isWorkFinished = true
        let work_before = content[focusProject].works[focusWork].work_before;
        let members = Object.keys(content[focusProject].userProject);

        let displayBtnUpdate = {display: (isProjectAdmin) && (!isWorkStarted) ? ("initial") : ("none")};
        let displayBtnStart = {display: (isProjectAdmin || worker === currentUser) && (!isWorkStarted) ? ("initial") : ("none")};
        let displayBtnApprove = {display: (isProjectAdmin && content[focusProject].works[focusWork].proof !== null) && (isWorkStarted) ? ("initial") : ("none")};
        let displayBtnSubmit = {display: (worker === currentUser && isWorkStarted) ? ("initial") : ("none")};
        if (isWorkFinished) {
            displayBtnUpdate = {display: "none"}
            displayBtnStart = {display: "none"}
            displayBtnApprove = {display: "none"}
            displayBtnSubmit = {display: "none"}
        }
        let displayProof = {
            display: 
            (content[focusProject].works[focusWork].proof !== null && isProjectAdmin) 
            || (worker === currentUser) 
            ? ("initial") 
            : ("none"),
        }


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

                {Object.values(work_before).length > 0 && (
                    <div className="work-detail">
                        <label htmlFor="work-before">Previous work(s):</label>
                        <div className="work-before form-control" style={{whiteSpace: "break-spaces"}}>
                            {Object.values(work_before).map((work, index) => {
                                if (Object.values(work_before).length === 1)
                                    return work;
                                else
                                    return `${index + 1}/ ${work} \n`;
                            })}
                        </div>
                    </div>
                )}
                
                
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
                            value={(workSDate === null) ? ("Havene't started") : (dateToText(workSDate))}
                            disabled
                        />
                    </div>
                    <div className="form-col">
                        {(isWorkFinished ? (
                            <>
                            <label htmlFor="work-f-date">Finish:</label>
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
                <div className="work-detail" style={displayProof}>
                    <label htmlFor="work-proof" style={{width: "50px"}}>Proof:</label>
                    {(content[focusProject].works[focusWork].proof === null) ? (
                        <input 
                            type="file" 
                            className="work-proof form-control"
                            onChange={onChangeFile}
                        />
                    ) : (
                        <a href={file} className="work-proof form-control" download={content[focusProject].works[focusWork].proof}>Click to download</a>
                    )
                    }   
                </div>
                <div className="form-row" style={{marginTop: "10px"}}>
                    <button className="btn-work-update" onClick={handleBtnWorkEdit} style={displayBtnUpdate}>Update</button>
                    <button className="btn-work-start" onClick={handleBtnWorkEdit} style={displayBtnStart}>Start</button>
                    <button className="btn-work-submit" onClick={handleBtnWorkEdit} style={displayBtnSubmit}>Submit</button>
                    <button className="btn-work-accept" onClick={handleBtnWorkEdit} style={displayBtnApprove}>Accept</button>
                    <button className="btn-work-decline" onClick={handleBtnWorkEdit} style={displayBtnApprove}>Decline</button>
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
                                alert("Session ended.");
                                navigate("/login");
                            }
                        }
                        else {
                            alert("Session ended.");
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
                {/* {isAdmin && (
                    <a href={"/admin"} className="navbar-brand">
                    Admin
                    </a>
                )} */}
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