const mongoose = require("mongoose");
const bdsSchema = mongoose.Schema({
    name: String,
    price: Number,
    category_id: {
        type: mongoose.Schema.ObjectId,
        ref: "Category"
    },
    rate: Number,
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account"
    },
    status: String,
    description: String,
    amenityIds: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Amenity"
        }
    ],
    images: Array,
    lisence: String,
    deleted: {
        type: Boolean,
        default: false
    },
    slug: String,
    province_id: {
        type: mongoose.Schema.ObjectId,
        default: null,
        ref: "Province"
    },
    ward_id: {
        type: mongoose.Schema.ObjectId,
        default: null,
        ref: "Ward"
    },
    address: String,
    slug: String
},{
    timestamps: true
});

const BDS = mongoose.model("BDS",bdsSchema,"BDS");

module.exports = BDS;