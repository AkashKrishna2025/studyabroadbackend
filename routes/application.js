const express = require('express');
const router = express.Router();




/* Controllers */
const applications = require('../controllers/applications');
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



router.get('/list/pagination', [authenticator(['ADMIN'])], function (req, res, next) {
    let data = req.query;
    data.req = req.data;
    applications.applicationListingPagination(data, routeCallback(res));
});



router.get('/list', [authenticator()], function (req, res, next) {
    let data = req.query;
    data.req = req.data;
    applications.applicationListing(data, routeCallback(res));
});

router.get('/user/applied', [authenticator()], function (req, res, next) {
    let data = req.query;
    data.req = req.data;
    applications.getUserApplications(data, routeCallback(res));
});


router.get('/id/details', [authenticator()], function (req, res, next) {
    let data = req.query;
    data.req = req.data;
    applications.getApplicationDetailsById(data, routeCallback(res));
});


router.post('/apply', [authenticator()], function (req, res, next) {
    let data = req.body;
    data.req = req.data;
    applications.createNewApplication(data, routeCallback(res));
});


router.post('/update/status', [authenticator(['ADMIN'])], function (req, res, next) {
    let data = req.body;
    data.req = req.data;
    applications.updateApplicationStatus(data, routeCallback(res));
});




module.exports = router;
