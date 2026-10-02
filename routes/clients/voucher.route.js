const express = require("express");
const router = express.Router();
const controller = require("../../controller/clients/voucher.controller");
const authMiddleware = require("../../middleware/auth.middleware");

router.get("",authMiddleware.auth,controller.khuyenMai);
router.get("/all",authMiddleware.auth,controller.all)

module.exports = router;