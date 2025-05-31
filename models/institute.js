let mongoose = require('./db');

// grab the things we need
let Schema = mongoose.Schema;

// create a schema
let instituteSchema = new Schema({

    universityName: String,
    universityLogo: String,
    country: { type: String },
    city: { type: String },
    bannerImage: { type: String },
    brochure: { type: String },
    overview: { type: String },
    admissionReq: { type: String },
    universityStats: {
        studentsPerStaff: String,
        fulltimeStudents: String,
        internationalStudentPercentage: String,
        studentSatisfactionRate: String,
    },
    uniqueUniversityInfo: {
        image1: String,
        image2: String,
        image3: String,
        image4: String,
    },
    ranking: {
        logo: String,
        name: String,
        rank: String,
    },

    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },

}, { minimize: false, timestamps: true }); // Minimize : false --> It stores empty objects.

// we need to create a model using it
let institute = mongoose.model('institute', instituteSchema);

module.exports = institute;