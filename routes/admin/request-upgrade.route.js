const express = require("express")
const router = express.Router();
const controller = require("../../controller/admin/upgrade-request.controller");
const authMiddleware = require("../../middleware/auth.middleware");

router.get("",controller.index);
router.patch("/approved",authMiddleware.authAdmin,controller.approved);
router.patch("/rejected",authMiddleware.authAdmin,controller.rejected);

module.exports = router;