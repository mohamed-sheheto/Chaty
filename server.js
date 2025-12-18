const express =require("express")
const mongoose = require("mongoose")
require("dotenv").config({quiet: true, path: "./.env"})
const app = express()

const port = process.env.PORT || 8000
const URI = process.env.MONGO_URI


mongoose.connect(URI).then(() => {
    console.log("Database connected successfully");
    app.listen(port, () => {
      console.log(`App is running on port ${port}`);
    });
}).catch((err) => {
    console.log(err);
});
