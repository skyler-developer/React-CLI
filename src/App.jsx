import React, { Suspense, lazy, useState, useEffect } from "react";
import Home from "./pages/Home/Home";
const About = lazy(() => import(/* webpackChunkName:"aboutAAA" */ "./pages/About/About"));
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
                <Route
                    path="about"
                    element={
                        <Suspense fallback={<h1>Loading...</h1>}>
                            <About />
                        </Suspense>
                    }
                />
            </Routes>
        </>
    );
}

export default App;
