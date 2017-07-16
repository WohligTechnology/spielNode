var schema = new Schema({
    name: {
        type: String,
        required: true,
        excel: true,
    },
    email: {
        type: String,
        required: true,
        validate: validators.isEmail(),
        unique: true
    },
    designation: [{
        designation: {
            type: Schema.Types.ObjectId,
            ref: "Designation",
        },
        timestamp: {
            type: Date
        }
    }],
    completedSkill: [{
        skill: {
            type: Schema.Types.ObjectId,
            ref: "Skill"
        },
        timestamp: {
            type: Date
        }
    }],
    photo: {
        type: String
    },
    appliedDesignation: {
        type: Schema.Types.ObjectId,
        ref: "Designation"
    },
    accessToken: {
        type: String
    },
    googleAccessToken: String,
    googleRefreshToken: String,
    oauthLogin: {
        type: [{
            socialId: String,
            socialProvider: String
        }],
        index: true
    },
    accessLevel: {
        type: String,
        default: "User",
        enum: ['User', 'Admin']
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    googleId: {
        type: String,
    },
    mobile: Number
});

schema.plugin(deepPopulate, {
    populate: {
        "designation.designation": {
            select: '_id name'
        },
        "completedSkill.skill": {
            select: "_id name"
        }
    }
});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);

module.exports = mongoose.model('User', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema, "user designation.designation completedSkill.skill", "user designation.designation completedSkill.skill"));
var model = {

    existsSocial: function (user, callback) {
        var Model = this;
        Model.findOne({
            "oauthLogin.socialId": user.id,
            "oauthLogin.socialProvider": user.provider,
        }).exec(function (err, data) {
            if (err) {
                callback(err, data);
            } else if (_.isEmpty(data)) {
                var modelUser = {
                    name: user.displayName,
                    accessToken: [uid(16)],
                    oauthLogin: [{
                        socialId: user.id,
                        socialProvider: user.provider,
                    }]
                };
                if (user.emails && user.emails.length > 0) {
                    modelUser.email = user.emails[0].value;
                    var envEmailIndex = _.indexOf(env.emails, modelUser.email);
                    if (envEmailIndex >= 0) {
                        modelUser.accessLevel = "Admin";
                    }
                }
                modelUser.googleAccessToken = user.googleAccessToken;
                modelUser.googleRefreshToken = user.googleRefreshToken;
                if (user.image && user.image.url) {
                    modelUser.photo = user.image.url;
                }
                Model.saveData(modelUser, function (err, data2) {
                    if (err) {
                        callback(err, data2);
                    } else {
                        data3 = data2.toObject();
                        delete data3.oauthLogin;
                        delete data3.password;
                        delete data3.forgotPassword;
                        delete data3.otp;
                        callback(err, data3);
                    }
                });
            } else {
                delete data.oauthLogin;
                delete data.password;
                delete data.forgotPassword;
                delete data.otp;
                data.googleAccessToken = user.googleAccessToken;
                data.save(function () {});
                callback(err, data);
            }
        });
    },
    profile: function (data, callback, getGoogle) {
        var str = "name email photo mobile accessLevel";
        if (getGoogle) {
            str += " googleAccessToken googleRefreshToken";
        }
        User.findOne({
            accessToken: data.accessToken
        }, str).exec(function (err, data) {
            if (err) {
                callback(err);
            } else if (data) {
                callback(null, data);
            } else {
                callback("No Data Found", data);
            }
        });
    },
    updateAccessToken: function (id, accessToken) {
        User.findOne({
            "_id": id
        }).exec(function (err, data) {
            data.googleAccessToken = accessToken;
            data.save(function () {});
        });
    },
    isUserVerified: function (data, callback) {
        if (_.isEmpty(data)) {
            callback("No Data Found in Request", null)
        } else {
            User.findOne({
                $or: [{
                        email: data.email
                    },
                    {
                        accessToken: data.accessToken
                    }
                ],
                isVerified: true
            }).exec(function (err, data) {
                if (err) {
                    callback(err, null);
                } else if (_.isEmpty(data)) {
                    callback(null, false)
                } else {
                    callback(null, true)
                }
            });
        }
    },
    getUserList: function (data, callback) {
        var page = 1;
        if (data.page) {
            page = data.page
        }
        var pagestartfrom = (page - 1) * 10;
        User.find({}, {
            photo: 1,
            designation: 1,
            name: 1,
            accessToken: 1,
            completedSkill: 1,

        }).deepPopulate("designation.designation completedSkill.skill", "designation.designation completedSkill.skill").sort({
            name: 1
        }).skip(pagestartfrom).limit(10).exec(function (err, data) {
            if (err || _.isEmpty(data)) {
                callback(err, null)
            } else {
                callback(null, data);
            }
        });
    },
    getUserDetails: function (data, callback) {
        User.findOne({
            $or: [{
                    email: data.email
                },
                {
                    accessToken: data.accessToken
                }
            ]
        }).exec(function (err, data) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(data)) {
                callback(null, "No Such User Found");
            } else {
                callback(null, data);
            }
        })
    },
    getMyDetails: function (data, callback) {
        User.findOne({
            $or: [{
                    email: data.email
                },
                {
                    accessToken: data.accessToken
                }
            ]
        }).deepPopulate("designation.designation completedSkill.skill", "designation.designation completedSkill.skill").exec(function (err, data) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(data)) {
                callback(null, "No Such User Found");
            } else {
                callback(null, data);
            }
        })
    }
};
module.exports = _.assign(module.exports, exports, model);