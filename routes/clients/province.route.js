const express = require("express");
const router = express.Router();
const controller = require("../../controller/clients/province.controller");

router.get("/",controller.index);

module.exports = router;