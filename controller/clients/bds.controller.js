const BDS = require("../../models/bds.model");
const Account = require("../../models/account.model");
const formatHelper = require("../../helpers/format.helper");
const generateSlug = require("../../helpers/generateSlug");
const Amenity = require("../../models/amenity.model");
const AccommodationUnit = require("../../models/accommodationUnit.model");
const pagination = require("../../helpers/pagination");

// [GET] "/bds"
module.exports.index = async (req, res) => {
    try {
        const find = {
            "status": "active",
            "deleted": false
        };
        const search = req.query.search;
        if (search) {
            find["$or"] = [];
            find["$or"].push({
                name: { $regex: search, $options: "i" }
            });
            const [provinces, wards] = await Promise.all([
                Province.find({
                    "name": {
                        $regex: search,
                        $options: "i"
                    }
                }),
                Ward.find({
                    "name": {
                        $regex: search,
                        $options: "i"
                    }
                }),
            ])
            if (provinces.length > 0) {
                const idProvinces = provinces.map((item) => item._id);
                find["$or"].push({
                    "province_id": { $in: idProvinces }
                });
            }
            if (wards.length > 0) {
                const idWards = wards.map((item) => item._id);
                find["$or"].push({
                    "ward_id": { $in: idWards }
                });
            }
        }

        const category = req.query.category;
        if (category && category != "all") {
            find["category_id"] = category;
        }

        const provinceId = req.query.provinceId;
        if (provinceId && provinceId != "all") {
            find["province_id"] = provinceId;
        }

        // Pagination
        let objectPagination = {
            currentPage: 1,
            limitItems: 4
        }
        pagination(req.query, objectPagination)
        const countProduct = await BDS.countDocuments(find);
        const totalPage = Math.ceil(countProduct / objectPagination.limitItems)
        objectPagination.totalPage = totalPage
        //End Pagination

        const bds = await BDS.find(find)
            .limit(objectPagination.limitItems)
            .skip((objectPagination.currentPage - 1) * objectPagination.limitItems)
            .populate("ownerId", "username")
            .populate("category_id")
            .populate("amenityIds")
            .lean();
        console.log(bds);

        finalData = await Promise.all(bds.map(async (item) => {
            const unitAccs = await AccommodationUnit.find({
                "accommodation_id": item._id,
                "deleted": false
            });
            if(unitAccs.length > 0 ){
                console.log(unitAccs);
                let minPrice = unitAccs[0].price_per_night;
                unitAccs.forEach((unit) => {
                    if(unit.price_per_night && unit.price_per_night < minPrice) minPrice = unit.price_per_night;
                });
                if(minPrice) item.price = formatHelper.formatVNDMoney(minPrice);
            }
            return { ...item };
        }));

        return res.json({
            "success": true,
            "data": finalData,
            "currentPage": objectPagination.currentPage,
            "totalPage": objectPagination.totalPage
        });
    } catch (ex) {
        console.log("Có lỗi xảy ra khi lấy danh sách bất động sản: " + ex);
        return res.status(400).json({
            "success": false,
            "message": "Có lỗi xảy ra!"
        });
    }
}

// [GET] "/bds/detail/:id"
module.exports.detail = async (req, res) => {
    try {
        const id = req.params.id;

        const [data, accommodationUnits] = await Promise.all([
            await BDS.findOne({ "_id": id })
                .populate("category_id")
                .populate("amenityIds")
                .populate("province_id")
                .populate("ward_id").lean(),
            await AccommodationUnit.find({
                "accommodation_id": id,
                "deleted": false
            })
        ])

        console.log(accommodationUnits);
        if (data.price) data.price = formatHelper.formatVNDMoney(data.price);
        data.accommodationUnits = accommodationUnits;

        return res.json({
            "success": true,
            "detail": data
        });
    } catch (ex) {
        console.log("Có lỗi xảy ra khi lấy thông tin chi tiết bất động sản: " + ex);
        return res.json({
            "success": false,
            "message": ex
        });
    }
}

