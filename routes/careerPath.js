const express = require('express');
const router = express.Router();




/* Controllers */
const careerPath = require('../controllers/careerPath');
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
    careerPath.addNewCareerPath(data, routeCallback(res));
});

router.post('/edit', [authenticator(['ADMIN'])], function (req, res, next) {
    let data = req.body;
    data.req = req.data;
    careerPath.editCareerPath(data, routeCallback(res));
});


router.get('/list/pagination', [], function (req, res, next) {
    let data = req.query;
    data.req = req.data;
    careerPath.careerPathListingPagination(data, routeCallback(res));
});

router.get('/list', [], function (req, res, next) {
    let data = req.query;
    data.req = req.data;
    careerPath.careerPathListing(data, routeCallback(res));
});





module.exports = router;
