const Voucher = require("../../models/voucher.model");
const VoucherUser = require("../../models/voucher_user.model");
const Categories = require("../../models/categories.model");
const pagination = require("../../helpers/pagination");

// [GET] "/vouchers"
module.exports.khuyenMai = async (req, res) => {
    try {
        const user = req.user;
        const [userVoucher, categories] = await Promise.all([
            VoucherUser.find({ "user_id": user._id }),
            await Categories.find({
                "deleted": false,
                "status": "active"
            }).limit(4)
        ]);

        const haveVoucherID = userVoucher.map((item) => item["voucher_id"]);
        const specificVoucherIds = await VoucherUser.find({
            user_id: user._id
        }).distinct("voucher_id");

        const vouchers = await Voucher.find({
            _id: { $nin: haveVoucherID },
            start_date: {
                $lte: new Date()
            },
            end_date: {
                $gt: new Date()
            },
            $or: [
                {
                    apply_scope: "all"
                },
                {
                    apply_scope: "specific_users",
                    _id: { $in: specificVoucherIds }
                }
            ]
        }).limit(4);
        return res.status(200).json({
            "success": true,
            "vouchers": vouchers,
            "categories": categories
        });
    } catch (ex) {
        console.log("Có lỗi xảy ra tại controller voucher: " + ex);
        return res.status(400).json({
            "success": false,
            "message": "Có lỗi xảy ra"
        })
    }
}

// [GET] "/vouchers/all"
module.exports.all = async (req, res) => {
    try {
        const user = req.user;

        const userVoucher = await VoucherUser.find({ "user_id": user._id });
        const haveVoucherID = userVoucher.map((item) => item["voucher_id"]);
        const specificVoucherIds = await VoucherUser.find({
            user_id: user._id
        }).distinct("voucher_id");

        const find = {
            _id: { $nin: haveVoucherID },
            start_date: {
                $lte: new Date()
            },
            end_date: {
                $gt: new Date()
            },
            $or: [
                {
                    apply_scope: "all"
                },
                {
                    apply_scope: "specific_users",
                    _id: { $in: specificVoucherIds }
                }
            ]
        }

        const search = req.query.search;
        if (search) {
            find.$and = [
                {
                    $or: [
                        {
                            name: {
                                $regex: search,
                                $options: "i"
                            }
                        },
                        {
                            code: {
                                $regex: search,
                                $options: "i"
                            }
                        }
                    ]
                }
            ]
        };

        // Pagination
        let objectPagination = {
            currentPage: 1,
            limitItems: 8
        }
        pagination(req.query, objectPagination)
        const countProduct = await Voucher.countDocuments(find);
        const totalPage = Math.ceil(countProduct / objectPagination.limitItems)
        objectPagination.totalPage = totalPage
        //End Pagination

        const vouchers = await Voucher.find(find).limit(objectPagination.limitItems);
        return res.status(200).json({
            "success": true,
            "vouchers": vouchers,
            "currentPage": objectPagination.currentPage,
            "totalPage": objectPagination.totalPage
        });
    } catch (ex) {
        console.log("Có lỗi xảy ra tại controller.voucher.all: " + ex);
        return res.status(400).json({
            "success": false,
            "message": "Có lỗi xảy ra"
        })
    }
} 