import React from "react";

function Message() {
    import( /* webpackChunkName: "count" */ "./count").then(({ count }) => {
        console.log(count(1, 2));
    });
    return <div>message</div>;
}

export default Message;
