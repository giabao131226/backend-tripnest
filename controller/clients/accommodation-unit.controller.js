const AccommodationUnit = require("../../models/accommodationUnit.model");
const BDS = require("../../models/bds.model");
// [GET] "/accommodation-unit/detail/:id"
module.exports.detail = async (req,res) => {
    try {
        const id = req.params.id;
        console.log(id);
        const detail = await AccommodationUnit.findOne({
            "_id": id,
            "status": "active",
            "deleted": false
        }).lean();

        const acc = await BDS.findOne({
            "_id": detail["accommodation_id"]
        }).select("name");

        if(acc) detail.titleAcc = acc.name;

        return res.status(200).json({
            "success": true,
            "detail": detail,
        });
    } catch (ex) {
        console.log("Có lỗi tại controller accommodationUnit.detail: " + ex);
        return res.status(400).json({ 
            "success": false, 
            "message": "Có lỗi xảy ra!" 
        });
    }
}