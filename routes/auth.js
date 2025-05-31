const express = require('express');
const router = express.Router();




/* Controllers */
const auth = require('../controllers/auth');
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

router.post('/generate/phone/otp', function (req, res, next) {
    let data = req.body;
    data.req = req.data;
    auth.generatePhoneOTP(data, routeCallback(res));
});

router.post('/verify/phone/otp', function (req, res, next) {
    let data = req.body;
    data.req = req.data;
    auth.verifyPhoneOTPAndLogin(data, routeCallback(res));
});

router.post('/admin/login', function (req, res, next) {
    let data = req.body;
    data.req = req.data;
    auth.adminLogin(data, routeCallback(res));
});

router.post('/admin/change/password', [authenticator(['ADMIN'])], function (req, res, next) {
    let data = req.body;
    data.req = req.data;
    auth.adminChangePassword(data, routeCallback(res));
});

router.post('/google/login', function (req, res, next) {
    let data = req.body;
    data.req = req.data;
    auth.googleLogin(data, routeCallback(res));
});




module.exports = router;
