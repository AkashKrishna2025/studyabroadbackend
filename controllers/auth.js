const async = require('async')
const axios = require('axios')
const qs = require('qs')
const twilioService = require('../helpers/twilioService');

const sendResponse = require("../helpers/sendResponse");
const Users = require('../models/users');
const Admins = require('../models/admin');
const { encryptUserDetails } = require('../helpers/auth');

const generatePhoneOTP = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    if (!data.phoneNumber || !data.countryCode) {
        return cb(sendResponse(400, "Missing Params", null));
    }

    let waterfallFunctions = []
    waterfallFunctions.push(async.apply(checkPhoneNumberRegistered, data));
    waterfallFunctions.push(async.apply(sendOTPToNumber, data));

    async.waterfall(waterfallFunctions, cb);

}
exports.generatePhoneOTP = generatePhoneOTP;

const checkPhoneNumberRegistered = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    let findData = {
        phoneNumber: data.phoneNumber,
        isDelete: false
    }
    let projection = {
        _id: 1,
        fullName: 1,
        email: 1,
        role: 1,
        isActive: 1,
        phoneNumber: 1,
        signupSource: 1,
        createdAt: 1,
        countryCode: 1
    }

    Users.findOne(findData, projection)
        .then((res) => {
            if (!res) {
                return cb(sendResponse(400, 'Phone Number Not Registered', null))
            }
            data.userDetails = res;
            return cb(null, sendResponse(200, 'Success', res))
        })
        .catch((err) => {
            console.log(err);
            return cb(sendResponse(500, "something went wrong", null))
        })
}


// const sendOTPToNumber = function (data, response, cb) {
//     if (!cb) {
//         cb = response;
//     }
//     let templateId = process.env.MSG_91_TEMPLATE_ID
//     let countryCode = data.countryCode
//     let phoneNumber = data.phoneNumber

//     let params = {
//         template_id: templateId,
//         mobile: `${countryCode + phoneNumber}`,
//     }

//     let url = `https://control.msg91.com/api/v5/otp?${qs.stringify(params, { encode: false })}`;

//     const options = {
//         method: 'POST',
//         url,
//         headers: {
//             accept: 'application/json',
//             'content-type': 'application/json',
//             authkey: process.env.MSG_91_AUTHKEY,
//         }
//     };

//     axios(options)
//         .then(res => {
//             console.log(res.data || res)
//             if (res.status != 200) {
//                 return cb(sendResponse(400, "Error while sending OTP", null))
//             }
//             return cb(null, sendResponse(200, "OTP Sent !!", null))
//         })
//         .catch(err => {
//             console.log(err);
//             return cb(sendResponse(400, "Error while sending OTP", null))
//         })
// }
const sendOTPToNumber = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    let countryCode = data.countryCode
    let phoneNumber = data.phoneNumber

    // Call Twilio service to send OTP
    twilioService.sendOTP(`${countryCode}${phoneNumber}`)
        .then(status => {
            console.log('OTP sent status:', status);
            return cb(null, sendResponse(200, "OTP Sent !!", null))
        })
        .catch(err => {
            console.log('Error sending OTP:', err);
            return cb(sendResponse(400, "Error while sending OTP", null))
        });
}


const verifyPhoneOTPAndLogin = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    if (!data.phoneNumber || !data.countryCode || !data.otp) {
        return cb(sendResponse(400, "Missing Params", null));
    }

    let waterfallFunctions = []
    waterfallFunctions.push(async.apply(checkPhoneNumberRegistered, data));
    waterfallFunctions.push(async.apply(verifyPhoneNumberOTP, data));
    waterfallFunctions.push(async.apply(generateLoginToken, data));

    async.waterfall(waterfallFunctions, cb);

}
exports.verifyPhoneOTPAndLogin = verifyPhoneOTPAndLogin;


// const verifyPhoneNumberOTP = function (data, response, cb) {
//     if (!cb) {
//         cb = response;
//     }
//     let countryCode = data.countryCode;
//     let phoneNumber = data.phoneNumber;

//     let params = {
//         otp: data.otp,
//         mobile: `${countryCode + phoneNumber}`,
//     }

//     if (process.env.NODE_ENV == 'STAGING' && data.otp == '1234') {
//         return cb(null, sendResponse(200, "OTP Verified !!", null))
//     }


//     let url = `https://control.msg91.com/api/v5/otp/verify?${qs.stringify(params, { encode: false })}`;

//     const options = {
//         method: 'GET',
//         url,
//         headers: {
//             accept: 'application/json',
//             'content-type': 'application/json',
//             authkey: process.env.MSG_91_AUTHKEY,
//         }
//     };
//     console.log(options)
//     axios(options)
//         .then(res => {
//             console.log(res.data || res)
//             if (res?.data?.code != 200) {
//                 return cb(sendResponse(400, "Invalid OTP", null))
//             };
//             return cb(null, sendResponse(200, "OTP Verified !!", null))
//         })
//         .catch(err => {
//             console.log(err);
//             return cb(sendResponse(400, "Error while verifying OTP", null))
//         })
// };

