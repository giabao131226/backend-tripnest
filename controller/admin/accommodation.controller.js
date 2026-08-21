const BDS = require("../../models/bds.model");
const Images = require("../../models/images.model");
const Amenity = require("../../models/amenity.model");
const formatHelper = require("../../helpers/format.helper");
const pagination = require("../../helpers/pagination");

// [GET] "/admin/accommodations"
module.exports.index = async (req, res) => {
    try {
        const accommodations = await BDS.find({
            "status": "pending",
            "deleted": false
        }).lean();

        finalData = await Promise.all(accommodations.map(async (item) => {
            const newData = { ...item };
            if (item.price) {
                newData.price = formatHelper.formatVNDMoney(newData.price.toString());
            }
            const amenity = await Amenity.find({ "_id": { $in: newData.amenityIds }, "status": "active" }).lean();
            newData.amenity = amenity;
            return newData;
        }))

        return res.json({
            "success": true,
            "bds": finalData
        })
    } catch (ex) {
        console.log("Lỗi ở controller admin.accommodation: " + ex);
    }
}

// [PATCH] "/admin/accommodation/check/:id/:status"
module.exports.approve = async (req, res) => {
    try {
        const id = req.params.id;
        const status = req.params.status;
        if (id && (status == "active" || status == "denided")) {
            const result = await BDS.updateOne({ "_id": id }, { "status": status });
            return res.json({ "success": true });
        }
        return res.json({ "success": false });

    } catch (ex) {
        console.log("Có lỗi xảy ra ở controller admin.approve: " + ex);
        return res.json({ "success": false });
    }
}

// [GET] "/admin/accommodations/all"
module.exports.all = async (req, res) => {
    try {
        // Pagination
        let objectPagination = {
            currentPage: 1,
            limitItems: 4
        }
        pagination(req.query, objectPagination)
        const countProduct = await BDS.countDocuments({});
        const totalPage = Math.ceil(countProduct / objectPagination.limitItems)
        objectPagination.totalPage = totalPage
        //End Pagination
        const accommodations = await BDS.find()
            .limit(objectPagination.limitItems)
            .skip((objectPagination.currentPage - 1) * 4)
            .select("name ownerId status")
            .populate("ownerId", "username");
        return res.json({ 
            "success": true, 
            "accommodations": accommodations,
            "currentPage": objectPagination.currentPage,
            "totalPage": objectPagination.totalPage,
        });
    } catch (ex) {
        console.log("Lỗi xảy ra ở controller admin.accommodation.all: " + ex);
        return res.json({ "success": false });
    }
}