import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Form  from "react-validation/build/form"
import Input  from "react-validation/build/input"
import CheckButton  from "react-validation/build/button"

import AuthService from "../services/auth.service"

import "bootstrap/dist/css/bootstrap.min.css";
import "./Login.css";

const required = value => {
    if (!value) {
        return (
            <div className="alert alert-danger" role="alert">
                This field is required!
            </div>
        );
    }
};

const Login = () => {
    let navigate = useNavigate();
    const form = useRef();
    const checkBtn = useRef();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const onChangeUsername = (e) => {
        const username = e.target.value;
        setUsername(username);
    }

    const onChangePassword = (e) => {
        const password = e.target.value;
        setPassword(password);
    };

    const handleLogin = (e) => {
        e.preventDefault();

        setMessage("");
        setLoading(true);

        form.current.validateAll();

        if (checkBtn.current.context._errors.length === 0) {
            AuthService.login(username, password).then(
                () => {
                    // navigate("/home");
                    // window.location.reload();
                    setTimeout(() => {
                        navigate("/home");
                    }, 1000);
                },
                error => {
                    const resMessage = 
                        (error.response && error.response.data && error.response.data.message)
                        || error.message
                        || error.toString();

                    setLoading(false);
                    setMessage(resMessage);
                }
            );
        }
        else {
            setLoading(false);
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

                    <Form className="form-login" onSubmit={handleLogin} ref={form}>
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
                            <label htmlFor="password">Password</label>
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
                                className="btn-login btn-primary btn-block"
                                disabled={loading}
                            >
                                {loading && (
                                    <span className="spinner-border spinner-border-sm"></span>
                                )}
                                <span>Login</span>
                            </button>
                        </div>

                        {message && (
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
export default Login;