const verifyPhoneNumberOTP = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    let countryCode = data.countryCode;
    let phoneNumber = data.phoneNumber;

    if (process.env.NODE_ENV == 'STAGING' && data.otp == '1234') {
        return cb(null, sendResponse(200, "OTP Verified !!", null))
    }

    // Call Twilio service to verify OTP
    twilioService.verifyOTP(`${countryCode}${phoneNumber}`, data.otp)
        .then(isValid => {
            if (isValid) {
                return cb(null, sendResponse(200, "OTP Verified !!", null))
            } else {
                return cb(sendResponse(400, "Invalid OTP", null))
            }
        })
        .catch(err => {
            console.log('Error verifying OTP:', err);
            return cb(sendResponse(400, "Error while verifying OTP", null))
        });
};

const generateLoginToken = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    let userDetails = data.userDetails;

    let payload = {
        userDetails: {
            _id: userDetails._id,
            email: userDetails.email,
            role: userDetails.role,
            fullName: userDetails.fullName,
            adminId: userDetails.adminId,
            // signupSource: userDetails.signupSource,
            permissions: userDetails.permissions
        }
    }
    encryptUserDetails(payload, (err, res) => {
        if (err) {
            return cb(sendResponse(err.status, err.message, null))
        }
        let dataToSend = {
            user: payload.userDetails,
            token: res.data
        }
        return cb(null, sendResponse(200, 'Success', dataToSend))
    })
}
exports.generateLoginToken = generateLoginToken;



const adminLogin = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    if (!data.adminId || !data.password) {
        return cb(sendResponse(400, "Missing Params", null));
    }

    let waterfallFunctions = []
    waterfallFunctions.push(async.apply(verifyAdminDetails, data));
    waterfallFunctions.push(async.apply(generateLoginToken, data));

    async.waterfall(waterfallFunctions, cb);

}
exports.adminLogin = adminLogin;

const adminChangePassword = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    if (!data.newPassword || !data.confirmPassword || !data.currentPassword) {
        return cb(sendResponse(400, "Missing Params", null));
    }

    if (data.newPassword != data.confirmPassword) {
        return cb(sendResponse(400, "Password Not Matched", null))
    }
    let payload = {
        adminId: data.req.auth.adminId,
        password: data.currentPassword
    }
    let update = {
        password: data.newPassword
    }
    Admins.findOneAndUpdate(payload, update)
        .then(res => {
            console.log(res)
            if (!res) {
                return cb(sendResponse(400, "Invalid Details", null))
            };
            return cb(null, sendResponse(200, "Verified !!", null))
        })
        .catch(err => {
            console.log(err);
            return cb(sendResponse(400, "Error while verifying", null));
        })
}
exports.adminChangePassword = adminChangePassword;

const verifyAdminDetails = (data, response, cb) => {
    if (!cb) {
        cb = response;
    }
    let payload = {
        adminId: data.adminId,
        password: data.password
    }
    Admins.findOne(payload)
        .then(res => {
            if (!res) {
                return cb(sendResponse(400, "Invalid Details", null))
            };
            data.userDetails = res;
            return cb(null, sendResponse(200, "Verified !!", null))
        })
        .catch(err => {
            console.log(err);
            return cb(sendResponse(400, "Error while verifying", null))
        })
}


const googleLogin = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    if (!data.email || !data.id) {
        return cb(sendResponse(400, "Missing Params", null));
    }

    let waterfallFunctions = []
    waterfallFunctions.push(async.apply(findOrCreateGoogleUser, data));
    waterfallFunctions.push(async.apply(generateLoginToken, data));

    async.waterfall(waterfallFunctions, cb);
}
exports.googleLogin = googleLogin;

const findOrCreateGoogleUser = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    let findData = {
        email: data.email,
        isDelete: false
    }
    let projection = {
        _id: 1,
        fullName: 1,
        email: 1,
        role: 1,
        isActive: 1,
        phoneNumber: 1,
        signupSource: 1,
        createdAt: 1,
        countryCode: 1
    }

    Users.findOne(findData, projection)
        .then((res) => {
            if (!res) {
                // Create new user
                let newUser = new Users({
                    fullName: data.name,
                    email: data.email,
                    role: 'USER',
                    isActive: true,
                    signupSource: 'GOOGLE',
                    googleId: data.id
                });
                return newUser.save();
            }
            return res;
        })
        .then((user) => {
            data.userDetails = user;
            return cb(null, sendResponse(200, 'Success', user))
        })
        .catch((err) => {
            console.log(err);
            return cb(sendResponse(500, "something went wrong", null))
        })
}