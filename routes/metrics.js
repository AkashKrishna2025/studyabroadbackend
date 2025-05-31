const express = require('express');
const router = express.Router();




/* Controllers */
const metrics = require('../controllers/metrics');
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



router.get('/dashboard', [authenticator(['ADMIN'])], function (req, res, next) {
    let data = req.query;
    data.req = req.data;
    metrics.getDashboardMetrics(data, routeCallback(res));
});





module.exports = router;
