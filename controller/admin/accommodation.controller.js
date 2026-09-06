const BDS = require("../../models/bds.model");
const Images = require("../../models/images.model");
const Amenity = require("../../models/amenity.model");
const formatHelper = require("../../helpers/format.helper");
const pagination = require("../../helpers/pagination");
const Province = require("../../models/province.model");
const Ward = require("../../models/ward.model");

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
        const find = {};
        const search = req.query.search;
        if (search) {
            find["$or"] = [];
            find["$or"].push({
                name: { $regex: search, $options: "i" }
            });
            const [provinces, wards] = await Promise.all([
                Province.find({
                    "name": {
                        $regex: search,
                        $options: "i"
                    }
                }),
                Ward.find({
                    "name": {
                        $regex: search,
                        $options: "i"
                    }
                }),
            ])
            if (provinces.length > 0) {
                const idProvinces = provinces.map((item) => item._id);
                find["$or"].push({
                    "province_id": { $in: idProvinces }
                });
            }
            if (wards.length > 0) {
                const idWards = wards.map((item) => item._id);
                find["$or"].push({
                    "ward_id": { $in: idWards }
                });
            }
        }

        const category = req.query.category;
        if (category && category != "all") {
            find["category_id"] = category;
        }

        // Pagination
        let objectPagination = {
            currentPage: 1,
            limitItems: 10
        }
        pagination(req.query, objectPagination)
        const countProduct = await BDS.countDocuments(find);
        const totalPage = Math.ceil(countProduct / objectPagination.limitItems)
        objectPagination.totalPage = totalPage
        //End Pagination

        const [accommodations, total,totalActive, totalInactive, totalPending, totalDenided] = await Promise.all([
            await BDS.find(find)
                .limit(objectPagination.limitItems)
                .skip((objectPagination.currentPage - 1) * objectPagination.limitItems)
                .select("name ownerId category_id status")
                .populate("ownerId", "username")
                .populate("category_id"),
            await BDS.countDocuments(),
            await BDS.countDocuments({"status": "active"}),
            await BDS.countDocuments({"status": "in-active"}),
            await BDS.countDocuments({"status": "pending"}),
            await BDS.countDocuments({"status": "denided"})
        ]);

        return res.json({
            "success": true,
            "accommodations": accommodations,
            "currentPage": objectPagination.currentPage,
            "totalPage": objectPagination.totalPage,
            "overview": {
                "totalActive": totalActive,
                "totalInActive": totalInactive,
                "totalPending": totalPending,
                "totalDenided": totalDenided,
                "total": total
            }
        });
    } catch (ex) {
        console.log("Lỗi xảy ra ở controller admin.accommodation.all: " + ex);
        return res.json({ "success": false });
    }
}