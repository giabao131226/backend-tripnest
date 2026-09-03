const BDS = require("../../models/bds.model");
const Account = require("../../models/account.model");
const Images = require("../../models/images.model");
const formatHelper = require("../../helpers/format.helper");
const generateSlug = require("../../helpers/generateSlug");
const { raw } = require("express");
const Amenity = require("../../models/amenity.model");
const AccommodationUnit = require("../../models/accommodationUnit.model");

// [GET] "/bds"
module.exports.index = async (req,res) => {
    try{
        const bds = await BDS.find({"status": "active","deleted": false}).lean();
        finalData = bds.map((item) => {
            item.price = formatHelper.formatVNDMoney(item.price);
            return {...item}
        })
        return res.json({"success": true,"data": finalData});
    }catch(ex){
        console.log("Có lỗi xảy ra khi lấy danh sách bất động sản: "+ex);
        return res.json({"success": false});
    }
}

// [GET] "/bds/detail/:id"
module.exports.detail = async (req,res) => {
    try{
        const id = req.params.id;
        const data = await BDS.findOne({"_id": id,status: "active","deleted": false}).lean();
        const images = await Images.find({"bdsID": data._id}).lean();
        data.images = images;
        data.price = formatHelper.formatVNDMoney(data.price);
        return res.json({"success": true,"data": data});
    }catch(ex){
        console.log("Có lỗi xảy ra khi lấy thông tin chi tiết bất động sản: "+ex);
        return res.json({"success": false});
    }
}

// [POST] "/bds/save"
module.exports.store = async (req,res) => {
    try{
        const tokenUser = req.cookies.tokenUser;
        const ownerId = await Account.findOne({"tokenUser": tokenUser}).select("_id");
        if(!ownerId) return res.json({"success": false});
        req.body.ownerId = ownerId._id;
        req.body.status = "pending";
        req.body.slug = await generateSlug(req.body.name+"",BDS);
        if(req.body.amenity.length > 0) req.body.amenityIds = JSON.parse(req.body.amenity);

        const result = await BDS.create(req.body);
        if(req.body.rooms){
            const rooms = JSON.parse(req.body.rooms);
            await Promise.all(rooms.map(async (room) => {
                room.accommodationId = result._id;
                await AccommodationUnit.create(room);
            }));
        }
        return res.json({
            "success": true
        });
    }catch(ex){
        console.log("Có lỗi xảy ra khi lưu trữ thông tin bất động sản: "+ex);
        return res.json({
            "success": false,
            "message": ex
        });
    }
}
// [POST] "/bds/update/:slug"
module.exports.update = async (req,res) => {
    try{
        const slug = req.params.slug;
        const tokenUser = req.cookies.tokenUser;
        const ownerId = await Account.findOne({"tokenUser": tokenUser}).select("_id");
        if(!ownerId) return res.json({"success": false});
        req.body.ownerId = ownerId._id;
        req.body.status = "pending";
        req.body.slug = await generateSlug(req.body.name+"",BDS);
        if(req.body.oldImages){
            const oldImages = JSON.parse(req.body.oldImages);
            if(req.body.images){
                oldImages.forEach((item) => {
                    req.body.images.push(item);
                })
            }else req.body.images = oldImages;
        }
        if(req.body.amenity.length > 0) req.body.amenityIds = JSON.parse(req.body.amenity);

        const result = await BDS.updateOne({"slug": slug},{...req.body});
        return res.json({"success": true});
    }catch(ex){
        console.log("Có lỗi xảy ra khi cập nhật thông tin bất động sản: "+ex);
        return res.json({"success": false});
    }
}

// [GET] "/bds/my-property"
module.exports.myProperty = async (req,res) => {
    try{
        const tokenUser = req.cookies.tokenUser;
        const user = await Account.findOne({"tokenUser": tokenUser}).select("-password");
        const rawData = await BDS.find({
            "ownerId": user._id,
            "deleted": false
        }).lean();

        const accommodation = await Promise.all(rawData.map(async (item) =>{
            const newData = {...item};
            if(item.price){
                newData.price = formatHelper.formatVNDMoney(newData.price.toString());
            }
            const amenity = await Amenity.find({"_id": {$in: newData.amenityIds},"status": "active"}).lean();
            newData.amenity = amenity;
            return newData;
        }))
        return res.json({"success": true,"bds": accommodation});
    }catch(ex){
        console.log("Có lỗi xảy ra khi lấy danh sách bất động sản của bản thân: "+ex);
        return res.json({"success": false,"bds": []})
    }
}

// [PATCH] "/bds/delete/:id"
module.exports.deleteProperty = async (req,res) => {
    try{
        const id = req.params.id;
        const result = await BDS.updateOne({"_id": id},{'deleted': true});
        return res.json({
            "success": true
        })
    }catch(ex){
        console.log("Có lỗi xảy ra trong quá trình xoá cơ sở lưu trú: "+ex);
        return res.json({"success": false});
    }
}

// [GET] "/bds/edit/:slug"
module.exports.edit = async (req,res) => {
    try{
        const slug = req.params.slug;
        const accommodationDetail = await BDS.findOne({"slug": slug});
        return res.json({
            "success": true,
            "accommodationDetail": accommodationDetail
        });

    }catch(ex){
        console.log("Có lỗi xảy ra trong quá trình lấy thông tin cơ sở lưu trú: "+ex);
        return res.json({
            "success": false})
    }
}