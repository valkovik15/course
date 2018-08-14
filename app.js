var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// Import Routes
var routes = require('./server/routes/index');
var users = require('./server/routes/users');
// Import comments controller
var comments = require('./server/controllers/comments');

var session    = require('express-session');
// Import Passport and Warning flash modules
var passport = require('passport');
var flash = require('connect-flash');
var env = require('dotenv').load()
var MySQLStore = require('express-mysql-session')(session);
var app = express();
var exphbs = require('express-handlebars');
//Models
var markdown = require( "markdown" ).markdown;
var marked=require('marked');
var models = require("./models");
var options = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'vk1506',
    database: 'session_test'
};
var gravatar=require('gravatar');

var sessionStore = new MySQLStore(options);
app.use(session({
    secret: 'sometextgohere',
    saveUninitialized: true,
    resave: true,
    store: sessionStore
}));
//Sync Database
models.sequelize.sync().then(function() {

    console.log('Nice! Database looks fine')

}).catch(function(err) {

    console.log(err, "Something went wrong with the Database Update!")

});
// view engine setup
app.set('views', path.join(__dirname, 'server/views/pages'));
app.set('view engine', 'ejs');

// Database configuration
var config = require('./server/config/config.js');
// connect to our database


// Passport configuration
require('./server/config/passport')(passport, models.user);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('node-sass-middleware')({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true,
    sourceMap: true
}));
// Setup public directory
app.use(express.static(path.join(__dirname, 'public')));

// required for passport
// secret for session
// Init passport authentication
app.use(passport.initialize());
// persistent login sessions
app.use(passport.session());
// flash messages
app.use(flash());

app.use('/', routes);
app.use('/users', users);
// Setup routes for comments
app.get('/comments', function(req, res)
{
    var targ;
    var Posts = models.Posts;
    var User=models.user;
    Posts.findAll({include:[User]})
        .then(function(posts)
    {
        posts.forEach(
            function(item, i, arr) {
                item.pic=item.user.pic||gravatar.url(item.user.email ,  {s: '80', r: 'x', d: 'retro'}, true);
                item.body=item.body.split(' ').slice(0, 50).join(" ");
                item.body=markdown.toHTML( item.body );
                item.body=marked(item.body);
                console.log( markdown.toHTML( item.body ) );
                arr=markdown.toHTML( item.body ).match(/[\n]*<h3>[^<]*<\/h3>[\n]*/g);
                if(arr!=null) {
                    arr = arr.filter(function (e) {
                        return e
                    });
                }
                console.log(arr);
                arr=markdown.toHTML( item.body ).split(/[\n]*<h3>[^<]*<\/h3>[\n]*/g);
                if(arr!=null) {
                    arr = arr.filter(function (e) {posts[i]
                        return e
                    });
                }
                console.log(arr);
                console.log(comments);
            }
        );

        res.render('comments', {

            title: 'Articles Page',
            comments: posts
        });
    })
        .catch((err) => {
            console.log(err);
            res.redirect('/profile');
        });

});
app.get('/getsteps', function(req, res) {
    models.Posts.findOne({where: {id:req.query.id}})
        .then(function(post) {
            post.body = markdown.toHTML(post.body);
            post.body=marked(post.body);
            toc = post.body.match(/[\n]*<h3>[^<]*<\/h3>[\n]*/g);
            if (toc != null) {
                toc = toc.filter(function (e) {
                    return e
                });
            }
            steps = post.body.split(/[\n]*<h3>[^<]*<\/h3>[\n]*/g);
            if (steps != null) {
                steps = steps.filter(function (e) {
                    return e
                });
            }

            data={"steps":steps, "toc":toc, "title":post.title};
            res.send(data);
        });
});
app.get('/getstars', function(req, res) {
    models.Grades.findOne({where: {postId:req.query.id, userId:req.query.user}})
        .then(function(grade) {
            console.log("grade"+grade);

            if (grade == null) {
                data={"stars":0};
                res.send(data);
                }
             else{
                data={"stars":grade.num};
                res.send(data);
            }


        });
});
app.get('/article', function(req, res) {
console.log('data');
var x=req.user;
if(x)
{
    x=x.id;
}
    res.render('article',{

        id:req.query.id,
        user:x
    });
});
app.post('/comments', comments.hasAuthorization, comments.create);
app.get('/publish', function(req, res)
{
    if(req.isAuthenticated()) {
        console.log(req.query);
        console.log(models);
        var Posts = models.Posts;
        models.Posts.findOne({
            where: {
                title: req.query.title
            }
        }).then(function (post) {
            if (post) {
                return done(null, false, {
                    message: 'That title is already taken'
                });
            } else
                var data_ =
                    {
                        title: req.query.title,
                        body: req.query.text,
                        userId:req.user.id
                    };
            Posts.create(data_).then(function (newPost, created) {

            });
        });
        res.redirect('/profile');
    }
    else
    {
        res.redirect('/login');
    }

});
app.get('/rank',  function(req, res)
{
    if(req.isAuthenticated()) {
        var Posts = models.Posts;
        if (req.user) {
            console.log(req.query);
            models.Grades
                .findOrCreate({where: {userId: req.query.user, PostId: req.query.post}, defaults: {num: req.query.num}})
                .spread((grade, created) => {
                    console.log(grade.get({
                        plain: true
                    }));
                    console.log("created");
                    console.log(created);
                    if (!created) {
                        grade.updateAttributes({num: req.query.num});
                    }

                });
            res.send({"message": 'Thanks for your opinion'});
        }
    }
    else
    {
        res.send({"message":'You should log in to leave rankings'});
    }

}
);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + server.address().port);
});
