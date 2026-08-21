


module.exports.validateName = (value) => {
    return /^[a-zA-Z_][a-zA-Z0-9_]{5,19}$/.test(value)
}
module.exports.validatePassword = (value) => {
    return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,20}$/.test(value)
}
module.exports.validateEmail = (value) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
}
module.exports.validatePhone = (value) => {
    return /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(value)
}

