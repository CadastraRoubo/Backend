/**
 * Created by mushr on 21/06/2017.
 */
let Schema = require('mongoose').Schema;

module.exports = Schema
(
    {
        facebook_id: {
            type: Number,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        name: {
            type: String,
            required: true,
        }
    }
    , {_id: false}
);