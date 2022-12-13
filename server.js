require("dotenv").config();
const mongoose = require("mongoose");
const cloudinary = require("cloudinary");
// Handling uncaught Error exceptions

const express = require("express");
const errorMiddleware = require("./middlewares/error");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
require("dotenv").config();
app.use(cookieParser());
app.use(
    bodyParser.urlencoded({
        limit: "50mb",
        extended: false,
    })
);
app.use(bodyParser.json({ limit: "50mb" }));

process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to uncaught Error exceptions`);

    process.exit(1);
});
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
const url = process.env.MONGO_URL;

mongoose
    .connect(
        `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.8a7eo.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    )
    .then(() => {
        app.listen(8080, () => {
            console.log("Database connected");
        });
    })
    .catch((err) => {
        console.log(err);
    });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINAY_API_SECRET,
});

//all routes

const userRouter = require("./src/routes/userRoutes");

const conversationRouter = require("./src/routes/conversation");
const messageRouter = require("./src/routes/message");

app.use("/api/v1", userRouter, conversationRouter, messageRouter);
app.get("/", (req, res) => {
    res.json({ message: "hello Fardin" });
});
//middleware for error

const server = app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

// unhandled promise rejection
process.on("unhandledRejection", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to unhandled promise rejection`);
    server.close(() => {
        process.exit(1);
    });
});
app.use(errorMiddleware);
