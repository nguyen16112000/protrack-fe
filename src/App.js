import React, { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import AuthService from "./services/auth.service";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import Admin from "./components/Admin";

const App = () => {
  const [currentUser, setCurrentUser] = useState(undefined)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const username = AuthService.getCurrentUser();
    if (username) {
      setCurrentUser(username);
      setIsAdmin(AuthService.isAdmin())
    }
  }, [])

  const logout = () => {
    AuthService.logout();
  }

  return (
    <div>
      <nav className="navbar navbar-expand navbar-dark bg-dark">
        <Link to={"/"} className="navbar-brand">
          Protrack
        </Link>
        <div className="navbar-nav mr-auto">
          {isAdmin && (
            <li className="nav-item">
              <Link to={"/"} className="navbar-link">
                Admin
              </Link>
            </li>
          )}
          {currentUser ? (
            <div>
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
            <div className="navbar-nav ml-auto">
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

      <div className="container mt-3">
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/register" element={<Register />} />
          <Route exact path="/admin" element={<Admin />} />
        </Routes>
      </div>

    </div>
  )
}
export default App;