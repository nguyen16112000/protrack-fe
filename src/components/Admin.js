import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserService from "../services/user.service";
import AuthService from "../services/auth.service";

import Notification from "../notification2.png"


// need development
const Admin = () => {
    const [content, setContent] = useState([]);
    const [currentUser, setCurrentUser] = useState("")
    const [isAdmin, setIsAdmin] = useState(false)
    const [unreadNoti, setUnreadNoti] = useState([])
    const navigate = useNavigate();

    const logout = () => {
        AuthService.logout();
    }
    
    const onClickNoti = () => {

    }

    const onClickAppIcon = () => {
        if (currentUser) {
            navigate("/home")
        }
        else {
            navigate("/login")
        }
    }

    const getData = async (username) => {
        let noti = await UserService.getUnreadNotifications(username);
        setUnreadNoti(noti);
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
                            localStorage.removeItem("username");
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
    }, [navigate])
    
    return (
        <>
            <nav className="navbar navbar-expand navbar-dark bg-dark">
                <div className="navbar-brand" onClick={onClickAppIcon}>
                    Protrack
                </div>
                <div className="narbar-nav me-auto">
                    {isAdmin && (
                        <Link to={"/admin"} className="navbar-brand">
                        Admin
                        </Link>
                    )}
                </div>

                <div className="navbar-nav ms-auto">
                    {currentUser ? (
                        <div className="navbar-nav ms-auto">
                        <li className="icon" onClick={onClickNoti}>
                            <img src={Notification} className="notiImg" alt="" />
                            {unreadNoti.length > 0 && (
                            <div className="counter">
                            {unreadNoti.length}
                            </div>
                        )}
                        </li>
                        <li className="nav-item">
                            {currentUser}
                        </li>
                        <li className="nav-item">
                            <a href="/login" className="nav-link" onClick={logout}>
                            Logout
                            </a>
                        </li>
                        </div>
                    ) : (
                        <div className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link to={"/login"} className="nav-link">
                            Login
                            </Link>
                        </li>
                        <li className="nav-item">
                        <Link to={"/register"} className="nav-link">
                            Register
                            </Link>
                        </li>
                        </div>
                    )}
                </div>
            </nav>
            <div className="container">
                    <h3>{content}</h3>
            </div>
        </>
    );
    
}
export default Admin;