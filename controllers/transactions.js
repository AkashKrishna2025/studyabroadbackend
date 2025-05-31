
const async = require('async');
const crypto = require('crypto');

const Transactions = require('../models/transactions');
const razorPay = require('../helpers/razorPay');

const twilioService = require('../helpers/twilioService');
const sendResponse = require('../helpers/sendResponse');
const { findDocumentsWithPagination } = require('../helpers/utils');
const { updateApplicationStatus } = require('./applications');


const sendPaymentConfirmationEmail = async (user) => {
    const to = user.email;
    const subject = "Payment Confirmed - Your Journey with Edulley Begins!";
    const body = `
  <!DOCTYPE html>
  <html lang="en" style="margin: 0; padding: 0;">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Confirmation - Edulley</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.4; color: #333; background-color: #f9f9f9;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="min-width: 100%; background-color: #f9f9f9;">
      <tr>
        <td align="center" valign="top">
          <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff;">
            <tr>
              <td style="background-color: #4CAF50; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px; color: white;">Payment Confirmed</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px;">
                <p style="margin-top: 0;">Congratulations on your visa approval! Get ready to embark on your learning journey with Edulley. We're excited to have you join us!</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://www.edulley.com/dashboard" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">View Your Dashboard</a>
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
      console.log(`Payment confirmation email sent successfully to ${to}`);
    } catch (error) {
      console.error('Error sending payment confirmation email:', error);
    }
  };
const createRazorPayPaymentIntents = async function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    try {

        let userDetails = data.req.auth;

        if (!data.amount || !data.currency || !userDetails || !data.applicationId) {
            return cb(sendResponse(400, "Missing Params", null));
        }

        const razorPayRes = await razorPay.orders.create({
            amount: data.amount,
            currency: data.currency,
            receipt: `${userDetails?.fullName}`,
        });

        let createPayload = {
            applicationId: data.applicationId,
            orderId: razorPayRes.id,
            amount: data.amount,
            paymentMethod: 'RazorPay',
            userId: userDetails.id,
            type: 'ORDER',
            status: 'PENDING',
        }
        Transactions.create(createPayload)
            .then(res => {
                return cb(null, sendResponse(200, 'Payment Order created successfully', createPayload))
            })
            .catch((err) => {
                console.log(err);
                return cb(sendResponse(500, "something went wrong", null))
            })
    }
    catch (err) {
        console.log(err)
        return cb(sendResponse(500, "something went wrong", null));
    }


}
exports.createRazorPayPaymentIntents = createRazorPayPaymentIntents;



const verifyRazorPayPayment = async function (data, response, cb) {
    if (!cb) {
        cb = response;
    }

    let waterfallFunctions = []
    waterfallFunctions.push(async.apply(checkPaymentTransaction, data));
    waterfallFunctions.push(async.apply(verifyTransactionSignature, data));
    waterfallFunctions.push(async.apply(applicationStatusUpdateToPaid, data));
    waterfallFunctions.push(async.apply(sendPaymentConfirmationEmailWrapper, data));

    async.waterfall(waterfallFunctions, cb);

}
exports.verifyRazorPayPayment = verifyRazorPayPayment;



const checkPaymentTransaction = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    let userDetails = data.req.auth;

    if (!data.orderId || !userDetails) {
        return cb(sendResponse(400, "Missing Params", null));
    }

    let findPayload = {
        orderId: data.orderId,
        userId: userDetails.id,
    }
    Transactions.findOne(findPayload)
        .then((res) => {
            if (!res) {
                return cb(sendResponse(400, "Transaction not found", null));
            }
            return cb(null, sendResponse(200, 'Success', null))
        })
        .catch((err) => {
            console.log(err);
            return cb(sendResponse(500, "something went wrong", null))
        })

}

const verifyTransactionSignature = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    let userDetails = data.req.auth;

    if (!data.orderId || !userDetails || !data.paymentId || !data.signature) {
        return cb(sendResponse(400, "Missing Params", null));
    }

    let payload = `${data.orderId}|${data.paymentId}`;

    const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZOR_PAY_KEY_SECRET)
        .update(payload)
        .digest('hex');

    let status = 'COMPLETED';

    if (generatedSignature != data.signature) {
        status = 'FAILED'
    }

    let findPayload = {
        orderId: data.orderId,
        userId: userDetails.id,
    }

    let updatePayload = {
        status,
        paymentId: data.paymentId,
        signature: data.signature
    }

    console.log(findPayload, updatePayload);
    Transactions.findOneAndUpdate(findPayload, updatePayload)
        .then((res) => {
            if (status == 'FAILED') {
                return cb(sendResponse(400, "Payment Failed", null));
            }
            return cb(null, sendResponse(200, "Payment verified", null));
        })
        .catch((err) => {
            console.log(err);
            return cb(sendResponse(500, "something went wrong", null))
        })

}

const applicationStatusUpdateToPaid = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    let payload = {
        applicationId: data.applicationId,
        status: 'DEPOSIT_PAID',
    }
    updateApplicationStatus(payload, (err, res) => {
        if (err) {
            console.log(err);
            return cb(err);
        }
        return cb(null, res);
    })
}

const sendPaymentConfirmationEmailWrapper = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    
    // Assuming the user details are available in data.req.auth
    const user = data.req.auth;
    
    sendPaymentConfirmationEmail(user)
        .then(() => {
            return cb(null, sendResponse(200, "Payment verified and confirmation email sent", null));
        })
        .catch((error) => {
            console.error('Error in sending confirmation email:', error);
            // We're still considering the payment successful even if the email fails
            return cb(null, sendResponse(200, "Payment verified, but there was an issue sending the confirmation email", null));
        });
}



