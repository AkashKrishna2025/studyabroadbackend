let mongoose = require('./db');

// grab the things we need
let Schema = mongoose.Schema;

// create a schema
let careerPathSchema = new Schema({

    latestQualification: String,
    specialization: String,
    coursesName: [{ type: String }],

    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },

}, { minimize: false, timestamps: true }); // Minimize : false --> It stores empty objects.

// we need to create a model using it
let careerPath = mongoose.model('careerPath', careerPathSchema);

module.exports = careerPath;