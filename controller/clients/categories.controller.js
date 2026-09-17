const Category = require("../../models/categories.model");
const BDS = require("../../models/bds.model");
const pagination = require("../../helpers/pagination");


// [GET] "/categories"
module.exports.index = async (req, res) => {
    try {
        const categories = await Category.find({});
        return res.status(200).json({
            "success": true,
            "categories": categories
        });
    } catch (ex) {
        console.log("Có lỗi tại controller categories.index: " + ex);
        return req.status(400).json({ "success": false, "message": "Có lỗi xảy ra!" });
    }
}

// [GET] "/categories/all"
module.exports.all = async (req, res) => {
    try {
        const { status, search } = req.query;
        const find = {};
        if (status === 'active' || status === 'inactive') find.status = status;
        if (search != '') {
            find.title = {
                $regex: search,
                "$options": "i"
            };
        }

        // Pagination
        let objectPagination = {
            currentPage: 1,
            limitItems: 10
        }
        pagination(req.query, objectPagination)
        const countProduct = await Category.countDocuments(find);
        const totalPage = Math.ceil(countProduct / objectPagination.limitItems)
        objectPagination.totalPage = totalPage
        //End Pagination

        const [categories, total,totalActive,totalInactive] = await Promise.all([
            Category.find(find)
                .limit(objectPagination.limitItems)
                .skip((objectPagination.currentPage - 1) * objectPagination.limitItems)
                .lean(),
            Category.countDocuments(find),
            Category.countDocuments({ "deleted": false, "status" : "active" }),
            Category.countDocuments({ "deleted": false, "status": "inactive" }),
        ])

        const data = await Promise.all(categories.map(async (category) => {
            const quantityAccLinkTo = await BDS.countDocuments({
                "category_id": category._id
            });
            return { ...category, "quantityAccLinkTo": quantityAccLinkTo }
        }));
        return res.status(200).json({
            "success": true,
            "categories": data,
            "overview": {
                "totalActive": totalActive,
                "totalInActive": totalInactive,
                "total": total
            },
            "currentPage": objectPagination.currentPage,
            "totalPage": objectPagination.totalPage
        });
    } catch (ex) {
        console.log("Có lỗi tại controller categories.all: " + ex);
        return res.status(400).json({ "success": false, "message": "Có lỗi xảy ra!" });
    }
}