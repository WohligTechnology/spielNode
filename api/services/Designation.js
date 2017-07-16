var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var uniqueValidator = require('mongoose-unique-validator');
var timestamps = require('mongoose-timestamp');
var validators = require('mongoose-validators');
var monguurl = require('monguurl');
require('mongoose-middleware').initialize(mongoose);

var Schema = mongoose.Schema;

var schema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    neededSkill: [{
        type: Schema.Types.ObjectId,
        ref: "Skill"
    }]
});

schema.plugin(deepPopulate, {
    populate: {
        "neededSkill": {
            select: '_id name skillCategory'
        },
        "neededSkill.skillCategory": {
            select: '_id name'
        }
    }
});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Designation', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema, "neededSkill.skillCategory", "neededSkill.skillCategory"));
var model = {};
module.exports = _.assign(module.exports, exports, model);