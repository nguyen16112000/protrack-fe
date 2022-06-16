import React, { Component } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import AuthService from "./services/auth.service";
import Login from "./components/login.component";
import Register from "./components/register.component";
import Home from "./components/home.component";
import Admin from "./components/admin.component";

class App extends Component {
  constructor(props) {
    super(props);
    this.logout = this.logout.bind(this);

    this.state = {
      currentUser: undefined,
      isAdmin: false
    }
  }

  componentDidMount() {
    const username = AuthService.getCurrentUser()

    if (username) {
      this.setState({
        currentUser: username,
        isAdmin: AuthService.isAdmin()
      })
    }
  }

  logout() {
    AuthService.logout();
  }

  render() {
    const {currentUser, isAdmin} = this.state;
    return (
      <Router>
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
                    <a href="/login" className="nav-link" onClick={this.logout}>
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
      </Router>
    )
  }
}

export default App;