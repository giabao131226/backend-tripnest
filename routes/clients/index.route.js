
const homeRouter = require("./home.route.js")
const accountRouter = require("./account.route.js")
const bdsRouter = require("./bds.route.js");
const provinceRouter = require("./province.route.js");
const amenityRouter = require("./amenity.route.js");
const categoryRouter = require("./categories.route.js");
const hostRouter = require("./host/index.route.js");

module.exports = (app) => {
    app.use("/",homeRouter);
    app.use("/account",accountRouter);
    app.use("/bds",bdsRouter);
    app.use("/province",provinceRouter);
    app.use("/amenity",amenityRouter);
    app.use("/categories",categoryRouter);
    app.use("/host",hostRouter);
}