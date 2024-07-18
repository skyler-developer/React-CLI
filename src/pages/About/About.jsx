import React, { useState, useEffect } from "react";

function About() {
    const [time, setTime] = useState(false);
    useEffect(() => {
        setTimeout(() => {
            setTime(true);
        }, 2000);
    }, []);
    if (time) return <h2>About</h2>;
}

export default About;
