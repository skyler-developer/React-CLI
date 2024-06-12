import React from "react";
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import { Link, Routes, Route } from "react-router-dom";

function App() {
    return (
        <>
            {/* <Home /> */}
            <h1>App</h1>
            <ul>
                <li>
                    <Link to="/home">Home</Link>
                </li>
                <li>
                    <Link to="/about">About</Link>
                </li>
            </ul>
            <Routes>
                <Route path="home" element={<Home />} />
                <Route path="about" element={<About />} />
            </Routes>
        </>
    );
}

export default App;
