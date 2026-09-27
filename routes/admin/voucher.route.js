const express = require("express");
const router = express.Router();
const controller = require("../../controller/admin/voucher.controller");

router.get("",controller.index);
router.post("/create",controller.create);
router.patch("/change-status/:status/:id",controller.changeStatus);
router.get("/detail/:code",controller.detail);
module.exports = router;