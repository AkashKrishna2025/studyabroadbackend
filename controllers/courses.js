
const async = require('async');

const Courses = require('../models/courses');


const sendResponse = require('../helpers/sendResponse');
const { findDocumentsWithPagination } = require('../helpers/utils');



const addNewCourse = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }

    let createPayload = {
        courseName: data.courseName,
        disciplineArea: data.disciplineArea,
        universityName: data.universityName,
        courseLogo: data.courseLogo,
        bannerImage: data.bannerImage,
        level: data.level,
        overview: data.overview,
        modules: data.modules,
        requirements: data.requirements,
        uniqueCourseInfo: data.uniqueCourseInfo,
    };
    Courses.create(createPayload)
        .then(res => {
            return cb(null, sendResponse(200, 'Success', null))
        })
        .catch(err => {
            console.log(err);
            return cb(sendResponse(500, "something went wrong", null))
        })
}
exports.addNewCourse = addNewCourse;

const coursesListingPagination = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }

    let matchCondition = {};
   // Add search functionality for universityName
   if (data.search) {
    matchCondition.universityName = { $regex: data.search?.trim(), $options: 'i' };
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
        collection: Courses
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
exports.coursesListingPagination = coursesListingPagination;

const editCourse = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    if (!data.courseId) {
        return cb(sendResponse(400, "Missing Params", null))
    }
    let payload = {
        _id: data.courseId,
    }
    let update = {
        courseName: data.courseName,
        disciplineArea: data.disciplineArea,
        universityName: data.universityName,
        courseLogo: data.courseLogo,
        bannerImage: data.bannerImage,
        level: data.level,
        overview: data.overview,
        modules: data.modules,
        requirements: data.requirements,
        uniqueCourseInfo: data.uniqueCourseInfo,
    }
    Courses.findOneAndUpdate(payload, update)
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
exports.editCourse = editCourse;


const coursesListing = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    let payload = {}
    Courses.find(payload)
        .then(res => {
            return cb(null, sendResponse(200, 'Success', res))
        })
        .catch(err => {
            console.log(err);
            return cb(sendResponse(500, "something went wrong", null))
        })
}

// const toggleShortlist = function (data, response, cb) {
//     console.log(data,'-------------------shortlist data')
//     if (!cb) {
//         cb = response;
//     }
//     if (!data.courseId) {
//         return cb(sendResponse(400, "Missing Params", null))
//     }
    
//     Courses.findById(data.courseId)
//         .then(course => {
//             if (!course) {
//                 return cb(sendResponse(404, "Course not found", null));
//             }
            
//             course.isShortlisted = !course.isShortlisted;
//             return course.save();
//         })
//         .then(updatedCourse => {
//             return cb(null, sendResponse(200, "Shortlist status updated", { isShortlisted: updatedCourse.isShortlisted }));
//         })
//         .catch(err => {
//             console.log(err);
//             return cb(sendResponse(500, "Something went wrong", null));
//         });
// }
const toggleShortlist = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    if (!data.courseId) {
        return cb(sendResponse(400, "Missing Params", null))
    }
    
    let userId = data.req.auth.id; // Get the user ID from the authenticated request

    Courses.findById(data.courseId)
        .then(course => {
            if (!course) {
                return cb(sendResponse(404, "Course not found", null));
            }
            
            // Check if the user has already shortlisted this course
            let index = course.shortlistedBy.indexOf(userId);
            if (index > -1) {
                // User has already shortlisted, so remove them
                course.shortlistedBy.splice(index, 1);
            } else {
                // User hasn't shortlisted, so add them
                course.shortlistedBy.push(userId);
            }
            
            return course.save();
        })
        .then(updatedCourse => {
            let isShortlisted = updatedCourse.shortlistedBy.includes(userId);
            return cb(null, sendResponse(200, "Shortlist status updated", { isShortlisted: isShortlisted }));
        })
        .catch(err => {
            console.log(err);
            return cb(sendResponse(500, "Something went wrong", null));
        });
}
exports.toggleShortlist = toggleShortlist;
exports.coursesListing = coursesListing;