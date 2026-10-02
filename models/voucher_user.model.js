
const mongoose = require("mongoose");

const voucherUserSchema = new mongoose.Schema(
    {
        voucher_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Voucher",
            required: true
        },

        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account",
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("VoucherUser", voucherUserSchema);
