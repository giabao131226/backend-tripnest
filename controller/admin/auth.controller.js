const AdminAccount = require("../../models/adminAccount.model");
const md5 = require('md5');
const jwt = require("jsonwebtoken");
const { jwtDecode } = require("jwt-decode");

// [POST] "/admin/auth/login"
module.exports.login = async (req, res) => {
    try {
        const { userName, password } = req.body;

        const encodePassword = password;

        const result = await AdminAccount.findOne({
            "userName": userName,
            "password": encodePassword,
            "status": "active",
            "deleted": false
        }).select("-password");

        if (!result) return res.json({ "success": false });

        const token = jwt.sign({
            "userName": result.userName,
            "_id": result._id,
            "status": result.status,
            "deleted": result.deleted,
            "role_id": result.role_id
        }, process.env.SECRET_KEY_JWT, { "expiresIn": "1d" });

        res.cookie("tokenAdmin", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });
        return res.json({ "success": true,"user": result });
    } catch (ex) {
        console.log("Lỗi tại auth.controller: " + ex);
        return res.json({ "success": false });
    }
}

// [GET] "/admin/auth/getInfo"
module.exports.getInfo = async (req,res) => {
    try{
        const tokenAdmin = req.cookies.tokenAdmin;
        if(!tokenAdmin) return res.status(401).json({"success": false,"message": "Bạn phải đăng nhập trước đã"});
        const decoded = jwtDecode(tokenAdmin);
        const user = await AdminAccount.findOne({"_id": decoded._id,"status": "active","deleted": false});
        return res.json({"success": true,"user": user});
    }catch(ex){
        console.log("Có lỗi xảy ra khi lấy thông tin người dùng: "+ex);
    }
}