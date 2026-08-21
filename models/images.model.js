const mongoose = require("mongoose");
const imageSchema = mongoose.Schema({
    bdsID: mongoose.Schema.ObjectId,
    url: String
})

const Images = mongoose.model("Images",imageSchema,"Images");
module.exports = Images;