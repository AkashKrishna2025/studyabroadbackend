
const async = require('async');

const Institutes = require('../models/institute');


const sendResponse = require('../helpers/sendResponse');
const { findDocumentsWithPagination } = require('../helpers/utils');



const addNewInstitute = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }

    let createPayload = {
        universityName: data.universityName,
        universityLogo: data.universityLogo,
        country: data.country,
        city: data.city,
        bannerImage: data.bannerImage,
        brochure: data.brochure,
        overview: data.overview,
        admissionReq: data.admissionReq,
        universityStats: data.universityStats,
        uniqueUniversityInfo: data.uniqueUniversityInfo,
        ranking: data.ranking
    };
    Institutes.create(createPayload)
        .then(res => {
            return cb(null, sendResponse(200, 'Success', null))
        })
        .catch(err => {
            console.log(err);
            return cb(sendResponse(500, "something went wrong", null))
        })
}
exports.addNewInstitute = addNewInstitute;

const instituteListingPagination = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }

    let matchCondition = {};
    if (data.search) {
        matchCondition.universityName = { $regex: data.search, $options: 'i' };
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

    let payload = {
        skip,
        limit,
        matchCondition,
        sortCondition,
        collection: Institutes
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
exports.instituteListingPagination = instituteListingPagination;


const editInstitute = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    if (!data.instituteId) {
        return cb(sendResponse(400, "Missing Params", null))
    }
    let payload = {
        _id: data.instituteId,
    }
    let update = {
        universityName: data.universityName,
        universityLogo: data.universityLogo,
        country: data.country,
        city: data.city,
        bannerImage: data.bannerImage,
        brochure: data.brochure,
        overview: data.overview,
        admissionReq: data.admissionReq,
        universityStats: data.universityStats,
        uniqueUniversityInfo: data.uniqueUniversityInfo,
        ranking: data.ranking
    }
    Institutes.findOneAndUpdate(payload, update)
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
exports.editInstitute = editInstitute;



const instituteListing = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    let payload = {}
    Institutes.find(payload)
        .then(res => {
            return cb(null, sendResponse(200, 'Success', res))
        })
        .catch(err => {
            console.log(err);
            return cb(sendResponse(500, "something went wrong", null))
        })

}
exports.instituteListing = instituteListing;