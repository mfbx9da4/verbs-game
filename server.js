var setup_monk = function(fn) {
    // checks if connected to the internet,
    // if connected uses mongohq db else uses local db
    // NB: must export mongohq url as env var.
    // require('monk')(process.env.MONGOHQ_URL).get('csvcollection').find({}, function(e,d){console.log(e || d)})
    // require('monk')(LOCAL_DB_URL).get('csvcollection').find({}, function(e,d){console.log(e || d)})
    var db;
    if (process.argv[2] == "local") {
        console.log('Override: using local db'.yellow);
        db = monk(LOCAL_DB_URL);
        fn(db);   
    } else if (process.argv[2] == "remote") {
        console.log('Override: using remote db'.yellow);
        db = monk(process.env.MONGOHQ_URL);
        fn(db);
    } else {
        var db_url, connected_to_internet;
        http.get("http://example.com", function(res) {
                if (process.env.MONGOHQ_URL) {
                    db_url = process.env.MONGOHQ_URL;
                } else {
                    db_url = LOCAL_DB_URL;
                    console.log('MONGOHQ_URL env var not set, using local db'.red);
                }
                db = monk(db_url, {}, function () {
                        console.log('Todo bom, remote MONGOHQ_URL for db'.green);                
                        fn(db);
                    })
                    .on('error', function (e){
                        db = monk(LOCAL_DB_URL);
                        console.log('Error connecting to mongohq, using local db'.red);
                        fn(db);
                    });
            }).on('error', function(e) {
                console.log('You are not connected to the internet, using local db'.red);
                db = monk(LOCAL_DB_URL);
                fn(db);
            });
    }
};

var express = require('express');
var app = express();
var colors = require('colors');
var debug = require('debug');
var http = require('http');
var path = require('path');
var fs = require('fs');
var mongo = require('mongodb');
var monk = require('monk');
var routes = require('./server/routes');
var aws = require('./server/aws');
var LOCAL_DB_URL = 'localhost:27017/verbs-game';
var verbs = require('./server/verbs');
verbs.init();
var crypto = require('crypto');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


function validPassword(user, password) {
    console.log('password ', password);
    console.log('user.pwd ' + user.pwd);
    var hash = crypto.createHmac('sha1', 'ubatuba').update(password).digest('hex');
    console.log(hash);
    if (user.pwd === hash) {
        return true;
    }
}

setup_monk(function (db) {

    app.configure(function() {
        app.use(express.urlencoded());
        app.use(express.json());
        // allow file uploads of up to 5 gb
        app.use(express.multipart());
        app.use(express.cookieParser());
        // app.use(express.bodyParser());
        app.use(express.session({ secret: 'ubatuba' }));
        app.use(passport.initialize());
        app.use(passport.session());
        app.use(app.router);
    });
    passport.use(new LocalStrategy(
        function(username, password, done) {
            var users = db.get('system.users');

            users.find({user: username }, {}, function(err, docs) {
                if (err) { return done(err); }
                if (!docs.length) {
                    return done(null, false, { message: 'Incorrect username.' });
                } else {
                    var user = docs[0];
                    if (!validPassword(user, password)) {
                        return done(null, false, { message: 'Incorrect password.' });
                    }
                    return done(null, user);
                }
            });
        }
    ));

    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        var users = db.get('system.users');
        users.find({_id: id }, {}, function(err, docs) {
            var user = docs[0];
            done(null, user);
        });
    });

    // all environments
    app.set('port', process.argv[3] || 8000);
    app.set('views', path.join(__dirname, 'views'));
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname));

    // development only
    if ('development' == app.get('env')) {
        app.use(express.errorHandler());
    } else {
        config.redirect_host = 'http://still-citadel-3009.herokuapp.com/';
    }

    // CORS
    app.all('/*', function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        next();
    });

    app.questions_length = 10;
    app.get('/?', routes.get_index);
    app.get('/get_user', routes.get_user);
    app.get('/about', routes.get_about);
    app.get('/api/get_level/:level', routes.get_level(verbs, app.questions_length));
    app.get('/api/get_verbs/?', routes.get_verbs(verbs.verbs));
    app.post('/update_user/:user', routes.update_user(db));
    app.post('/login', passport.authenticate('local', { successRedirect: '/#/game',
                                                        failureRedirect: '/#/login'}));


    http.createServer(app).listen(app.get('port'), function() {
        console.log('Express server listening on port '.yellow + app.get('port'));
        debug('listening');
    });
});

