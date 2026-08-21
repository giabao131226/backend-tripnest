const express = require("express");
const router = express.Router();
const controller = require("../../controller/clients/bds.controller");
const multer = require("multer");
const upload = multer({
    dest: "uploads/"
});
const cloudinary = require("cloudinary");

cloudinary.config({
    cloud_name: "dnlcvjrnb",
    api_key: "345477329557222",
    api_secret: "FY8lP8RMpVvfypM7WcbmXukKbeA"
});

router.get("/",controller.index);
router.get("/detail/:id",controller.detail);
router.post("/save",
    upload.fields([
    { name: "lisence", maxCount: 1 },
    { name: "images", maxCount: 20 }
    ]),
    async (req,res,next) => {
        try{
            if(req.files.lisence){
                const result = await cloudinary.uploader.upload(req.files.lisence[0].path);
                req.body.lisence = result.secure_url;
            }
            if(req.files.images){
                req.body.images = await Promise.all(
                    req.files.images.map(async (file) => {
                        const result = await cloudinary.uploader.upload(file.path);
                        return result.secure_url;
                    })
                );
            }
        }catch(ex){
            console.log("Có lỗi xảy ra khi lưu ảnh : "+ex);
            return res.json({"success" : false});
        }
        next();
    },controller.store);
router.patch("/delete/:id",controller.deleteProperty)
router.get("/my-property",controller.myProperty)
router.get("/edit/:slug",controller.edit);
router.post("/update/:slug",upload.fields([
    { name: "lisence", maxCount: 1 },
    { name: "images", maxCount: 20 }
    ]),
    async (req,res,next) => {
        try{
            if(req.files.lisence){
                const result = await cloudinary.uploader.upload(req.files.lisence[0].path);
                req.body.lisence = result.secure_url;
            }
            if(req.files.images){
                req.body.images = await Promise.all(
                    req.files.images.map(async (file) => {
                        const result = await cloudinary.uploader.upload(file.path);
                        return result.secure_url;
                    })
                );

                console.log(req.body.images);
            }
        }catch(ex){
            console.log("Có lỗi xảy ra khi lưu ảnh : "+ex);
            return res.json({"success" : false});
        }
        next();
    },controller.update);

module.exports = router;