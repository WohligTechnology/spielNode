var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var uniqueValidator = require('mongoose-unique-validator');
var timestamps = require('mongoose-timestamp');
var validators = require('mongoose-validators');
var monguurl = require('monguurl');
require('mongoose-middleware').initialize(mongoose);

var Schema = mongoose.Schema;

var schema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    SkillId: {
        type: Schema.Types.ObjectId,
        ref: "Skill"
    },
    approvalStatus: {
        type: String,
        default: "Pending",
        enum: ['Pending', 'Aproved', 'Rejected']
    },
    reasonForRequest: {
        type: String,
        required: true
    },
    reasonForResponse: {
        type: String
    },
    responseTime: {
        type: Date
    }
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('RequestSkill', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {};
module.exports = _.assign(module.exports, exports, model);