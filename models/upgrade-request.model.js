
const mongoose = require("mongoose");

const upgradeRequestSchema = new mongoose.Schema({
    account_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
        index: true
    },
    business_lisence: {
        type: String,
        required: true
    },
    tax_code: {
        type: String,
        trim: true,
        default: ""
    },
    bank_account: {
        type: String,
        trim: true,
        default: ""
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
        index: true
    },
    admin_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        default: null
    },
    admin_note: {
        type: String,
        trim: true,
        default: ""
    },
    submitted_at: {
        type: Date,
        default: Date.now
    },
    reviewed_at: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("UpgradeRequest", upgradeRequestSchema,"UpgradeRequest");
