const express = require("express");
const router = express.Router();
const controller = require("../../controller/clients/accommodation-unit.controller");

router.get("/detail/:id",controller.detail);

module.exports = router;