/**
 * Created by mushr on 20/06/2017.
 */
let Schema = require('mongoose').Schema;

module.exports = Schema
(
    {   lat: Number,
        lng: Number,
        date: Number,
        type: String,
        desc: String,
        deleted: Boolean,
        facebook_id: Number
    }
);