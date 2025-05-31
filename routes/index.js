

const express = require('express');
const router = express.Router();


// const authenticator = require('../middlewares/authenticator');


const userRoutes = require('./users');
const authRoutes = require('./auth');
const instituteRoutes = require('./institute');
const courseRoutes = require('./course');
const blogRoutes = require('./blog');
const careerPathRoutes = require('./careerPath');
const scholarshipRoutes = require('./scholarship');
const studentRoutes = require('./students');
const metricsRoutes = require('./metrics');
const applicationRoutes = require('./application');
const transactionRoutes = require('./transaction');
const chatRoutes = require('./chat');



router.use('/users', [], userRoutes)
router.use('/auth', authRoutes)
router.use('/institute', instituteRoutes)
router.use('/course', courseRoutes)
router.use('/blog', blogRoutes)
router.use('/careerPath', careerPathRoutes)
router.use('/scholarship', scholarshipRoutes)
router.use('/student', studentRoutes)
router.use('/metrics', metricsRoutes)
router.use('/application', applicationRoutes)
router.use('/transaction', transactionRoutes)
router.use('/chat', chatRoutes)

router.get('/server/time', function (req, res) {
    res.status(200).send({
        "status": 'Server is running',
        "new Date()": new Date(),
        "Date.now()": Date.now(),
        "new Date().toString()": new Date().toString(),
        "new Date().ISOString()": '' + new Date().toISOString(),
        "new Date().UTCString()": '' + new Date().toUTCString(),
    });
});


module.exports = router;
