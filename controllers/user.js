
const async = require('async');

const Users = require('../models/users');
const Interests = require('../models/interests');
const twilioService = require('../helpers/twilioService');


const sendResponse = require('../helpers/sendResponse');
const { findDocumentsWithPagination } = require('../helpers/utils');

const sendWelcomeEmail = async (user) => {
  const to = user.email;
  const subject = "Welcome to Edulley Study Abroad!";
  const body = `
  <!DOCTYPE html>
  <html lang="en" style="margin: 0; padding: 0;">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Edulley</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.4; color: #333; background-color: #f9f9f9;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="min-width: 100%; background-color: #f9f9f9;">
      <tr>
        <td align="center" valign="top">
          <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff;">
            <tr>
              <td style="background-color: #4CAF50; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px; color: white;">Welcome to Edulley</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px;">
                <p style="margin-top: 0;">Welcome to Edulley! Your Gateway to Study Abroad—thousands of courses, 500+ Universities, and professional counselors excited to help you. Let's help you!</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://www.edulley.com/explore" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Explore Opportunities</a>
                </div>
              </td>
            </tr>
            <tr>
              <td style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 14px; color: #666;">
                <p style="margin: 0 0 10px 0;">Need assistance? Contact our support team at support@edulley.com</p>
                <p style="margin: 0;">&copy; 2024 Edulley. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
  try {
    await twilioService.sendEmail(to, subject, body);
    console.log(`Welcome email sent successfully to ${to}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};


const addNewUserWithPhoneNumber = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }

    if (!data.fullName || !data.countryCode || !data.phoneNumber || !data.email) {
        return cb(sendResponse(400, "Missing Params", null));
    }

    let waterfallFunctions = []
    waterfallFunctions.push(async.apply(validateNewUserDetails, data));
    waterfallFunctions.push(async.apply(addNewUserWithPhoneNumberToDB, data));
    // waterfallFunctions.push(async.apply(generateLoginToken, data));

    async.waterfall(waterfallFunctions, cb);
}
exports.addNewUserWithPhoneNumber = addNewUserWithPhoneNumber;


const validateNewUserDetails = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }

    let findData = {
        $or: [
            { email: data.email },
            { phoneNumber: data.phoneNumber, countryCode: data.countryCode }
        ]
    }
    let projection = {
    }

    Users.findOne(findData, projection)
        .then((res) => {
            if (res) {
                return cb(sendResponse(400, 'Email/Phone Already Registered', null))
            }
            return cb(null, sendResponse(200, 'Success', null))
        })
        .catch((err) => {
            console.log(err);
            return cb(sendResponse(500, "something went wrong", null))
        })
}


const addNewUserWithPhoneNumberToDB = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }

    let createPayload = {
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        countryCode: data.countryCode,
        email: data.email,
        signupSource: 'PHONE_NUMBER'
    }

    Users.create(createPayload)
        .then((res) => {
            data.userDetails = res;
            sendWelcomeEmail(res);
            return cb(null, sendResponse(200, 'Success', null))
        })
        .catch((err) => {
            console.log(err);
            return cb(sendResponse(500, "something went wrong", null))
        })
}

const createInterest = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }

    let createPayload = {
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        studyDestination: data.studyDestination,
        studyLevel: data.studyLevel
    }

    Interests.create(createPayload)
        .then((res) => {
            return cb(null, sendResponse(200, 'Success', null))
        })
        .catch((err) => {
            console.log(err);
            return cb(sendResponse(500, "something went wrong", null))
        })
}
exports.createInterest = createInterest;



const getUserInterestsPagination = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }

    let matchCondition = {};

    let sortCondition = {
        createdAt: -1
    };

    let limit = parseInt(process.env.pageLimit);

    if (data.limit && !Number.isNaN(parseInt(data.limit))) {
        limit = parseInt(data.limit)
    }
    let skip = 0;
    let currentPage = 1;

    if (data.currentPage && !Number.isNaN(parseInt(data.currentPage))) {
        currentPage = parseInt(data.currentPage);
        skip = currentPage > 0 ? (currentPage - 1) * limit : 0;
    };

    let payload = {
        skip,
        limit,
        matchCondition,
        sortCondition,
        collection: Interests
    };

    findDocumentsWithPagination(payload, (err, res) => {
        if (err) {
            console.log(err);
            return cb(sendResponse(500, "something went wrong", null))
        };
        let dataToSend = {
            totalCount: res?.data?.[0] || 0,
            limit,
            currentPage,
            list: res?.data?.[1] || [],
        }
        return cb(null, sendResponse(200, "Success", dataToSend))
    })
}
exports.getUserInterestsPagination = getUserInterestsPagination;
