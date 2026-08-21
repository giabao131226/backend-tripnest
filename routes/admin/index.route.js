
const authRouter = require("./auth.route");
const accommodationRouter = require("./accommodation.route");
const userRouter = require("./user.route");
module.exports = (app) => {
    app.use("/admin/auth",authRouter);
    app.use("/admin/accommodation",accommodationRouter);
    app.use("/admin/user",userRouter);
}