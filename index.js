const express = require("express")
const cors = require("cors")
const database = require("./config/database")
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
require("dotenv").config();

database.connect();

// Route
const clientRouter = require("./routes/clients/index.route")
const adminRouter = require("./routes/admin/index.route");
// 
const app = express();
// Để đọc cookie
app.use(cookieParser())
// Cors cho phép fetch từ domain khác
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
// 

// Để nhận được req.body
app.use(express.json());
//Dùng để đọc dữ liệu từ form HTML
app.use(express.urlencoded({ extended: true }));

clientRouter(app);
adminRouter(app);

app.listen(5000,() => {
    console.log("App listening port")
})
