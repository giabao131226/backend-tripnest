const voucherSocket = require("./saveVoucher.socket")
module.exports = () => {
    _io.on("connection",(socket) => {
        console.log("Client connected: "+socket.id);
        voucherSocket(socket);
    })
}