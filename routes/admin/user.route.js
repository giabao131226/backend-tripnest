const express = require("express");
const router = express.Router();
const controller = require("../../controller/admin/user.controller");
const cloudinary = require("cloudinary");
const multer = require("multer");
const upload = multer({ "dest": "uploads/" });

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

router.get("/", controller.index);
router.get("/all",controller.all);
router.patch("/change-status/:status/:id", controller.changeStatus);
router.get("/detail/:id", controller.detail);
router.delete("/delete/:id",controller.delete);
router.patch("/edit/:id", upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "id_card_front", maxCount: 1 },
    { name: "id_card_back", maxCount: 1 },
    { name: "business_lisence", maxCount: 1 }
]), async (req, res, next) => {
    try {
        if (req.files) {
            const arrayUpload = [];
            if (req.files.avatar) arrayUpload.push(req.files.avatar[0]);
            if (req.files.id_card_front) arrayUpload.push(req.files.id_card_front[0]);
            if (req.files.id_card_back) arrayUpload.push(req.files.id_card_back[0]);
            if (req.files.business_lisence) arrayUpload.push(req.files.business_lisence[0]);
            await Promise.all(arrayUpload.map(async (item) => {
                const key = item.fieldname;
                const result = await cloudinary.uploader.upload(item.path);
                req.body[key] = result.secure_url;
            }));
        }
        next();
    } catch (ex) {
        console.log("Có lỗi xảy ra khi upload ảnh admin.user.edit: " + ex);
        return res.status(500).json({
            success: false,
            message: "Tải ảnh lên thất bại. Vui lòng thử lại!"
        });
    }
}, controller.edit);
router.post("/create", upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "id_card_front", maxCount: 1 },
    { name: "id_card_back", maxCount: 1 },
    { name: "business_lisence", maxCount: 1 }
]), async (req, res, next) => {
    try {
        if (req.files) {
            const arrayUpload = [];
            if (req.files.avatar) arrayUpload.push(req.files.avatar[0]);
            if (req.files.id_card_front) arrayUpload.push(req.files.id_card_front[0]);
            if (req.files.id_card_back) arrayUpload.push(req.files.id_card_back[0]);
            if (req.files.business_lisence) arrayUpload.push(req.files.business_lisence[0]);
            await Promise.all(arrayUpload.map(async (item) => {
                const key = item.fieldname;
                const result = await cloudinary.uploader.upload(item.path);
                req.body[key] = result.secure_url;
            }));
        }
        next();
    } catch (ex) {
        console.log("Có lỗi xảy ra khi upload ảnh admin.user.create: " + ex);
        return res.status(500).json({
            success: false,
            message: "Tải ảnh lên thất bại. Vui lòng thử lại!"
        });
    }
}, controller.create);

module.exports = router;