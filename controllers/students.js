
const async = require('async');

const Students = require('../models/students');


const sendResponse = require('../helpers/sendResponse');
const { findDocumentsWithPagination } = require('../helpers/utils');



const addNewStudent = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }

    let createPayload = {
        "userId": data.userId,
        "fullName": data.fullName,
        "gender": data.gender,
        "contactNumber": data.contactNumber,
        "email": data.email,
        "dob": data.dob,
        "maritalStatus": data.maritalStatus,
        "mailingAddress": data.mailingAddress,
        "permanentAddress": data.permanentAddress,
        "passportInformation": data.passportInformation,
        "academicProfile": data.academicProfile,
        "workExperience": data.workExperience,
        "tests": data.tests,
        "documents": data.documents
    }
    Students.create(createPayload)
        .then(res => {
            console.log(res);
            return cb(null, sendResponse(200, 'Success', null))
        })
        .catch(err => {
            console.log(err);
            return cb(sendResponse(500, "something went wrong", null))
        })
}
exports.addNewStudent = addNewStudent;

const editStudent = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    if (!data.studentId && !data.userId) {
        return cb(sendResponse(400, "Missing Params", null))
    }
    let payload = {
        $or: [
            { _id: data.studentId },
            { userId: data.userId }
        ]
    }
    let update = {
        "userId": data.userId,
        "fullName": data.fullName,
        "gender": data.gender,
        "contactNumber": data.contactNumber,
        "email": data.email,
        "dob": data.dob,
        "maritalStatus": data.maritalStatus,
        "mailingAddress": data.mailingAddress,
        "permanentAddress": data.permanentAddress,
        "passportInformation": data.passportInformation,
        "academicProfile": data.academicProfile,
        "workExperience": data.workExperience,
        "tests": data.tests,
        "documents": data.documents
    }
    console.log("update Data :: ", update)

    Students.findOneAndUpdate(payload, update)
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
exports.editStudent = editStudent;

const studentsListingPagination = function (data, response, cb) {
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
        collection: Students
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
exports.studentsListingPagination = studentsListingPagination;


const getStudentDetailsById = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    if (!data.studentId && !data.userId) {
        return cb(sendResponse(400, "Missing Params", null))
    }
    let payload = {
        $or: [
            { _id: data.studentId },
            { userId: data.userId }
        ]
    }
    Students.findOne(payload)
        .then(res => {
            return cb(null, sendResponse(200, 'Success', res))
        })
        .catch(err => {
            console.log(err);
            return cb(sendResponse(500, "something went wrong", null))
        })
}
exports.getStudentDetailsById = getStudentDetailsById;

const studentsListing = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    let payload = {}
    Students.find(payload)
        .then(res => {
            return cb(null, sendResponse(200, 'Success', res))
        })
        .catch(err => {
            console.log(err);
            return cb(sendResponse(500, "something went wrong", null))
        })
}
exports.studentsListing = studentsListing;

const numberOfStudentsByMonth = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    let year = new Date().getFullYear();
    if (data.year && !Number.isNaN(parseInt(data.year))) {
        year = parseInt(data.year)
    }
    let aggregate = [
        {
            $match: {
                $expr: {
                    $eq: [{ $year: "$createdAt" }, year]
                }
            }
        },
        {
            $group: {
                _id: { $month: "$createdAt" },
                students: { $sum: 1 }
            }
        }
    ]
    Students.aggregate(aggregate)
        .then(res => {
            let dataToSend = [
                { name: 'Jan', students: 0 },
                { name: 'Feb', students: 0 },
                { name: 'Mar', students: 0 },
                { name: 'Apr', students: 0 },
                { name: 'May', students: 0 },
                { name: 'Jun', students: 0 },
                { name: 'Jul', students: 0 },
                { name: 'Aug', students: 0 },
                { name: 'Sep', students: 0 },
                { name: 'Oct', students: 0 },
                { name: 'Nov', students: 0 },
                { name: 'Dec', students: 0 }
            ]
            res.forEach((el) => {
                dataToSend[el._id - 1]['students'] = el.students
            });

            return cb(null, sendResponse(200, 'Success', dataToSend))
        })
        .catch(err => {
            console.log(err);
            return cb(sendResponse(500, "something went wrong", null))
        })
}
exports.numberOfStudentsByMonth = numberOfStudentsByMonth;