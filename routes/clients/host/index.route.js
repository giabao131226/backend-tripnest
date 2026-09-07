const express = require("express");
const router = express.Router();
const accommodationRouter = require("../host/accommodation.route");
const authMiddleware = require("../../../middleware/auth.middleware");

router.use(authMiddleware.auth);
router.use("/accommodation",accommodationRouter);

module.exports = router;