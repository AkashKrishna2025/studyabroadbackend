let mongoose = require('./db');

// grab the things we need
let Schema = mongoose.Schema;

// create a schema
let scholarshipSchema = new Schema({

    name: String,
    universityName: String,
    coursesName: String,
    deadline: { type: Date },
    level: String,
    amount: Number,

    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },

}, { minimize: false, timestamps: true }); // Minimize : false --> It stores empty objects.

// we need to create a model using it
let scholarship = mongoose.model('scholarship', scholarshipSchema);

module.exports = scholarship;
