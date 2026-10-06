const Voucher = require("../models/voucher.model");
const VoucherUser = require("../models/voucher_user.model")

module.exports = (socket) => {
    socket.on("CLIENT_SEND_REQUEST_SAVE_VOUCHER",async (data) => {
        const voucherDetail = await Voucher.findOne({
            "_id": data.voucherId
        });
        if(!voucherDetail){
            return socket.emit("SERVER_RESPOND_REQUEST_SAVE_VOUCHER",{
                "success": false,
                "message": "Không tìm thấy voucher. Vui lòng thử lại",
                "userId": data.userId
            });
        }

        if(voucherDetail.quantity <= 0){
            return socket.emit("SERVER_RESPOND_REQUEST_SAVE_VOUCHER",{
                "success": false,
                "message": "Số lượng voucher đã hết!",
                "userId": data.userId
            });
        }
        const check = await VoucherUser.findOne({
            "voucher_id": data.voucherId,
            "user_id": data.userId
        })

        if(check !== null){
            return socket.emit("SERVER_RESPOND_REQUEST_SAVE_VOUCHER",{
                "success": false,
                "message": "Bạn không thể lưu voucher này lần nữa!",
                "userId": data.userId
            });
        }

        const result = await Voucher.updateOne({"_id": data.voucherId},{"quantity": voucherDetail.quantity-1});
        const resultSave = await VoucherUser.create({
            "voucher_id": data.voucherId,
            "user_id": data.userId
        });
        
        _io.emit("SERVER_RESPOND_REQUEST_SAVE_VOUCHER",{
            "success": true,
            "message": "Lưu voucher thành công",
            "newQuantity": voucherDetail.quantity-1,
            "voucherId": voucherDetail._id,
            "userId": data.userId
        });
    })

    socket.on("CLIENT_SEND_REQUEST_CANCEL_SAVE_VOUCHER",async (data) => {
        const voucherDetail = await Voucher.findOne({
            "_id": data.voucherId
        });
        if(!voucherDetail){
            return _io.emit("SERVER_RESPOND_REQUEST_SAVE_VOUCHER",{
                "success": false,
                "message": "Không tìm thấy voucher. Vui lòng thử lại"
            });
        }

        const result = await Voucher.updateOne({"_id": data.voucherId},{"quantity": voucherDetail.quantity+1});
        
        const resultUnSaved = await VoucherUser.deleteOne({
            "user_id": data.userId,
            "voucher_id": data.voucherId
        });

        _io.emit("SERVER_RESPOND_REQUEST_CANCEL_SAVE_VOUCHER",{
            "success": true,
            "message": "Huỷ lưu voucher thành công",
            "newQuantity": voucherDetail.quantity+1,
            "voucherId": voucherDetail._id,
            "userId": data.userId
        });
    })
}