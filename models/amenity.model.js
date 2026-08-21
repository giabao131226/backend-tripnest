const mongoose = require("mongoose");

const amenitySchema = mongoose.Schema({
    name: String,
    icon: String,
    status: String,
    slug: String
});

const Amenity = mongoose.model("Amenity",amenitySchema,"Amenity");
module.exports = Amenity;