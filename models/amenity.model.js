const mongoose = require("mongoose");

const amenitySchema = mongoose.Schema({
    name: String,
    icon: String,
    status: String,
    slug: String,
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date
    }
},{timestamps: true});

const Amenity = mongoose.model("Amenity",amenitySchema,"Amenity");
module.exports = Amenity;