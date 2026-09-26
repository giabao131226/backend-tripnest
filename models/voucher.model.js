const mongoose = require("mongoose")
const voucherSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    discount_type: {
        type: String,
        enum: ["percent", "fixed"],
        required: true
    },
    discount_value: {
        type: Number,
        required: true,
        min: 0
    },
    max_discount: {
        type: Number,
        default: null,
        min: 0
    },
    min_order_value: {
        type: Number,
        default: 0,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    used_count: {
        type: Number,
        default: 0,
        min: 0
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    },
    apply_scope: {
        type: String,
        enum: ["all", "specific_users"],
        default: "all"
    },
    user_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        default: []
    }]
    ,
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    }
},{timestamps: true});

const Voucher = mongoose.model("Voucher", voucherSchema,"Voucher");

module.exports = Voucher;