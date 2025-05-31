
const async = require('async');

const Scholarship = require('../models/scholarship');


const sendResponse = require('../helpers/sendResponse');
const { findDocumentsWithPagination } = require('../helpers/utils');



const addNewScholarship = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }

    let createPayload = {
        name: data.name,
        universityName: data.universityName,
        coursesName: data.coursesName,
        deadline: data.deadline,
        level: data.level,
        amount: data.amount,
        country: data.country
    };
    Scholarship.create(createPayload)
        .then(res => {
            return cb(null, sendResponse(200, 'Success', null))
        })
        .catch(err => {
            console.log(err);
            return cb(sendResponse(500, "something went wrong", null))
        })
}
exports.addNewScholarship = addNewScholarship;

const editScholarship = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    if (!data.scholarshipId) {
        return cb(sendResponse(400, "Missing Params", null))
    }
    let payload = {
        _id: data.scholarshipId,
    }
    let update = {
        name: data.name,
        universityName: data.universityName,
        coursesName: data.coursesName,
        deadline: data.deadline,
        level: data.level,
        amount: data.amount,
        country: data.country

    }
    Scholarship.findOneAndUpdate(payload, update)
        .then(res => {
            console.log(res)
            if (!res) {
                return cb(sendResponse(400, "Invalid Details", null))
            };
            return cb(null, sendResponse(200, "Updated !!", null))
        })
        .catch(err => {
            console.log(err);
            return cb(sendResponse(500, "", null));
        })
}
exports.editScholarship = editScholarship;

const scholarshipListingPagination = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }

    let matchCondition = {};

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

    let payload = {
        skip,
        limit,
        matchCondition,
        sortCondition,
        collection: Scholarship
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
exports.scholarshipListingPagination = scholarshipListingPagination;



const scholarshipListing = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    let payload = {}
    Scholarship.find(payload)
        .then(res => {
            return cb(null, sendResponse(200, 'Success', res))
        })
        .catch(err => {
            console.log(err);
            return cb(sendResponse(500, "something went wrong", null))
        })

}
exports.scholarshipListing = scholarshipListing;