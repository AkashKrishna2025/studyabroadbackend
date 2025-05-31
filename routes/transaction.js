

const express = require('express');
const router = express.Router();




/* Controllers */
const transactions = require('../controllers/transactions');
const authenticator = require('../middlewares/authenticator');


const routeCallback = function (res) {
    return (err, response) => {
        let status = 0;
        if (err) {
            status = err.status;
            return res.status(status).send(err);
        }
        status = response.status;
        return res.status(status).send(response);
    }
}

router.post('/razorPay/create', [authenticator()], function (req, res, next) {
    let data = req.body;
    data.req = req.data;
    transactions.createRazorPayPaymentIntents(data, routeCallback(res));
});



router.post('/verify/razorPay', [authenticator()], function (req, res, next) {
    let data = req.body;
    data.req = req.data;
    transactions.verifyRazorPayPayment(data, routeCallback(res));
});




module.exports = router;
