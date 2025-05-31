const { decryptJWTToken } = require("../helpers/auth")


module.exports = (roles) => (req, res, next) => {

    if (!req.data.request) {
        console.log("Invalid Request");
        let response = {
            success: false,
            message: 'Failed to authenticate token at Lv0'
        };
        return res.status(401).send(response);
    }

    let accessToken = req.headers['x-access-token']
    if (!accessToken) {
        let response = {
            success: false,
            message: 'Not Authorized'
        };
        return res.status(401).send(response);
    }
    let payload = {
        accessToken
    }

    decryptJWTToken(payload, (error, response) => {
        // console.log(error, response)
        if (error) {
            return res.status(error.status || 401).send(error);
        }
        let userDetails = response.data
        if (!userDetails || (roles && !roles?.includes(userDetails.role))) {
            let response = {
                success: false,
                message: 'Failed to authenticate token at Lv1'
            };
            return res.status(401).send(response);
        }
        req.data.auth = {
            id: userDetails._id,
            role: userDetails.role,
            adminId: userDetails.adminId,
            fullName: userDetails.fullName
        };
        next();
    })


}