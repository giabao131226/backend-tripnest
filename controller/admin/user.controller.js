const User = require("../../models/account.model");
const pagination = require("../../helpers/pagination");


// [GET] "admin/user"
module.exports.index = async (req, res) => {
    try {
        const [totalUser, totalActive, totalBanned, totalOwner] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ "status": "active" }),
            User.countDocuments({ "status": "banned" }),
            User.countDocuments({ "role": "owner" })
        ]);

        // Pagination
        let objectPagination = {
            currentPage: 1,
            limitItems: 10
        }
        pagination(req.query, objectPagination)
        const totalPage = Math.ceil(totalUser / objectPagination.limitItems)
        objectPagination.totalPage = totalPage
        //End Pagination

        const users = await User.find()
            .select("_id username email status role avatar createdAt");

        return res.json({
            "success": true,
            users: users,
            statistic: {
                "totalUser": totalUser,
                "totalActive": totalActive,
                "totalBanned": totalBanned,
                "totalOwner": totalOwner
            },
            "currentPage": objectPagination.currentPage,
            "totalPage": objectPagination.totalPage,
        });
    } catch (ex) {
        console.log("Lỗi tại controller admin.user: " + ex);
        return res.json({ "success": false });
    }
}

// [PATCH] "/admin/user/banned/:id"
module.exports.ban = async (req,res) => {
    try{
        const id = req.params.id;
        const result = await User.updateOne({"_id": id},{"status": "banned"});
        if(result.matchedCount == 0) return res.json({
            "success": false,
            "message": "Không tìm thấy tài khoản cần cập nhật. Vui lòng thử lại"});
        return res.json({"success": true});
    }catch(ex){
        console.log("Lỗi tại controller admin.user.ban: "+ex);
        return res.json({"success": false});
    }
}
