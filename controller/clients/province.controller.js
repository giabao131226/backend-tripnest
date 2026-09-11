const Province = require("../../models/province.model");
const Ward = require("../../models/ward.model");

// [GET] "/province-ward"
module.exports.index = async (req,res) => {
    try{
        const provinces = await Province.find({"status": "active"}).lean();
        const data = await Promise.all(provinces.map(async (province) => {
            const wards = await Ward.find({
                "province_id": province._id.toString(),
                "status": "active"
            }).lean();
            return {...province,"wards": wards}
        }))
        return res.json({"success": true,"data": data});
    }catch(ex){
        console.log("Có lỗi xảy ra khi lấy dữ liệu tỉnh/thành phố: "+ex);
        return res.json({"success": false});
    }
}

// [GET] "/province-only"
module.exports.provinceOnly = async (req,res) => {
    try{
        const provinces = await Province.find({
            "status": "active"
        }).lean();
    
        return res.json({"success": true,"data": provinces});
    }catch(ex){
        console.log("Có lỗi xảy ra khi lấy dữ liệu tỉnh/thành phố: "+ex);
        return res.json({
            "success": false,
            "message": "Có lỗi xảy ra. Không thể lấy được tên thành phố"
        });
    }
}