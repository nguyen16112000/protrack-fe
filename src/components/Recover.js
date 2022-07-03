import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Form  from "react-validation/build/form"
import Input  from "react-validation/build/input"
import CheckButton  from "react-validation/build/button"
import { isEmail } from 'validator';

import AuthService from "../services/auth.service"

import ProfileImg from "../avatar.png";

import "bootstrap/dist/css/bootstrap.min.css";
import "./Recover.css";

const required = value => {
    if (!value) {
        return (
            <div className="alert alert-danger" role="alert">
                This field is required!
            </div>
        );
    }
};
const emailFormat = (value) => {
    if (!isEmail(value)) {
        return <small className="form-text text-danger">Invalid email format</small>;
    }
};

const Recover = () => {
    let navigate = useNavigate();
    const form = useRef();
    const checkBtn = useRef();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(false);
    const [message, setMessage] = useState("");

    const onChangeUsername = (e) => {
        const username = e.target.value;
        setUsername(username);
    }

    const onChangePassword = (e) => {
        const password = e.target.value;
        setPassword(password);
    };
    const onChangeEmail = (e) => {
        const email = e.target.value;
        setEmail(email);
    };
    const onChangePhone = (e) => {
        const phone = e.target.value;
        setPhone(phone);
    };

    const handleRecover = (e) => {
        e.preventDefault();

        setMessage("");
        setLoading(true);
        setStatus(false);

        form.current.validateAll();

        if (checkBtn.current.context._errors.length === 0) {
            AuthService.recover(username, password, email, phone).then(
                (response) => {
                    setLoading(false);
                    setMessage("Recover successful.");
                    setStatus(true);
                    setTimeout(() => {
                        navigate("/home");
                    }, 2000);
                },
                error => {
                    let resMessage = 
                        (error.response && error.response.data && error.response.data.message)
                        || error.message
                        || error.toString();
                    if (resMessage === "BAD REQUEST")
                        resMessage = "Incorrect infomations."

                    setLoading(false);
                    setMessage(resMessage);
                }
            );
        }
        else {
            setLoading(false);
        }
    }

    useEffect(() => {
        const username = AuthService.getCurrentUser();
        console.log(username)
        if (username !== null) {
            navigate("/home")
        }
    }, [navigate])

    return (
        <>
            <nav className="navbar navbar-expand navbar-dark bg-dark">
                <Link to={"/"} className="navbar-brand">
                    Protrack
                </Link>

                <div className="navbar-nav ms-auto">
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
                </div>
            </nav>
            <div className="col-md-12">
                <div className="card card-container">
                    <img
                        src={ProfileImg}
                        alt="profile-img"
                        className="profile-img-card"
                    />

                    <Form className="form-recover" onSubmit={handleRecover} ref={form}>
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <Input
                                type="text"
                                className="form-control"
                                name="username"
                                value={username}
                                onChange={onChangeUsername}
                                validations={[required]}
                            />
                        </div>

                        <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <Input
                                        type="text"
                                        className="form-control"
                                        name="email"
                                        value={email}
                                        onChange={onChangeEmail}
                                        validations={[required, emailFormat]}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phone">Phone</label>
                                    <Input
                                        type="text"
                                        className="form-control"
                                        name="phone"
                                        value={phone}
                                        onChange={onChangePhone}
                                        validations={[required]}
                                    />
                                </div>

                        <div className="form-group">
                            <label htmlFor="password">New password</label>
                            <Input
                                type="password"
                                className="form-control"
                                name="password"
                                value={password}
                                onChange={onChangePassword}
                                validations={[required]}
                            />
                        </div>

                        <div className="form-group">
                            <button 
                                className="btn-recover btn-primary btn-block"
                                disabled={loading}
                            >
                                {loading && (
                                    <span className="spinner-border spinner-border-sm"></span>
                                )}
                                <span>Recover</span>
                            </button>
                        </div>

                        {message && status && (
                            <div className="form-group">
                                <div className="alert alert-success" role="alert">
                                    {message}
                                </div>
                            </div>
                        )}

                        {message && !status && (
                            <div className="form-group">
                                <div className="alert alert-danger" role="alert">
                                    {message}
                                </div>
                            </div>
                        )}

                        <CheckButton style={{display: "none"}} ref={checkBtn} />
                    </Form>
                </div>
            </div>
        </>
    );
}
export default Recover;
