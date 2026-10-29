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
            .populate("account_id", "avatar username phone email");

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