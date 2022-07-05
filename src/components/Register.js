import React, { useState, useRef, useEffect } from "react";
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import { isEmail } from 'validator';

import AuthService from "../services/auth.service";

import ProfileImg from "../avatar.png";

import "bootstrap/dist/css/bootstrap.min.css";
import "./Register.css";

toast.configure()
const required = (value) => {
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
  }

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


const Register = () => {
    let navigate = useNavigate();
    const form = useRef();
    const checkBtn = useRef();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
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
    const onChangeEmail = (e) => {
        const email = e.target.value;
        setEmail(email);
    };
    const onChangePhone = (e) => {
        const phone = e.target.value;
        setPhone(phone);
    };

    const handleRegister = (e) => {
        e.preventDefault();
        setMessage("");
        setSuccessful(false);

        form.current.validateAll();

        if (checkBtn.current.context._errors.length === 0) {
            AuthService.register(username, password).then(
                (response) => {
                    notify("Register success. Redirect to login.");
                    setSuccessful(true);
                    setTimeout(() => {
                        navigate("/login");
                    }, 2000);
                    
                },
                error => {
                    const resMessage = 
                        (error.response && error.response.data && error.response.data.message)
                        || error.message
                        || error.toString();
                    // setMessage(resMessage);
                    notify(resMessage, "error");
                    setSuccessful(false);
                }
            );
        }
    }

    useEffect(() => {
        const username = AuthService.getCurrentUser();
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

                        <CheckButton style={{display: "none"}} ref={checkBtn} />
                    </Form>
                </div>
            </div>
        </>
    )

}
export default Register;