
const async = require('async');

const Chats = require('../models/chat');


const sendResponse = require('../helpers/sendResponse');
const { findDocumentsWithPagination } = require('../helpers/utils');



const addNewApplicationChat = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    if (!data.applicationId || !data.message) {
        return cb(sendResponse(400, "Missing Params", null))
    }
    let createPayload = {
        applicationId: data.applicationId,
        senderId: data.req.auth.id,
        message: data.message,
        senderRole: 'USER'
    };
    Chats.create(createPayload)
        .then(res => {
            return cb(null, sendResponse(200, 'Success', null))
        })
        .catch(err => {
            console.log(err);
            return cb(sendResponse(500, "something went wrong", null))
        })
}
exports.addNewApplicationChat = addNewApplicationChat;


const addNewApplicationChatAdmin = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    if (!data.applicationId || !data.message) {
        return cb(sendResponse(400, "Missing Params", null))
    }
    let createPayload = {
        applicationId: data.applicationId,
        senderId: data.req.auth.id,
        message: data.message,
        senderRole: 'ADMIN'
    };
    Chats.create(createPayload)
        .then(res => {
            return cb(null, sendResponse(200, 'Success', null))
        })
        .catch(err => {
            console.log(err);
            return cb(sendResponse(500, "something went wrong", null))
        })
}
exports.addNewApplicationChatAdmin = addNewApplicationChatAdmin;



const applicationChatListingPagination = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    if (!data.applicationId) {
        return cb(sendResponse(400, "Missing Params", null))
    }
    let matchCondition = {
        applicationId: data.applicationId
    };

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
    let populate = [
        {
            path: 'applicationId',
            select: 'fullName _id'
        },
        {
            path: 'senderId',
            select: 'fullName _id'
        }
    ]
    let payload = {
        skip,
        limit,
        matchCondition,
        sortCondition,
        populate,
        collection: Chats
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
exports.applicationChatListingPagination = applicationChatListingPagination;



const applicationChatListing = function (data, response, cb) {
    if (!cb) {
        cb = response;
    }
    if (!data.applicationId) {
        return cb(sendResponse(400, "Missing Params", null))
    }
    let payload = {
        applicationId: data.applicationId
    };
    let populate = [
        {
            path: 'applicationId',
            select: 'fullName _id'
        },
        {
            path: 'senderId',
            select: 'fullName _id'
        }
    ]

    Chats.find(payload).populate(populate)
        .then(res => {
            return cb(null, sendResponse(200, 'Success', res))
        })
        .catch(err => {
            console.log(err);
            return cb(sendResponse(500, "something went wrong", null))
        })

}
exports.applicationChatListing = applicationChatListing;