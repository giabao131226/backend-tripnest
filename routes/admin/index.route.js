
const authRouter = require("./auth.route");
const accommodationRouter = require("./accommodation.route");
const userRouter = require("./user.route");
const voucherRouter = require("./voucher.route");
const categoryRouter = require("./categories.route");
const upgradeRequestRouter = require("./request-upgrade.route");
const authMiddleware = require("../../middleware/auth.middleware");

module.exports = (app) => {
    app.use("/admin/auth",authRouter);
    app.use("/admin/accommodation",authMiddleware.authAdmin,accommodationRouter);
    app.use("/admin/user",authMiddleware.authAdmin,userRouter);
    app.use("/admin/vouchers",authMiddleware.authAdmin,voucherRouter);
    app.use("/admin/categories",authMiddleware.authAdmin,categoryRouter);
    app.use("/admin/request-upgrade",authMiddleware.authAdmin,upgradeRequestRouter);
}