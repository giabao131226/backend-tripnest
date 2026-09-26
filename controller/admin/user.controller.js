const User = require("../../models/account.model");
const pagination = require("../../helpers/pagination");
const validateHelper = require("../../helpers/validate.helper");
const md5 = require("md5");

// [GET] "admin/user"
module.exports.index = async (req, res) => {
    try {
        const find = {"deleted": false};
        if(req.query.role && req.query.role != "all") find.role = req.query.role;
        if(req.query.status && req.query.status != "all") find.status = req.query.status;
        if(req.query.search){
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

// [GET] "/admin/user/all"
module.exports.all = async (req,res) => {
     try {
        const find = {"deleted": false};
        if(req.query.role && req.query.role != "all") find.role = req.query.role;
        if(req.query.status && req.query.status != "all") find.status = req.query.status;
        if(req.query.search){
            find.username = {
                $regex: req.query.search,
                $options: "i"
            }
        }

         const totalUser = await User.countDocuments(find);

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
            .select("_id username avatar")
            .limit(objectPagination.limitItems)
            .skip((objectPagination.currentPage - 1) * objectPagination.limitItems);
        return res.status(200).json({
            "success": true,
            "users": users,
            "currentPage": objectPagination.currentPage,
            "totalPage": objectPagination.totalPage,
        });
    } catch (ex) {
        console.log("Lỗi tại controller admin.user.all: " + ex);
        return res.json({ "success": false,"message": "Có lỗi xảy ra" });
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
        const detail = await User.findOne({"_id": id})
            .select("-password");

        return res.json({"success": true,"detail": detail});
    }catch(ex){
        console.log("Lỗi tại controller admin.user.detail: "+ex);
        return res.json({"success": false});
    }
}

// [DELETE] "/admin/user/delete/:id"
module.exports.delete = async (req,res) => {
    try{
        const id = req.params.id;
        const result = await User.updateOne({
            "_id": id
        },{"deleted": true,"deletedAt": Date()});
        return res.status(200).json({
            "success": true,
            "message": `Xoá thành công tài khoản có ID = ${id}`
        });
    }catch(ex){
        console.log("Lỗi tại controller admin.user.delete: "+ex);
        return res.status(400).json({
            "success": false,
            "message": "Có lỗi xảy ra.Vui lòng thử lại!"
        });
    }
}

// [PATCH] "/admin/user/edit/:id"
module.exports.edit = async (req,res) => {
    try{
        const id = req.params.id;
        const data = req.body;

        if(!validateHelper.validateName(data.username)){
            return res.status(400).json({
                success: false,
                message: "Tên đăng nhập phải có từ 6-20 ký tự, bao gồm chữ hoa, chữ thường và số, không chứa ký tự đặc biệt hoặc khoảng trắng."
            });
        }
        if(data.email && !validateHelper.validateEmail(data.email)){
            return res.status(400).json({
                success: false,
                message: "Email không hợp lệ. Vui lòng nhập đúng định dạng email, ví dụ: example@gmail.com."
            });
        }
        if(data.phone && !validateHelper.validatePhone(data.phone)){
            return res.status(400).json({
                success: false,
                message: "Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam gồm 10 chữ số và bắt đầu bằng 03, 05, 07, 08 hoặc 09."
            });
        }
        const result = await User.updateOne({"_id": id},data);
        return res.json({
            "success": true,
            "message": "Cập nhật thành công"
        });
    }catch(ex){
        console.log("Lỗi tại controller admin.user.edit: "+ex);
        return res.json({"success": false});
    }
}

// [POST] "/admin/user/create"
module.exports.create = async (req,res) => {
    try{
        const data = req.body;

        if(!validateHelper.validateName(data.username)){
            return res.status(400).json({
                success: false,
                message: "Tên đăng nhập phải có từ 6-20 ký tự, bao gồm chữ hoa, chữ thường và số, không chứa ký tự đặc biệt hoặc khoảng trắng."
            });
        }
        if(!validateHelper.validatePassword(data.password)){
             return res.status(400).json({
                success: false,
                message: "Mật khẩu phải có từ 6-20 ký tự, bao gồm ít nhất 1 chữ cái, 1 số và 1 ký tự đặc biệt (!@#$%^&*)."
            });
        }
        if(data.email && !validateHelper.validateEmail(data.email)){
            return res.status(400).json({
                success: false,
                message: "Email không hợp lệ. Vui lòng nhập đúng định dạng email, ví dụ: example@gmail.com."
            });
        }
        if(data.phone && !validateHelper.validatePhone(data.phone)){
            return res.status(400).json({
                success: false,
                message: "Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam gồm 10 chữ số và bắt đầu bằng 03, 05, 07, 08 hoặc 09."
            });
        }
        data.password = md5(data.password);
        const result = await User.create(data);
        return res.json({"success": true});
    }catch(ex){
        console.log("Lỗi tại controller admin.user.create: "+ex);
        return res.json({"success": false});
    }
}
