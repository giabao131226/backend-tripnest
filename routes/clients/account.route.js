const express = require("express")
const router = express.Router();
const controller = require("../../controller/clients/account.controller")
const cloudinary = require("cloudinary");
const multer = require("multer");
const upload = multer({"dest": "uploads/"});
const authMiddleWare = require("../../middleware/auth.middleware");

cloudinary.config({
    cloud_name: "dnlcvjrnb",
    api_key: "345477329557222",
    api_secret: "FY8lP8RMpVvfypM7WcbmXukKbeA"
});

router.get("/auth",controller.getInfo)
router.post("/sign-in",controller.signIn)
router.post("/sign-up",controller.signUp)
router.post("/logout",controller.logOut)
router.patch("/edit/:id",upload.fields([
    {name: "avatar",maxCount: 1},
    {name: "business_lisence",maxCount:1},
    {name: "id_card_front",maxCount: 1},
    {name: "id_card_back",maxCount: 1}
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
                if(req.files.id_card_front){
                    const result = await cloudinary.uploader.upload(req.files.id_card_front[0].path);
                    req.body.id_card_front = result.secure_url;
                }
                if(req.files.id_card_back){
                    const result = await cloudinary.uploader.upload(req.files.id_card_back[0].path);
                    req.body.id_card_back = result.secure_url;
                }
            }
            next();
        }catch(ex){
            console.log("Có lỗi xảy ra khi cập nhật ảnh: "+ex);
            return res.json({"success": false});
        }
    }
,controller.updateAccount);
router.patch("/request-upgrade-role",controller.requestUpgradeRole);
router.get("/send-request-upgrade",authMiddleWare.auth,controller.sendRequestUpgrade);

module.exports = router;