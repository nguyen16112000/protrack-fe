import React, { useState, useEffect } from "react";

const Admin = () => {
    const [content, setContent] = useState("");
    useEffect(() => {
        setContent("Admin");
    }, [])
    
    return (
        <div className="container">
            <header className="jumbotron">
                <h3>{content}</h3>
            </header>
        </div>
    );
    
}
export default Admin;