let mongoose = require('./db');

// grab the things we need
let Schema = mongoose.Schema;

// create a schema
let adminSchema = new Schema({

    fullName: String,
    email: { type: String },
    phoneNumber: { type: Number },
    countryCode: { type: String },
    adminId: { type: String },
    password: { type: String },
    role: { type: String },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },

}, { minimize: false, timestamps: true }); // Minimize : false --> It stores empty objects.

// we need to create a model using it
let admins = mongoose.model('admin', adminSchema);

module.exports = admins;