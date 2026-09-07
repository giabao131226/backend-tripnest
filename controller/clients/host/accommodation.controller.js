const BDS = require("../../../models/bds.model");
const pagination = require("../../../helpers/pagination");
const Province = require("../../../models/province.model");
const Ward = require("../../../models/ward.model");

// [GET] "host/accommodation/all"
module.exports.index = async (req,res) => {
    try {
        const user = req.user;
        const find = {'ownerId': user._id};
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
            await BDS.countDocuments({"ownerId": user._id}),
            await BDS.countDocuments({"ownerId": user._id,"status": "active"}),
            await BDS.countDocuments({"ownerId": user._id,"status": "in-active"}),
            await BDS.countDocuments({"ownerId": user._id,"status": "pending"}),
            await BDS.countDocuments({"ownerId": user._id,"status": "denided"})
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
