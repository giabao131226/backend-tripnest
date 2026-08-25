const User = require("../../models/account.model");
const pagination = require("../../helpers/pagination");


// [GET] "admin/user"
module.exports.index = async (req, res) => {
    try {
        const find = {};
        if(req.query.role && req.query.role != "all") find.role = req.query.role;
        if(req.query.status && req.query.status != "all") find.status = req.query.status;
        if(req.query.search){
            console.log(req.query.search);
            find.username = {
                $regex: req.query.search,
                $options: "i"
            }
        }

        const [totalUser, totalActive, totalBanned, totalOwner] = await Promise.all([
            User.countDocuments(find),
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

        const users = await User.find(find)
            .select("_id username email status role avatar createdAt")
            .limit(objectPagination.limitItems)
            .skip((objectPagination.currentPage - 1) * objectPagination.limitItems);

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

// [PATCH] "/admin/user/change-status/:status/:id"
module.exports.changeStatus = async (req,res) => {
    try{
        const id = req.params.id;
        const status = req.params.status;
        const result = await User.updateOne({"_id": id},{"status": status});
        if(result.matchedCount == 0) return res.json({
            "success": false,
            "message": "Không tìm thấy tài khoản cần cập nhật. Vui lòng thử lại"});
        return res.json({"success": true});
    }catch(ex){
        console.log("Lỗi tại controller admin.user.changestatus: "+ex);
        return res.json({"success": false});
    }
}

// [GET] "/admin/user/detail/:id"
module.exports.detail = async (req,res) => {
    try{
        const id = req.params.id;
        const detail = await User.findOne({"_id": id});

        return res.json({"success": true,"detail": detail});
    }catch(ex){
        console.log("Lỗi tại controller admin.user.detail: "+ex);
        return res.json({"success": false});
    }
}
