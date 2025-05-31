const express = require('express');
const router = express.Router();




/* Controllers */
const chats = require('../controllers/chat');
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

router.post('/application/', [authenticator()], function (req, res, next) {
    let data = req.body;
    data.req = req.data;
    chats.addNewApplicationChat(data, routeCallback(res));
});
router.post('/admin/application/', [authenticator(['ADMIN'])], function (req, res, next) {
    let data = req.body;
    data.req = req.data;
    chats.addNewApplicationChatAdmin(data, routeCallback(res));
});


router.get('/application/pagination', [authenticator()], function (req, res, next) {
    let data = req.query;
    data.req = req.data;
    chats.applicationChatListingPagination(data, routeCallback(res));
});

router.get('/application/list', [authenticator()], function (req, res, next) {
    let data = req.query;
    data.req = req.data;
    chats.applicationChatListing(data, routeCallback(res));
});





module.exports = router;
