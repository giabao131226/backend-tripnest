const express = require("express");
const router = express.Router();
const controller = require("../../controller/clients/amenity.controller");

router.get("/",controller.index);

module.exports = router;