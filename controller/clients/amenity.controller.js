const Amenity = require("../../models/amenity.model");

// [GET] "/amenity"
module.exports.index = async (req,res) => {
    try{
        const amenities = await Amenity.find({"status": "active"});
        return res.json({
            "success": true,
            "amenities": amenities
        })
    }catch(ex){
        console.log("Có lỗi xảy ra khi lấy danh sách tiện ích: "+ex);
        return res.json({"success": false});
    }
}