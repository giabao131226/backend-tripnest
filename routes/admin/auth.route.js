const express = require("express");
const router = express.Router();
const controller = require("../../controller/admin/auth.controller");

router.post("/login",controller.login);
router.get("/getInfo",controller.getInfo);

module.exports = router;