const mongoose = require("mongoose");
const adminAccountSchema = mongoose.Schema({
    userName: String,
    password: String,
    email: String,
    role_id: {
        type: String,
        default: ""
    },
    avatar: {
        type: String,
        default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0FBXjk6UkoA06_Ri_SVw8jspA5Wlm5lw7GWLstVQmbA&s=10"
    }
},{
    timestamps: true
});

const AdminAccount = mongoose.model("AdminAccount",adminAccountSchema,"AdminAccount");
module.exports = AdminAccount;