const express = require('express');
const router = express.Router();




/* Controllers */
const institutes = require('../controllers/institute');
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

router.post('/add/new', [authenticator(['ADMIN'])], function (req, res, next) {
    let data = req.body;
    data.req = req.data;
    institutes.addNewInstitute(data, routeCallback(res));
});
router.post('/edit', [authenticator(['ADMIN'])], function (req, res, next) {
    let data = req.body;
    data.req = req.data;
    institutes.editInstitute(data, routeCallback(res));
});


router.get('/list/pagination', [], function (req, res, next) {
    let data = req.query;
    data.req = req.data;
    institutes.instituteListingPagination(data, routeCallback(res));
});


router.get('/list', function (req, res, next) {
    let data = req.query;
    data.req = req.data;
    institutes.instituteListing(data, routeCallback(res));
});





module.exports = router;
