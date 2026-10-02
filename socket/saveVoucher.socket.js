const Voucher = require("../models/voucher.model");
const VoucherUser = require("../models/voucher_user.model")

module.exports = (socket) => {
    socket.on("CLIENT_SEND_REQUEST_SAVE_VOUCHER",async (data) => {
        const voucherDetail = await Voucher.findOne({
            "_id": data.voucherId
        });
        if(!voucherDetail){
            return socket.emit("SERVER_RESPOND_REQUEST_SAVE_VOUCHER",{
                "status": false,
                "message": "Không tìm thấy voucher. Vui lòng thử lại"
            });
        }

        if(voucherDetail.quantity <= 0){
            return socket.emit("SERVER_RESPOND_REQUEST_SAVE_VOUCHER",{
                "status": false,
                "message": "Số lượng voucher đã hết!"
            });
        }

        const result = await Voucher.updateOne({"_id": data.voucherId},{"quantity": voucherDetail.quantity-1});
        const resultSave = await VoucherUser.create({
            "voucher_id": data.voucherId,
            "user_id": data.userId
        });
        
        socket.emit("SERVER_RESPOND_REQUEST_SAVE_VOUCHER",{
            "status": true,
            "message": "Lưu voucher thành công",
            "newQuantity": voucherDetail.quantity-1,
            "voucherId": voucherDetail._id
        });
    })
}