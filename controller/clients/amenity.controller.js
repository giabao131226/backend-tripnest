const Amenity = require("../../models/amenity.model");
const BDS = require("../../models/bds.model");
const pagination = require("../../helpers/pagination");
const generateSlug = require("../../helpers/generateSlug");

// [GET] "/amenities"
module.exports.index = async (req, res) => {
    try {
        const amenities = await Amenity.find({});
        return res.status(200).json({
            "success": true,
            "amenities": amenities
        });
    } catch (ex) {
        console.log("Có lỗi tại controller amenities.index: " + ex);
        return req.status(400).json({ "success": false, "message": "Có lỗi xảy ra!" });
    }
}

// [GET] "/amenities/all"
module.exports.all = async (req, res) => {
    try {
        const { status, search } = req.query;
        const find = {
            "deleted": false
        };
        if (status === 'active' || status === 'inactive') find.status = status;
        if (search && search != '') {
            find.name = {
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
        const countProduct = await Amenity.countDocuments(find);
        const totalPage = Math.ceil(countProduct / objectPagination.limitItems)
        objectPagination.totalPage = totalPage
        //End Pagination

        const [amenities, total,totalActive,totalInactive] = await Promise.all([
            Amenity.find(find)
                .limit(objectPagination.limitItems)
                .skip((objectPagination.currentPage - 1) * objectPagination.limitItems)
                .lean(),
            Amenity.countDocuments(find),
            Amenity.countDocuments({ "deleted": false, "status" : "active" }),
            Amenity.countDocuments({ "deleted": false, "status": "inactive" }),
        ])

        return res.status(200).json({
            "success": true,
            "amenities": amenities,
            "overview": {
                "totalActive": totalActive,
                "totalInActive": totalInactive,
                "total": total
            },
            "currentPage": objectPagination.currentPage,
            "totalPage": objectPagination.totalPage
        });
    } catch (ex) {
        console.log("Có lỗi tại controller amenities.all: " + ex);
        return res.status(400).json({ "success": false, "message": "Có lỗi xảy ra!" });
    }
}

// [POST] "/amenities/create"
module.exports.create = async (req,res) => {
    try{
        const data = req.body;
        if(!data.name.trim()){
            return res.status(400).json({
                "success": false,
                "message": "Vui lòng nhập tên danh mục"
            });
        }

        data.slug = await generateSlug(data.name,Amenity);
        const result = await Amenity.create(data);
        return res.status(200).json({
            "success": true,
            "message": "Thêm mới tiện ích thành công"
        });
    }catch(ex){
        console.log("Có lỗi xảy ra tại controller amenities.create: "+ex);
        return res.status(400).json({
            "success": false,
            "message": "Có lỗi xảy ra"
        })
    }
}

// [DELETE] "/amenities/delete/:id"
module.exports.delete = async (req,res) => {
    try{
        const id = req.params.id;
        const result = await Amenity.updateOne({"_id": id},{
            "deleted": true,
            "deletedAt": new Date()
        });
        return res.status(200).json({
            "success": true,
            "message": `Xoá thành công tiện ích có ID là ${id}`
        });
    }catch(ex){
        console.log("Có lỗi xảy ra tại controller amenities.delete: "+ex);
        return res.status(400).json({
            "success": false,
            "message": "Có lỗi xảy ra"
        })
    }
}

// [GET] "/amenities/detail/:slug"
module.exports.detail = async (req,res) => {
    try {
        const id = req.params.id;
        const detail = await Amenity.findOne({
            "_id": id,
            "deleted": false
        }).lean();
        return res.status(200).json({
            "success": true,
            "detail": detail
        });
    } catch (ex) {
        console.log("Có lỗi tại controller amenities.detail: " + ex);
        return req.status(400).json({ 
            "success": false, 
            "message": "Có lỗi xảy ra!" 
        });
    }
}

// [PATCH] "/amenities/edit/:id"
module.exports.edit = async (req,res) => {
    try{
        const id = req.params.id;
        const data = req.body;
        if(!data.name.trim()){
            return res.status(400).json({
                "success": false,
                "message": "Vui lòng nhập tên tiện ích"
            });
        }

        data.slug = await generateSlug(data.name,Amenity);
        const result = await Amenity.updateOne({"_id": id},data);
        const newDetail = await Amenity.findOne({
            "_id": id,
            "deleted": false
        });
        return res.status(200).json({
            "success": true,
            "message": `Cập nhật thành công tiện ích có ID là: ${id}`,
            "newDetail": newDetail
        });
    }catch(ex){
        console.log("Có lỗi xảy ra tại controller amenities.edit: "+ex);
        return res.status(400).json({
            "success": false,
            "message": "Có lỗi xảy ra"
        })
    }
}

// [PATCH] "/amenities/change-status/:status/:id"
module.exports.changeStatus = async (req,res) => {
    try{
        const id = req.params.id;
        const status = req.params.status;

        const result = await Amenity.updateOne({"_id": id},{"status": status});
       
        return res.status(200).json({
            "success": true,
            "message": `Chuyển trạng thái thành công`
        });
    }catch(ex){
        console.log("Có lỗi xảy ra tại controller amenities.changeStatus: "+ex);
        return res.status(400).json({
            "success": false,
            "message": "Có lỗi xảy ra"
        })
    }
}