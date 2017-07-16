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
    skill: {
        type: Schema.Types.ObjectId,
        ref: "Skill"
    },
    approvalStatus: {
        type: String,
        default: "Pending",
        enum: ['Pending', 'Approved', 'Rejected']
    },
    reasonForRequest: {
        type: String,
        required: true
    },
    reasonForResponse: {
        type: String
    },
    responseTimestamp: {
        type: Date
    }
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('RequestSkill', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {
    requestApproval: function (data, callback) {
        if (_.isEmpty(data)) {
            callback("Empty Request", null);
        } else {
            RequestSkill.save(data).exec(function (err, data) {
                if (err) {
                    callback("Request Approval Failed", null)
                } else {
                    callback(null, true);
                }
            })
        }
    },
    requestResponded: function (data, callback) {
        if (_.isEmpty(data)) {
            callback("Empty Request", null);
        } else {
            RequestSkill.save(data).exec(function (err, RequestSkillRespo) {
                if (err) {
                    callback("Request Approval Failed", null)
                } else {
                    var completedSkillObj = {
                        skill: data.skill,
                        timestamp: Date.now()
                    }
                    User.update({
                        $or: [{
                            accessToken: data.accessToken
                        }, {
                            _id: data.user
                        }]
                    }, {
                        $addToSet: {
                            completedSkill: completedSkillObj
                        }
                    }).exec(function (err, UserRespo) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, "Updated Skills Of  User");
                        }
                    })
                }
            })
        }
    }
};
module.exports = _.assign(module.exports, exports, model);