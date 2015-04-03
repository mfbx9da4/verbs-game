exports.get_index = function(req, res) {
    console.log(req.user);
    res.sendfile('index.html');
};

exports.get_user = function(req, res) {
    res.send(req.user);
};

exports.get_about = function(req, res) {
    res.sendfile('README.html');
};

var getQuestions = function (level, verbs, questions_length) {
    var questions = [];
    var ints = [];
    while (questions.length < questions_length) {
        var randInt = parseInt(Math.random() * verbs.max_id);
        if (ints.indexOf(randInt) == -1) {
            ints.push(randInt);
            questions.push(verbs.id_map[randInt]);
        }
    }
    return questions;
};

exports.get_level = function(verbs, questions_length) {  
    return function(req, res) {
        var level = req.params.level;
        var questions = getQuestions(level, verbs, questions_length);
        return res.send(questions);
    };
};

exports.get_report = function(fs) {
    return function(req, res) {
        var collection = db.get('csvcollection');
        if (req.params.id) {
            collection.find({
                _id: req.params.id
            }, {}, function(e, docs) {
                if (docs) {
                    var doc = docs[0];
                    res.send(200, {
                        'id': doc._id,
                        'data': doc.data,
                        'url': doc.url
                    });
                } else {
                    res.send(404, 'No docs found!');
                }
            });
        } else {
            res.send(404, 'No id given!');
        }
    };
};

exports.get_verbs = function (verbs) {
    return function (req, res) {
        res.send(verbs);
    };  
};

exports.update_user = function(db, fs) {
    return function(req, res) {
        var users = db.get('system.users');
        users.find({user: req.params.user }, {}, function(err, docs) {
            var user = docs[0];
            for (var i = 0; i < req.body.responses.length; i ++) {
                 var response = req.body.responses[i];
                 if (!user.responses) {user.responses = {};}
                 if (!user.responses[response.id]) {user.responses[response.id] = {right: 0, wrong: 0};}
                 user.responses[response.id].right += response.right || 0;
                 user.responses[response.id].wrong += response.wrong || 0;
            }
            users.update({user: req.params.user}, user, function(err, docs) {
                return res.send(200);
            });
        });
    };
};

exports.post_csv = function(db, fs) {
    return function(req, res) {

        var file_url = req.body.url;
        var file_data;
        
        // get the temporary location of the file
        var tmp_path = req.files.file.path;
        fs.readFile(tmp_path, {
                encoding: 'utf-8'
            }, function(err, data) {
                if (err) throw err;
                file_data = data.toString();
                // sequentially delete temp, add it to db and then respond
                delete_temporary(add_to_db, respond);
        });

        function delete_temporary(next, next2) {
            fs.unlink(tmp_path, function(err) {
                if (err) throw err;
                next(next2);
            });
        }

        function add_to_db(next) {
            var collection = db.get('csvcollection');
            collection.insert({
                data: file_data,
                url: file_url
            }, next);
        }

        function respond(err, doc) {
            if (err || !doc) {
                res.send(403, {
                    success: false,
                    message: 'There was a problem adding the information to the database.',
                    err: err,
                    doc: doc
                });
            } else {
                res.send(201, {
                    success: true,
                    message: 'ok',
                    reportId: doc._id
                });
            }
        }

    };
};