const sendResponse = require("./sendResponse");

const findDocumentsWithPagination = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }

    Promise.all([
        getTotalDocumentCounts(data),
        getPaginatedDocuments(data)
    ]).then(res => {
        // console.log("Pagination Res :: ", res)
        return cb(null, sendResponse(200, 'Success', res))
    }).catch(err => {
        console.log(err);
        return cb(sendResponse(500, null, null))
    })
}
exports.findDocumentsWithPagination = findDocumentsWithPagination;

const getTotalDocumentCounts = function (data) {

    let { matchCondition, collection } = data;

    return collection.countDocuments(matchCondition);
}


const getPaginatedDocuments = function (data) {

    let { matchCondition, sortCondition, skip, limit, collection, populate, projection } = data;

    let execQuery = collection.find(matchCondition, projection).sort(sortCondition).skip(skip).limit(limit)

    if (populate) {
        execQuery.populate(populate)
    }
    return execQuery;
}
