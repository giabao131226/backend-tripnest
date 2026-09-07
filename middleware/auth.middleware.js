const { jwtDecode } = require("jwt-decode");
const Account = require("../models/account.model");

module.exports.authAdmin = async (req,res,next) => {
    try{
        const tokenAdmin = req.cookies.tokenAdmin;
        const decoded = jwtDecode(tokenAdmin);
        if(!decoded) throw new Error();
        req.admin = decoded;
        next();
    }catch(ex){
        console.log("Có lỗi tại middleware authenticate.authAdmin: "+ex);
        return res.status("401").json({
            "success": false,
            "message": "Unthorization"
        })
    }
}

module.exports.auth = async (req,res,next) => {
     try{
        const token = req.cookies.tokenUser;
        const user = await Account.findOne({"tokenUser": token,"deleted": false,"status": "active"});
        if(!user) throw new Error();
        req.user = user;
        next();
    }catch(ex){
        console.log("Có lỗi tại middleware authenticate.auth: "+ex);
        return res.status("401").json({
            "success": false,
            "message": "Unthorization"
        })
    }
}