// [POST] "/bds/save"
module.exports.store = async (req, res) => {
    try {
        const tokenUser = req.cookies.tokenUser;
        const ownerId = await Account.findOne({ "tokenUser": tokenUser }).select("_id");
        if (!ownerId) return res.json({ "success": false });
        req.body.ownerId = ownerId._id;
        req.body.status = "pending";
        req.body.slug = await generateSlug(req.body.name + "", BDS);
        if (req.body.amenity.length > 0) req.body.amenityIds = JSON.parse(req.body.amenity);

        const result = await BDS.create(req.body);
        if (req.body.rooms) {
            const rooms = JSON.parse(req.body.rooms);

            const roomImages = req.body.roomImages || [];

            const roomImageRoomIds = Array.isArray(req.body.roomImageRoomIds)
                ? req.body.roomImageRoomIds
                : req.body.roomImageRoomIds
                    ? [req.body.roomImageRoomIds]
                    : [];

            await Promise.all(rooms.map(async (room) => {
                room["accommodation_id"] = result._id;

                const images = roomImages
                    .filter((image, index) => {
                        return roomImageRoomIds[index] == room["id-tmp"];
                    });

                room.images = images;

                await AccommodationUnit.create(room);
            }));
        }
        return res.json({
            "success": true
        });
    } catch (ex) {
        console.log("Có lỗi xảy ra khi lưu trữ thông tin bất động sản: " + ex);
        return res.json({
            "success": false,
            "message": ex
        });
    }
}
// [POST] "/bds/update/:id"
module.exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const tokenUser = req.cookies.tokenUser;
        const ownerId = await Account.findOne({ "tokenUser": tokenUser }).select("_id");
        if (!ownerId) return res.json({ "success": false });

        console.log(req.body);

        req.body.ownerId = ownerId._id;
        req.body.status = "pending";
        req.body.slug = await generateSlug(req.body.name + "", BDS);
        if (req.body.oldImages) {
            const oldImages = JSON.parse(req.body.oldImages);
            if (req.body.images) {
                oldImages.forEach((item) => {
                    req.body.images.push(item);
                })
            } else req.body.images = oldImages;
        }
        if (req.body.amenity.length > 0) req.body.amenityIds = JSON.parse(req.body.amenity);

        const result = await BDS.updateOne({ "_id": id }, { ...req.body });

        if (req.body.rooms.length > 0) {
            const rooms = JSON.parse(req.body.rooms);
            await Promise.all(rooms.map(async (item) => {
                await AccommodationUnit.create({
                    ...item,
                    "accommodation_id": id
                });
            }))
        }

        return res.json({ "success": true });
    } catch (ex) {
        console.log("Có lỗi xảy ra khi cập nhật thông tin bất động sản: " + ex);
        return res.json({
            "success": false,
            "message": "Có lỗi xảy ra. Vui lòng thử lại"
        });
    }
}

// [GET] "/bds/my-property"
module.exports.myProperty = async (req, res) => {
    try {
        const tokenUser = req.cookies.tokenUser;
        const user = await Account.findOne({ "tokenUser": tokenUser }).select("-password");
        const rawData = await BDS.find({
            "ownerId": user._id,
            "deleted": false
        }).lean();

        const accommodation = await Promise.all(rawData.map(async (item) => {
            const newData = { ...item };
            if (item.price) {
                newData.price = formatHelper.formatVNDMoney(newData.price.toString());
            }
            const amenity = await Amenity.find({ "_id": { $in: newData.amenityIds }, "status": "active" }).lean();
            newData.amenity = amenity;
            return newData;
        }))
        return res.json({ "success": true, "bds": accommodation });
    } catch (ex) {
        console.log("Có lỗi xảy ra khi lấy danh sách bất động sản của bản thân: " + ex);
        return res.json({ "success": false, "bds": [] })
    }
}

// [PATCH] "/bds/delete/:id"
module.exports.deleteProperty = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await BDS.updateOne({ "_id": id }, { 'deleted': true });
        return res.json({
            "success": true
        })
    } catch (ex) {
        console.log("Có lỗi xảy ra trong quá trình xoá cơ sở lưu trú: " + ex);
        return res.json({ "success": false });
    }
}

// [GET] "/bds/edit/:id"
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;
        const accommodationDetail = await BDS.findOne({ "_id": id });
        return res.json({
            "success": true,
            "accommodationDetail": accommodationDetail
        });

    } catch (ex) {
        console.log("Có lỗi xảy ra trong quá trình lấy thông tin cơ sở lưu trú: " + ex);
        return res.json({
            "success": false,
            "message": ex
        })
    }
}