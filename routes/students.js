const express = require('express');
const router = express.Router();




/* Controllers */
const students = require('../controllers/students');
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

router.post('/add/new', [authenticator()], function (req, res, next) {
    let data = req.body;
    data.req = req.data;
    students.addNewStudent(data, routeCallback(res));
});

router.post('/edit', [authenticator()], function (req, res, next) {
    let data = req.body;
    data.req = req.data;
    students.editStudent(data, routeCallback(res));
});


router.get('/list/pagination', [authenticator()], function (req, res, next) {
    let data = req.query;
    data.req = req.data;
    students.studentsListingPagination(data, routeCallback(res));
});



router.get('/list', [authenticator()], function (req, res, next) {
    let data = req.query;
    data.req = req.data;
    students.studentsListing(data, routeCallback(res));
});



router.get('/id/details/', [authenticator()], function (req, res, next) {
    let data = req.query;
    data.req = req.data;
    students.getStudentDetailsById(data, routeCallback(res));
});


router.get('/groupBy/month', [authenticator()], function (req, res, next) {
    let data = req.query;
    data.req = req.data;
    students.numberOfStudentsByMonth(data, routeCallback(res));
});




module.exports = router;
