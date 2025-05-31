/**
 * Response Format
 * @description Format Response and send
 * @param {Number} status
 * @param {String} message
 * @param {String} action
 * @param {String} data
 * @param {String} signature
 * @returns {JSON} Return response
 */
module.exports = function (status, message, data, signature) {
    let response = {}
    let statusArr = process.env.STATUS.split(",");
    statusArr = statusArr.map((status) => +status);

    switch (status) {
        case statusArr[0]: // status = 200
            response = {
                //action: action,
                status: status,
                message: message,
                data: data,
                error: false,
                // signature
            };
            break;
        case statusArr[1]: // status = 500
            response = {
                //action: action,
                status: status,
                message: message ? message : "Something went wrong",
                data: data,
                error: true,
                // signature
            };
            break;
        case statusArr[2]: // status = 400
            response = {
                // signature: signature,
                //action: action,
                status: status,
                message: message ? message : "Missing params",
                data: data,
                error: true,
                // signature
            };
            break;
        default:
            response = {
                // signature: signature,
                // action: action,
                status: status,
                message: message,
                data: data,
                error: true,
                // signature
            };
    }
    return response;
};
