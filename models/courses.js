let mongoose = require('./db');

// grab the things we need
let Schema = mongoose.Schema;

// create a schema
let courseSchema = new Schema({

    courseName: String,
    disciplineArea: String,
    universityName: String,
    courseLogo: String,
    bannerImage: { type: String },
    level: { type: String },
    overview: { type: String },
    modules: { type: String },
    requirements: { type: String },
    isShortlisted: { type: Boolean, default: false },

    uniqueCourseInfo: {
        fee: String,
        duration: String,
        years: String,
        applicationDeadline: { type: Date },
        applicationFee: String,
        upcomingIntakes: [{ type: String }], // Changed to an array of strings
        studyMode: String,
    },
    shortlistedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],


    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },

}, { minimize: false, timestamps: true }); // Minimize : false --> It stores empty objects.

// we need to create a model using it
let course = mongoose.model('course', courseSchema);

module.exports = course;