const app = require("./app");
require("dotenv").config();
const mongoose = require("mongoose");
const cloudinary = require("cloudinary");
// Handling uncaught Error exceptions
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to uncaught Error exceptions`);

    process.exit(1);
});

//connect database
const url = process.env.MONGO_URL;

// mongoose
//     .connect(url, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//     })
//     .then((data) => {
//         console.log(`Mongo db connected with server ${data.connection.host}`);
//     });

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
