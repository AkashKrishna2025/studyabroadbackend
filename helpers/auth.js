const crypto = require('crypto');
const jwt = require('jsonwebtoken');


const sendResponse = require('./sendResponse');

/**
 * @param  {string} email - email
 * returns true or false
 */
// Input Validators
const validateEmail = function (email) {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};
exports.validateEmail = validateEmail;



const encryptUserDetails = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    try {
        let { userDetails } = data;
        let expiresIn = '365d';


        let signOptions = {
            issuer: "Authorization",
            subject: "iam@user.me",
            audience: "STAB",
            expiresIn,
            algorithm: "HS256"
        };

        console.log("userDetails to encrypt for login Token :: ", userDetails, signOptions)


        let encryptedData = jwt.sign(userDetails, process.env.PASS_SALT_STATIC, signOptions);

        return cb(null, sendResponse(200, 'Success', encryptedData))

    } catch (err) {
        console.log(err)
        return cb(sendResponse(500, 'Something went wrong', null))
    }
}
exports.encryptUserDetails = encryptUserDetails;


const decryptJWTToken = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    try {
        let { accessToken } = data;

        let expiresIn = '365d';

        let verifyOptions = {
            issuer: "Authorization",
            subject: "iam@user.me",
            audience: "STAB",
            expiresIn,
            algorithm: "HS256"
        };
        let decryptedData = jwt.verify(accessToken, process.env.PASS_SALT_STATIC, verifyOptions);
        // console.log("decryptedData", decryptedData)
        return cb(null, sendResponse(200, 'Success', decryptedData))
    } catch (err) {
        console.log(err)
        return cb(sendResponse(401, 'Invalid Access Token', null))
    }
}
exports.decryptJWTToken = decryptJWTToken;