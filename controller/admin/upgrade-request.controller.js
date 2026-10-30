const UpgradeRequest = require("../../models/upgrade-request.model");
const pagination = require("../../helpers/pagination");
const Account = require("../../models/account.model");

// [GET] "/admin/upgrade-request/"
module.exports.index = async (req, res) => {
    try {
        const find = {};
        const { status, search } = req.query;
        if (status != "" && status != "all") find.status = status;
        if (search != "") {
            const condition = {
                $regex: search,
                $options: "i"
            }
            const accounts = await Account.find({
                $or: [
                    {
                        "username": condition
                    },
                    {
                        "email": condition
                    },
                    {
                        "phone": condition
                    }
                ]
            }).select("_id");

            find["account_id"] =  {
                $in: accounts
            }
        }

        const [totalUR, totalPending, totalApproved, totalReject] = await Promise.all([
            UpgradeRequest.countDocuments({}),
            UpgradeRequest.countDocuments({ "status": "pending" }),
            UpgradeRequest.countDocuments({ "status": "approved" }),
            UpgradeRequest.countDocuments({ "status": "rejected" })
        ]);

        // Pagination
        let objectPagination = {
            currentPage: 1,
            limitItems: 10
        }
        pagination(req.query, objectPagination)
        const countProduct = await UpgradeRequest.countDocuments(find);
        const totalPage = Math.ceil(countProduct / objectPagination.limitItems)
        objectPagination.totalPage = totalPage
        //End Pagination

        const upgradeRequests = await UpgradeRequest.find(find)
            .populate("account_id", "avatar username phone email")
            .sort({"createdAt": "desc"});

        return res.json({
            "success": true,
            "upgradeRequests": upgradeRequests,
            "currentPage": objectPagination.currentPage,
            "totalPage": objectPagination.totalPage,
            "overview": {
                "totalUR": totalUR,
                "totalPending": totalPending,
                "totalApproved": totalApproved,
                "totalReject": totalReject
            }
        });

    } catch (ex) {
        console.log(ex);
        return res.status(400).json({
            "success": false,
            "message": ex
        })
    }
}

// [PATCH] "/admin/upgrade-request/approved"
module.exports.approved = async (req,res) => {
    try {
        const user = req.admin;
        const data = req.body;
        const updateRole = await Account.updateOne({"_id": data["account_id"]},{"role": "owner"});
        const resultUpdateRequest = await UpgradeRequest.updateOne({"_id": data._id},{
            "admin_id": user._id,
            "status": "approved",
            "reviewed_at": new Date()
        });

        return res.status(200).json({
            "success": true,
            "message": "Đã phê duyệt yêu cầu nâng cấp."
        })
    } catch (ex) {
        console.log("Lỗi tại controller UpgradeRequest.approved: "+ex);
        return res.status(400).json({
            "success": false,
            "message": "Có lỗi xảy ra, phê duyệt không thành công"
        })
    }
}

// [PATCH] "/admin/upgrade-request/rejected"
module.exports.rejected = async (req,res) => {
    try {
        const user = req.admin;
        const data = req.body;
        const resultUpdateRequest = await UpgradeRequest.updateOne({"_id": data._id},{
            "admin_id": user._id,
            "status": "rejected",
            "reviewed_at": new Date(),
            "admin_note": data["admin_note"]
        });

        return res.status(200).json({
            "success": true,
            "message": "Đã từ chối yêu cầu nâng cấp"
        })
    } catch (ex) {
        console.log("Lỗi tại controller UpgradeRequest.rejected: "+ex);
        return res.status(400).json({
            "success": false,
            "message": "Có lỗi xảy ra, từ chối không thành công"
        })
    }
}