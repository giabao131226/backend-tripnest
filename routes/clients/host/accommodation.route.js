const express = require("express");
const router = express.Router();
const controller = require("../../../controller/clients/host/accommodation.controller");

router.get("/all",controller.index);

module.exports = router;