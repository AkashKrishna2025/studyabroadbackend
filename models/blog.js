let mongoose = require('./db');

// grab the things we need
let Schema = mongoose.Schema;

// create a schema
let blogSchema = new Schema({

    heading: String,
    date: { type: Date },
    bannerImage: { type: String },
    tags: [{ type: String }],
    content: { type: String },
    quote: { type: String },



    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },

}, { minimize: false, timestamps: true }); // Minimize : false --> It stores empty objects.

// we need to create a model using it
let blog = mongoose.model('blog', blogSchema);

module.exports = blog;