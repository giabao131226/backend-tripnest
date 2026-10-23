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
        const myVouchers = await Promise.all(userVoucher.map(async (item) => {
            const voucherDetail = await Voucher.findOne({
                "_id": item.voucher_id
            }).lean();
            return voucherDetail;
        }))
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
            "categories": categories,
            "myVouchers": myVouchers
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

// [GET] "/vouchers/category/:slug"
module.exports.vouchersByCategory = async (req, res) => {
    try {
        const slug = req.params.slug;
        const user = req.user;

        const userVoucher = await VoucherUser.find({ "user_id": user._id });
        const haveVoucherID = userVoucher.map((item) => item["voucher_id"]);
        const specificVoucherIds = await VoucherUser.find({
            user_id: user._id
        }).distinct("voucher_id");

        const detailCategory = await Categories.findOne({
            "slug": slug,
            "deleted": false,
            "status": "active"
        });

        if (detailCategory === null) return res.status(400).json({
            "success": false,
            "message": "Không tìm thấy danh mục nào"
        });
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
            ],
            "category_ids": detailCategory._id
        }

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

        const vouchers = await Voucher.find(find);

        return res.status(200).json({
            "success": true,
            "vouchers": vouchers,
            "category": detailCategory,
            "currentPage": objectPagination.currentPage,
            "totalPage": objectPagination.totalPage
        });
    } catch (ex) {
        console.log("Có lỗi xảy ra tại controller client voucher.vouchersByCategory: " + ex);
        return res.status(400).json({
            "success": false,
            "message": "Có lỗi xảy ra!"
        });
    }
}

// [GET] "/vouchers/my-voucher"
module.exports.myVoucher = async (req, res) => {
    try {
        const user = req.user;
        // Pagination
        let objectPagination = {
            currentPage: 1,
            limitItems: 8
        }
        pagination(req.query, objectPagination)
        const countProduct = await VoucherUser.countDocuments({ "user_id": user._id });
        const totalPage = Math.ceil(countProduct / objectPagination.limitItems)
        objectPagination.totalPage = totalPage
        //End Pagination

        const userVoucher = await VoucherUser.find({
            "user_id": user._id
        }).limit(objectPagination.limitItems);
        const myVouchers = await Promise.all(userVoucher.map(async (item) => {
            const voucherDetail = await Voucher.findOne({
                "_id": item.voucher_id
            }).lean();
            return voucherDetail;
        }))

        return res.status(200).json({
            "success": true,
            "vouchers": myVouchers,
            "currentPage": objectPagination.currentPage,
            "totalPage": totalPage
        })

    } catch (ex) {
        console.log("Lỗi tại controller voucher.myVouchers: " + ex);
        return res.status(400).json({
            "success": false,
            "message": "Có lỗi xảy ra!"
        })
    }
}

// [GET] "/vouchers/my-voucher/all"
module.exports.getAllMyVoucher = async (req, res) => {
    try {
        const user = req.user;
        const userVoucher = await VoucherUser.find({
            "user_id": user._id
        });
        const myVouchers = await Promise.all(userVoucher.map(async (item) => {
            const voucherDetail = await Voucher.findOne({
                "_id": item.voucher_id,
                "start_date": {
                    $lte: new Date()
                },
                "end_date": {
                    $gt: new Date()
                }
            }).lean();
            return voucherDetail;
        }))

        return res.status(200).json({
            "success": true,
            "vouchers": myVouchers
        })

    } catch (ex) {
        console.log("Lỗi tại controller voucher.getAllMyVoucher: " + ex);
        return res.status(400).json({
            "success": false,
            "message": "Có lỗi xảy ra!"
        })
    }
}