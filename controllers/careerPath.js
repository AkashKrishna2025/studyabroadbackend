
const async = require('async');

const CareerPath = require('../models/careerPath');


const sendResponse = require('../helpers/sendResponse');
const { findDocumentsWithPagination } = require('../helpers/utils');



const addNewCareerPath = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }

    let createPayload = {
        latestQualification: data.latestQualification,
        specialization: data.specialization,
        coursesName: data.coursesName,
    };
    CareerPath.create(createPayload)
        .then(res => {
            return cb(null, sendResponse(200, 'Success', null))
        })
        .catch(err => {
            console.log(err);
            return cb(sendResponse(500, "something went wrong", null))
        })
}
exports.addNewCareerPath = addNewCareerPath;

const editCareerPath = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    if (!data.careerPathId) {
        return cb(sendResponse(400, "Missing Params", null))
    }
    let payload = {
        _id: data.careerPathId,
    }
    let update = {
        latestQualification: data.latestQualification,
        specialization: data.specialization,
        coursesName: data.coursesName,
    }
    CareerPath.findOneAndUpdate(payload, update)
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
exports.editCareerPath = editCareerPath;

const careerPathListingPagination = function (data, response, cb) {
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
        collection: CareerPath
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
exports.careerPathListingPagination = careerPathListingPagination;



const careerPathListing = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    let payload = {};
    CareerPath.find(payload)
        .then(res => {
            return cb(null, sendResponse(200, 'Success', res))
        })
        .catch(err => {
            console.log(err);
            return cb(sendResponse(500, "something went wrong", null))
        })

}
exports.careerPathListing = careerPathListing;