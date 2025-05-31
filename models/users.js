let mongoose = require('./db');

// grab the things we need
let Schema = mongoose.Schema;

// create a schema
let userSchema = new Schema({

    fullName: String,
    email: { type: String },
    phoneNumber: { type: Number },
    countryCode: { type: String },
    signupSource: { type: String, enum: process.env.SIGNUP_SOURCES.split(',') },
    role: {
        type: String,
        default: 'USER',
        enum: process.env.ROLES.split(',')
    },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },

}, { minimize: false, timestamps: true }); // Minimize : false --> It stores empty objects.

// we need to create a model using it
let users = mongoose.model('user', userSchema);

module.exports = users;