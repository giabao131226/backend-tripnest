const express = require("express");
const router = express.Router();
const controller = require("../../controller/admin/user.controller");

router.get("/",controller.index);
router.patch("/banned/:id",controller.ban);

module.exports = router;