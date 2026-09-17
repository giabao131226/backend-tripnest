const express = require("express");
const router = express.Router();
const controller = require("../../controller/clients/categories.controller");

router.get("/",controller.index);
router.get("/all",controller.all);
router.post("/create",controller.create);

module.exports = router;