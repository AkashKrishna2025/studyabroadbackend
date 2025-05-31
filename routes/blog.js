const express = require('express');
const router = express.Router();




/* Controllers */
const blogs = require('../controllers/blog');
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
    blogs.addNewBlog(data, routeCallback(res));
});

router.post('/edit', [authenticator(['ADMIN'])], function (req, res, next) {
    let data = req.body;
    data.req = req.data;
    blogs.editBlog(data, routeCallback(res));
});


router.get('/list/pagination', [], function (req, res, next) {
    let data = req.query;
    data.req = req.data;
    blogs.blogsListingPagination(data, routeCallback(res));
});


router.get('/list', [], function (req, res, next) {
    let data = req.query;
    data.req = req.data;
    blogs.blogsListing(data, routeCallback(res));
});





module.exports = router;
