import React, { useState, useEffect } from "react";

const Home = () => {
    const [content, setContent] = useState("");
    useEffect(() => {
        setContent("Home");
    }, []);
    
    return (
        <div className="container">
            <header className="jumbotron">
                <h3>{content}</h3>
            </header>
        </div>
    );
    
}
export default Home;