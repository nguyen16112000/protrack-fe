import React, { useState, useRef } from "react";
import { Link, useNavigate } from 'react-router-dom';
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";

import AuthService from "../services/auth.service";

import "bootstrap/dist/css/bootstrap.min.css";
import "./Register.css";

const required = (value) => {
    if (!value) {
        return (
            <div className="alert alert-danger" role="alert">
                This field is required!
            </div>
        );
    }
};

const fusername = (value) => {
    if (value.length < 3 || value.length > 20) {
        return (
            <div className="alert alert-danger" role="alert">
                The username must be between 3 and 20 characters.
            </div>
        );
    }
};

const fpassword = (value) => {
    if (value.length < 4 || value.length > 40) {
        return (
            <div className="alert alert-danger" role="alert">
                The password must be between 4 and 40 characters.
            </div>
        );
    }
};

const Register = () => {
    let navigate = useNavigate();
    const form = useRef();
    const checkBtn = useRef();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [successful, setSuccessful] = useState(false);
    const [message, setMessage] = useState("");
    const onChangeUsername = (e) => {
        const username = e.target.value;
        setUsername(username);
    };
    const onChangePassword = (e) => {
        const password = e.target.value;
        setPassword(password);
    };

    const handleRegister = (e) => {
        e.preventDefault();
        setMessage("");
        setSuccessful(false);

        form.current.validateAll();

        if (checkBtn.current.context._errors.length === 0) {
            AuthService.register(username, password).then(
                (response) => {
                    setMessage(response.message);
                    setSuccessful(true);
                    setTimeout(() => {
                        navigate("/login");
                        window.location.reload();
                    }, 2000);
                    
                },
                error => {
                    const resMessage = 
                        (error.response && error.response.data && error.response.data.message)
                        || error.message
                        || error.toString();
                    setMessage(resMessage);
                    setSuccessful(false);
                }
            );
        }
    }

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
                        src="//ssl.gstatic.com/accounts/ui/avatar_2x.png"
                        alt="profile-img"
                        className="profile-img-card"
                    />
                    <Form className="form-register"onSubmit={handleRegister} ref={form}>
                        {!successful && (
                            <>
                                <div className="form-group">
                                    <label htmlFor="username">Username</label>
                                    <Input
                                        type="text"
                                        className="form-control"
                                        name="username"
                                        value={username}
                                        onChange={onChangeUsername}
                                        validations={[required, fusername]}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="password">Password</label>
                                    <Input
                                        type="password"
                                        className="form-control"
                                        name="password"
                                        value={password}
                                        onChange={onChangePassword}
                                        validations={[required, fpassword]}
                                    />
                                </div>

                                <div className="form-group">
                                    <button className="btn-register btn-primary btn-block">Register</button>
                                </div>
                            </>
                        )}

                        {message && (
                            <div className="form-group">
                                <div
                                    className={
                                        successful
                                        ? "alert alert-success"
                                        : "alert alert-danger"
                                    }
                                    role="alert"
                                >
                                    {message}
                                </div>
                            </div>
                        )}

                        <CheckButton style={{display: "none"}} ref={checkBtn} />
                    </Form>
                </div>
            </div>
        </>
    )

}
export default Register;