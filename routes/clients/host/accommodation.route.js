const express = require("express");
const router = express.Router();
const controller = require("../../../controller/clients/host/accommodation.controller");

router.get("/all",controller.index);
router.delete("/delete/:id",controller.delete);


module.exports = router;