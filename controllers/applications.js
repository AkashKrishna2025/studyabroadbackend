

const async = require('async');

const Applications = require('../models/applications');


const sendResponse = require('../helpers/sendResponse');
const { findDocumentsWithPagination } = require('../helpers/utils');



const applicationListingPagination = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }

    let matchCondition = {};
    if (data.search) {
        matchCondition.userId.name = { $regex: data.search?.trim(), $options: 'i' };
    }

    let sortCondition = {
        createdAt: -1
    };

    let limit = parseInt(process.env.pageLimit);

    if (data.limit && !Number.isNaN(parseInt(data.limit))) {
        limit = parseInt(data.limit)
    }
    let skip = 0;
    let currentPage = 1;

    if (data.currentPage && !Number.isNaN(parseInt(data.currentPage))) {
        currentPage = parseInt(data.currentPage);
        skip = currentPage > 0 ? (currentPage - 1) * limit : 0;
    };
    let populate = 'courseId userId'


    let payload = {
        skip,
        limit,
        matchCondition,
        sortCondition,
        populate,
        collection: Applications
    };

    findDocumentsWithPagination(payload, (err, res) => {
        if (err) {
            console.log(err);
            return cb(sendResponse(500, "something went wrong", null))
        };
        let dataToSend = {
            totalCount: res?.data?.[0] || 0,
            limit,
            currentPage,
            list: res?.data?.[1] || [],
        }
        return cb(null, sendResponse(200, "Success", dataToSend))
    })
}
exports.applicationListingPagination = applicationListingPagination;



const applicationListing = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    let payload = {}
    let populate = 'courseId userId'
    Applications.find(payload)
        .populate(populate)
        .then(res => {
            // Ensure userId is not null in the response
            const validatedRes = res.map(app => {
                if (app.userId === null) {
                    app.userId = app.userId || { _id: 'unknown' }; // Provide a default value if userId is null
                }
                return app;
            });
            return cb(null, sendResponse(200, 'Success', validatedRes));
        })
        .catch(err => {
            console.log(err);
            return cb(sendResponse(500, "something went wrong", null))
        })
}
exports.applicationListing = applicationListing;
exports.applicationListing = applicationListing;


const createNewApplication = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    if (!data.courseId) {
        return cb(sendResponse(400, "Missing Params", null));
    };
    let findPayload = {
        userId: data.req.auth.id,
        courseId: data.courseId
    }
    console.log(data.req.auth,'data.req.auth-------------------------->>>>>>>>>>>>>>>>>>>>>>')
    let updatePayload = {
        userId: data.req.auth.id,
        courseId: data.courseId
    }
    let options = {
        upsert: true
    }
    Applications.findOneAndUpdate(findPayload, updatePayload, options)
        .then(res => {
            if (res) {
                return cb(sendResponse(400, 'Already applied for this Course!', null))
            }
            return cb(null, sendResponse(200, 'Success', null))
        })
        .catch(err => {
            console.log(err);
            return cb(sendResponse(500, "something went wrong", null))
        })
}
exports.createNewApplication = createNewApplication;


const getApplicationDetailsById = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    if (!data.applicationId) {
        return cb(sendResponse(400, "Missing Params", null));
    };
    let findPayload = {
        _id: data.applicationId,
    }

    let populate = 'courseId userId'

    Applications.findOne(findPayload).populate(populate)
        .then(res => {
            return cb(null, sendResponse(200, 'Success', res))
        })
        .catch(err => {
            console.log(err);
            return cb(sendResponse(500, "something went wrong", null))
        })
}
exports.getApplicationDetailsById = getApplicationDetailsById;


const getUserApplications = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }

    let findPayload = {
        userId: data.req.auth.id, // Always use the authenticated user's ID
    }
    if (data.applicationId) {
        findPayload['_id'] = data.applicationId
    }

    let populate = 'courseId'


    Applications.find(findPayload).populate(populate)
        .then(res => {
            console.log(res)
            return cb(null, sendResponse(200, 'Success', res))
        })
        .catch(err => {
            console.log(err);
            return cb(sendResponse(500, "something went wrong", null))
        })
}
exports.getUserApplications = getUserApplications;



const updateApplicationStatus = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    if (!data.applicationId || !data.status) {
        return cb(sendResponse(400, "Missing Params", null));
    };
    let findPayload = {
        _id: data.applicationId
    }
    let updatePayload = {
        status: data.status
    }

    Applications.updateOne(findPayload, updatePayload)
        .then(res => {
            return cb(null, sendResponse(200, 'Success', null))
        })
        .catch(err => {
            console.log(err);
            return cb(sendResponse(500, "something went wrong", null))
        })
}
exports.updateApplicationStatus = updateApplicationStatus;