
const authRouter = require("./auth.route");
const accommodationRouter = require("./accommodation.route");
const userRouter = require("./user.route");
const authMiddleware = require("../../middleware/auth.middleware");

module.exports = (app) => {
    app.use("/admin/auth",authRouter);
    app.use("/admin/accommodation",authMiddleware.authAdmin,accommodationRouter);
    app.use("/admin/user",authMiddleware.authAdmin,userRouter);
}