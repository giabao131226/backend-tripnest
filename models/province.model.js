const mongoose = require("mongoose");
const provinceSchema = mongoose.Schema({
    name: String,
    code: String,
    status: String
})

const Province = mongoose.model("Province",provinceSchema,"Province");
module.exports = Province;