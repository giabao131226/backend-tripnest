const Category = require("../../models/categories.model");
// [GET] "/categories"
module.exports.index = async (req,res) => {
    try{
        const categories = await Category.find({});
        return res.status(200).json({
            "success": true,
            "categories": categories
        });
    }catch(ex){
        console.log("Có lỗi tại controller categories.index: "+ex);
        return req.status(400).json({"success": false,"message": "Có lỗi xảy ra!"});
    }
}