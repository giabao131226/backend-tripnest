


module.exports.validateName = (value) => {
    return /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])[A-Za-z0-9]{6,20}$/.test(value);
}
module.exports.validatePassword = (value) => {
    return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,20}$/.test(value)
}
module.exports.validateEmail = (value) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
}
module.exports.validatePhone = (value) => {
    return /^0(3|5|7|8|9)[0-9]{8}$/.test(value);
}

