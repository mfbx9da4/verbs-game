var crypto = require('crypto');
var mime = require('mime');
var uuid = require('node-uuid');
var moment = require('moment');
var config = require('../config');

exports.signed = function(req, res) {
    /* JSON View for obtaining CORS policy, signature, key, redirect and mime-type, then signs policy as a sha1 digest */

    var mime_type = mime.lookup(req.query.title);
    var expire = moment().utc().add('month', 1).toJSON("YYYY-MM-DDTHH:mm:ss Z"); // Set policy expire in 1 month

    var policy = JSON.stringify({
        "expiration": expire,
        "conditions": [{
                "bucket": config.aws_bucket
            },
            ["starts-with", "$key", config.bucket_dir], {
                "acl": "public-read"
            }, {
                "success_action_status": "201"
            },
            ["starts-with", "$Content-Type", mime_type],
            ["content-length-range", 0, config.max_filesize]
        ]
    });

    var base64policy = new Buffer(policy).toString('base64');
    var signature = crypto.createHmac('sha1', config.aws_secret).update(base64policy).digest('base64');
    var file_key = uuid.v4();

    return res.json({
        policy: base64policy,
        signature: signature,
        AWSAccessKeyId: config.aws_key,
        key: config.bucket_dir + file_key + "_" + req.query.title,
        success_action_redirect: "/",
        contentType: mime_type
    })
};