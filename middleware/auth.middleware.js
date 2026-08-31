const { jwtDecode } = require("jwt-decode");

module.exports.authAdmin = async (req,res,next) => {
    try{
        const tokenAdmin = req.cookies.tokenAdmin;
        const decoded = jwtDecode(tokenAdmin);
        if(!decoded) throw new Error();
        req.admin = decoded;
        next();
    }catch(ex){
        console.log("Có lỗi tại middleware authenticate.auth: "+ex);
        return res.status("401").json({
            "success": false,
            "message": "Unthorization"
        })
    }
}