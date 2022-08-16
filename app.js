const express = require("express");
const errorMiddleware = require("./middlewares/error");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
require("dotenv").config();
app.use(
    cors({
        origin: [
            "https://lyceum-frontend-git-main-fardinoa.vercel.app",
            "https://lyceum-frontend.vercel.app",
            "https://lyceum-frontend-fardinoa.vercel.app",
            "http://localhost:3000",
        ],
        credentials: true,
    })
);

//////////////////////////////

// config

require("dotenv").config();

app.use(cookieParser());
app.use(
    bodyParser.urlencoded({
        limit: "50mb",
        extended: false,
    })
);
app.use(bodyParser.json({ limit: "50mb" }));
//all routes

const userRouter = require("./src/routes/userRoutes");

app.use("/api/v1", userRouter);
app.get("/", (req, res) => {
    res.json({ message: "hello Fardin" });
});
//middleware for error
app.use(errorMiddleware);
module.exports = app;
