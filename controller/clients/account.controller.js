const jwt = require("jsonwebtoken")
const Account = require("../../models/account.model")
const validate = require("../../helpers/validate.helper")

module.exports.signUp = async (req,res) => {
    const payload = {
        "username": req.body.username,
        "password": req.body.password,
        "email": req.body.email,
        "phone": req.body.phone,
        "role": "qtv"
    }
    const errors = {};

    if(!validate.validateName(payload.username)){
        errors.userName = "Invalid username. Username must start with a letter or underscore, and be 6-20 characters long containing only letters, numbers, or underscores."
    }
    if(!validate.validatePassword(payload.password)){
        errors.password = "Invalid password. Password must be 6-20 characters long and can include letters, numbers, and special characters."
    }
    if(!validate.validateEmail(payload.email)){
        errors.email = "Invalid email format. Please enter a valid email address (e.g., example@domain.com)."
    }
    if(!validate.validatePhone(payload.phone)){
        errors.phone = "Invalid phone number. It must start with 0 or +84 and contain 10 digits."
    }
    if(payload.password != req.body.confirmPassword){
        errors.confirmPassword = "Confirm password does not match the password."
    }

    if(Object.keys(errors).length > 0 ){
        return res.json({
            "success": false,
            "errorsValidate": errors 
        })
    }
    const tokenUser = jwt.sign({"username": payload.username,
                            "password": payload.password,
                            "email": payload.email,
                            "phone": payload.phone
                        },"chiakhoabimat",{expiresIn: "24h"});

    payload.tokenUser = tokenUser;
    const account = await Account.create(payload);
    return res.json({
        "success": true,
        "message": "Đăng ký thành công"
    })

}


module.exports.signIn = async (req,res) => {
    const {userName,password} = req.body;
    const errors = {}

    if(!validate.validateName(userName)){
        errors.userName = "Invalid username. Username must start with a letter or underscore, and be 6-20 characters long containing only letters, numbers, or underscores."
    }
    if(!validate.validatePassword(password)){
        errors.password = "Invalid password. Password must be 6-20 characters long and can include letters, numbers, and special characters."
    }

    if(Object.keys(errors).length > 0 ){
        return res.json({
            "success": false,
            "errorsValidate": errors 
        })
    }

    const account = await Account.findOne({"username": userName,"password": password}).select("-password")
    if(!account || account === null){
        return res.json({
            "success": false,
            "message": "Invalid username or password."
        })
    }
    res.cookie("tokenUser",account.tokenUser,{
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000
    })

    return res.json({
        "success": true,
        "user": account
    })
}

// [GET] "/auth"
module.exports.getInfo = async (req,res) => {
    try{
        const tokenUser = req.cookies.tokenUser;
        if(!tokenUser.toString().trim()){
            return res.json({"success": false,"message": "Không có token user"});
        }
        const user = await Account.findOne({"tokenUser": tokenUser}).select("-password");
        return res.json({"success": true,"user": user});

    }catch(ex){
        console.log("Có lỗi xảy ra khi lấy thông tin người dùng: "+ex);
        return res.json({"success": false});
    }
}

// [POST] "/account/logout"
module.exports.logOut = (req,res) => {
    res.clearCookie("tokenUser");
    return res.json({"success": true});
}

// [PATCH] "/account/update-account/:id"
module.exports.updateAccount = async (req,res) => {
    try{
        console.log(req.body);
        const id = req.params.id;
        // validate
        // end validate

        const result = await Account.updateOne({"_id": id},{...req.body});
        return res.json({"success": true,"newInfo": req.body});
    }catch(ex){
        console.log("Có lỗi khi cập nhật thông tin tài khoản: "+ex);
        return res.json({"success": false});
    }
}