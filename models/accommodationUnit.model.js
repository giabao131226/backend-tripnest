const mongoose = require("mongoose");

const accommodationUnitSchema = mongoose.Schema({
    accommodation_id: String,
    title: String,
    description: String,
    room_size: Number,
    price_per_night: Number,
    max_guests: Number,
    cleaning_fee: Number,
    service_fee_percent: Number,
    bedrooms_count: Number,
    beds_count: Number,
    bathrooms_count: Number,
    total_inventory: Number,
    rating: Number,
    status: String,
    deleted_at: Date,
    total_room: Number,
    deleted: {
        type: Boolean,
        default: false
    },
    is_guest_favorite: {
        type: Boolean,
        default: false
    },
    slug:{
        type: String,
        default: ""
    }
},{
    timestamps: true
});

const AccommodationUnit = mongoose.model("AccommodationUnit",accommodationUnitSchema,"AccommodationUnit");
module.exports = AccommodationUnit;