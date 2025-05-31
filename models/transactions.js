let mongoose = require('./db');

// grab the things we need
let Schema = mongoose.Schema;

// create a schema
let transactionSchema = new Schema({

    orderId: String,
    paymentId: String,
    signature: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'application' },
    amount: mongoose.Types.Decimal128,
    type: String,
    paymentMethod: String,
    status: {
        type: String,
        default: 'PENDING',
        enum: process.env.TRANSACTION_STATUS.split(',')
    },


    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },

}, { minimize: false, timestamps: true }); // Minimize : false --> It stores empty objects.

// we need to create a model using it
let transaction = mongoose.model('transaction', transactionSchema);

module.exports = transaction;