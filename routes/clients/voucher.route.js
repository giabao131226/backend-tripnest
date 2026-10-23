const express = require("express");
const router = express.Router();
const controller = require("../../controller/clients/voucher.controller");
const authMiddleware = require("../../middleware/auth.middleware");

router.get("",authMiddleware.auth,controller.khuyenMai);
router.get("/all",authMiddleware.auth,controller.all);
router.get("/category/:slug",authMiddleware.auth,controller.vouchersByCategory);
router.get("/my-voucher",authMiddleware.auth,controller.myVoucher);
router.get("/my-voucher/all",authMiddleware.auth,controller.getAllMyVoucher);
module.exports = router;