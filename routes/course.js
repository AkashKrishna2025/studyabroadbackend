const express = require('express');
const router = express.Router();




/* Controllers */
const courses = require('../controllers/courses');
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
    courses.addNewCourse(data, routeCallback(res));
});

router.post('/edit', [authenticator(['ADMIN'])], function (req, res, next) {
    let data = req.body;
    data.req = req.data;
    courses.editCourse(data, routeCallback(res));
});


router.get('/list/pagination', [authenticator()], function (req, res, next) {
    let data = req.query;
    data.req = req.data;
    courses.coursesListingPagination(data, routeCallback(res));
});



router.get('/list',function (req, res, next) {
    let data = req.query;
    data.req = req.data;
    courses.coursesListing(data, routeCallback(res));
});

router.post('/toggle-shortlist', [authenticator()], function (req, res, next) {
    let data = req.body;
    data.req = req.data;
    courses.toggleShortlist(data, routeCallback(res));
});
module.exports = router;
