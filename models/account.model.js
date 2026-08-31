const mongoose = require('mongoose')

const accountSchema = mongoose.Schema({
    username: String,
    password:String,
    status: String,
    CCCD: String,
    phone: String,
    email: String,
    role: String,
    tokenUser: String,
    avatar: String,
    business_lisence: String,
    stk: String,
    tax_code: String,
    full_name: String,
    gender: String,
    date_of_birth: Date,
    id_card_front: String,
    id_card_back: String,
    bio: String,
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date
},{
    timestamps: true
})

const Account = mongoose.model("Account",accountSchema,"account")
module.exports = Account;
