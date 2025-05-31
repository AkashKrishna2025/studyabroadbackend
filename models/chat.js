let mongoose = require('./db');

// grab the things we need
let Schema = mongoose.Schema;

// create a schema
let chatSchema = new Schema({

    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'application' },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    message: String,
    senderRole: {
        type: String,
        default: 'USER',
        enum: process.env.ROLES.split(',')
    },

    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },

}, { minimize: false, timestamps: true }); // Minimize : false --> It stores empty objects.

// we need to create a model using it
let chat = mongoose.model('chat', chatSchema);

module.exports = chat;