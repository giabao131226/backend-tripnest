const express = require("express")
const router = express.Router();
const controller = require("../../controller/admin/upgrade-request.controller");

router.get("",controller.index);

module.exports = router;