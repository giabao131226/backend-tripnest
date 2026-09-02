const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
    title: String,
    icon: String,
    description: String,
    status: String,
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date,
    slug: String
},{
    timestamps: String
})

const Category = mongoose.model("Category",categorySchema,"Categories");

module.exports = Category;