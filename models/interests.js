let mongoose = require('./db');

// grab the things we need
let Schema = mongoose.Schema;

// create a schema
let interestSchema = new Schema({

    firstName: String,
    lastName: String,
    phoneNumber: String,
    studyDestination: String,
    studyLevel: String,

    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },

}, { minimize: false, timestamps: true }); // Minimize : false --> It stores empty objects.

// we need to create a model using it
let interest = mongoose.model('interest', interestSchema);

module.exports = interest;