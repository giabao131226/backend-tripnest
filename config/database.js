const mongoose = require("mongoose")

module.exports.connect = async () => {
    try {
        await mongoose.connect("mongodb+srv://dobao13122006_db_user:baosom2006@cluster0.m6u2rlf.mongodb.net/TripNest")
        console.log("Connect Success!")
    } catch (error){
        console.log("Connect Error!")
    }
}