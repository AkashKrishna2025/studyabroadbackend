
const async = require('async');
const sendResponse = require("../helpers/sendResponse");
const { studentsListingPagination } = require('./students');
const { coursesListingPagination } = require('./courses');
const { instituteListingPagination } = require('./institute');
const { applicationListingPagination } = require('./applications');

const getDashboardMetrics = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }

    let newCallback = (err, res) => {
        if (err) {
            console.log(err)
            return cb(sendResponse(500, "something went wrong", null))
        }
        // console.log(res);
        let studentDetails = res[0]?.data;
        let courseDetails = res[1]?.data;
        let instituteDetails = res[2]?.data;
        let applicationDetails = res[3]?.data;
        let dataToSend = {
            students: studentDetails?.totalCount || 0,
            applications: applicationDetails?.totalCount || 0,
            courses: courseDetails?.totalCount || 0,
            universities: instituteDetails?.totalCount || 0,
            recentStudents: studentDetails?.list || [],
            recentCourses: courseDetails?.list || [],

        }
        return cb(null, sendResponse(200, "Success", dataToSend));
    }

    let waterfallFunctions = []
    waterfallFunctions.push(async.apply(studentsListingPagination, data));
    waterfallFunctions.push(async.apply(coursesListingPagination, data));
    waterfallFunctions.push(async.apply(instituteListingPagination, data));
    waterfallFunctions.push(async.apply(applicationListingPagination, data));

    async.parallel(waterfallFunctions, newCallback);

}
exports.getDashboardMetrics = getDashboardMetrics;

