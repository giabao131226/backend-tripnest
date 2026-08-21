const mongoose = require("mongoose");
const wardSchema = mongoose.Schema({
    province_id: String,
    name: String,
    code: String,
    status: String
});

const Ward = mongoose.model("Ward",wardSchema,"Ward");
module.exports = Ward;