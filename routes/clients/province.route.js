const express = require("express");
const router = express.Router();
const controller = require("../../controller/clients/province.controller");

router.get("/",controller.index);
router.get("/only-province",controller.provinceOnly);

module.exports = router;