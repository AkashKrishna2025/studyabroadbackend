const bcrypt = require('bcrypt');
const saltRounds = 10;


exports.encryptUserPassword = async (password) => {
    let hash = await bcrypt.hash(password, saltRounds)
    console.log(hash)
    return hash;
}

exports.decryptUserPassword = async (plainText, password) => {
    let result = await bcrypt.compare(plainText, password)
    console.log(result)
    return result
}
