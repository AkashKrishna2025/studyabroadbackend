
const async = require('async');

const Blogs = require('../models/blog');


const sendResponse = require('../helpers/sendResponse');
const { findDocumentsWithPagination } = require('../helpers/utils');



const addNewBlog = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }

    let createPayload = {
        heading: data.heading,
        date: data.date,
        bannerImage: data.bannerImage,
        tags: data.tags,
        content: data.content,
        quote: data.quote,
    };
    Blogs.create(createPayload)
        .then(res => {
            return cb(null, sendResponse(200, 'Success', null))
        })
        .catch(err => {
            console.log(err);
            return cb(sendResponse(500, "something went wrong", null))
        })
}
exports.addNewBlog = addNewBlog;

const editBlog = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    if (!data.blogId) {
        return cb(sendResponse(400, "Missing Params", null))
    }
    let payload = {
        _id: data.blogId,
    }
    let update = {
        heading: data.heading,
        date: data.date,
        bannerImage: data.bannerImage,
        tags: data.tags,
        content: data.content,
        quote: data.quote,
    }
    Blogs.findOneAndUpdate(payload, update)
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
exports.editBlog = editBlog;

const blogsListingPagination = function (data, response, cb) {
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
        collection: Blogs
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
exports.blogsListingPagination = blogsListingPagination;




const blogsListing = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    let payload = {};
    Blogs.find(payload)
        .then(res => {
            return cb(null, sendResponse(200, 'Success', res))
        })
        .catch(err => {
            console.log(err);
            return cb(sendResponse(500, "something went wrong", null))
        })

}
exports.blogsListing = blogsListing;