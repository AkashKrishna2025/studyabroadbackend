const express = require('express');
const router = express.Router();




/* Controllers */
const users = require('../controllers/user');

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

/* POST user registry. */
router.post('/phone/register', function (req, res, next) {
    let data = req.body;
    data.req = req.data;
    users.addNewUserWithPhoneNumber(data, routeCallback(res));
});



router.post('/create/interest', [], function (req, res, next) {
    let data = req.body;
    data.req = req.data;
    users.createInterest(data, routeCallback(res));
});

router.get('/interest/list/pagination', [authenticator(['ADMIN'])], function (req, res, next) {
    let data = req.body;
    data.req = req.data;
    users.getUserInterestsPagination(data, routeCallback(res));
});




module.exports = router;
