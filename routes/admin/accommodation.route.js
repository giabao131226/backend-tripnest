const express = require("express");
const router = express.Router();
const controller = require("../../controller/admin/accommodation.controller");

router.get("/",controller.index);
router.patch("/check/:id/:status",controller.approve);
router.get("/all",controller.all);

module.exports = router;