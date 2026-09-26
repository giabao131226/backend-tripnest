const Voucher = require("../../models/voucher.model");
const pagination = require("../../helpers/pagination");
// [GET] "/vouchers"
module.exports.index = async (req,res) => {
    try {
        const find = {};
        const search = req.query.search;
        const status = req.query.status;
        if(status != "all" && status != '') find.status = status;
        if (search && search.trim() != "") {
            find["$or"] = [];
            find["$or"].push({
                name: { $regex: search, $options: "i" }
            });
            find["$or"].push({
                code: { $regex: search, $options: "i" }
            })
        }
        console.log(find);
        // Pagination
        let objectPagination = {
            currentPage: 1,
            limitItems: 10
        }
        pagination(req.query, objectPagination)
        const countProduct = await Voucher.countDocuments(find);
        const totalPage = Math.ceil(countProduct / objectPagination.limitItems)
        objectPagination.totalPage = totalPage
        //End Pagination

        const [vouchers, total,totalActive, totalInactive] = await Promise.all([
            await Voucher.find(find)
                .limit(objectPagination.limitItems)
                .skip((objectPagination.currentPage - 1) * objectPagination.limitItems),
            await Voucher.countDocuments(),
            await Voucher.countDocuments({"status": "active"}),
            await Voucher.countDocuments({"status": "in-active"}),
        ]);

        return res.json({
            "success": true,
            "vouchers": vouchers,
            "currentPage": objectPagination.currentPage,
            "totalPage": objectPagination.totalPage,
            "overview": {
                "totalActive": totalActive,
                "totalInActive": totalInactive,
                "total": total
            }
        });
    } catch (ex) {
        console.log("Lỗi xảy ra ở controller admin.voucher.index: " + ex);
        return res.json({ "success": false ,"message": "Có lỗi xảy ra"});
    }
}

// [POST] "/vouchers/create"
module.exports.create = async (req,res) => {
    try{
        const data = req.body;
        const result = await Voucher.create(data);
        return res.status(200).json({
            "success": "true",
            "message": "Thêm mới voucher thành công"
        });
    }catch(ex){
        console.log("Có lỗi tại controller voucher.create: "+ex);
        return res.status(400).json({
            "success": false,
            "message": "Có lỗi xảy ra"
        })
    }
}