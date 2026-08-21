
const express = require("express")
const router = express.Router();
const controller = require("../../controller/clients/account.controller")
const cloudinary = require("cloudinary");
const multer = require("multer");
const upload = multer({"dest": "uploads/"});

cloudinary.config({
    cloud_name: "dnlcvjrnb",
    api_key: "345477329557222",
    api_secret: "FY8lP8RMpVvfypM7WcbmXukKbeA"
});

router.get("/auth",controller.getInfo)
router.post("/sign-in",controller.signIn)
router.post("/sign-up",controller.signUp)
router.post("/logout",controller.logOut)
router.patch("/update-account/:id",upload.fields([
    {name: "avatar",maxCount: 1},
    {name: "business_lisence",maxCount:1}
]),
    async (req,res,next) => {
        try{
            if(req.files){
                if(req.files.avatar){
                    const result = await cloudinary.uploader.upload(req.files.avatar[0].path);
                    req.body.avatar = result.secure_url;
                }
                if(req.files.business_lisence){
                    const result = await cloudinary.uploader.upload(req.files.business_lisence[0].path);
                    req.body.business_lisence = result.secure_url;
                }
            }
            next();
        }catch(ex){
            console.log("Có lỗi xảy ra khi cập nhật ảnh: "+ex);
            return res.json({"success": false});
        }
    }
,controller.updateAccount);

module.exports = router;