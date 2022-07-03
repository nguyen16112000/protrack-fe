import React from "react";
import { Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap/dist/js/bootstrap.bundle.min";
import "./App.css";

import Login from "./components/Login";
import Recover from "./components/Recover";
import Register from "./components/Register";
import Home from "./components/Home";
import Admin from "./components/Admin";
import CreateProject from "./components/CreateProject";

const App = () => {

  return (
      <div className="container">
        <Routes>
          <Route exact path="/" element={<Login />} />
          <Route exact path="/home" element={<Home />} />
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/recover" element={<Recover />} />
          <Route exact path="/register" element={<Register />} />
          <Route exact path="/admin" element={<Admin />} />
          <Route exact path="/create" element={<CreateProject />} />
        </Routes>
      </div>
  )
}
export default App;