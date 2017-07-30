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
        unique: true,
        uniqueCaseInsensitive: true
    },
    skillCategory: {
        type: Schema.Types.ObjectId,
        ref: "SkillCategory"
    }
});

schema.plugin(deepPopulate, {
    populate: {
        "skillCategory": {
            select: '_id name'
        }
    }
});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Skill', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema, "skillCategory", "skillCategory"));
var model = {
    import: function (data, callback) {
        async.concatSeries(data, function (n, callback) {
            async.waterfall([function (callback) {
                SkillCategory.getIdByName({
                    name: n.SkillCategory
                }, callback);
            }, function (skillCategory, callback) {
                Skill.saveData({
                    name: n.Skill,
                    skillCategory: skillCategory
                }, callback);
            }], function (err, response) {
                if (err) {
                    err.val = response;
                    callback(null, err);
                } else {
                    callback(null, response._id);
                }
            });
        }, function (err, retVal) {
            if (err) {
                callback(err);
            } else {
                callback(err, {
                    total: retVal.length,
                    value: retVal
                });
            }
        });
    },
};
module.exports = _.assign(module.exports, exports, model);