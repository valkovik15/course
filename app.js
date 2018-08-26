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


var session    = require('express-session');
// Import Passport and Warning flash modules
var passport = require('passport');
var sequelize = require('sequelize');
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
    database: 'session_test',

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
// view engine setupv
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
app.use('/scripts', express.static(__dirname + '/node_modules/'));

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
function count_avg(arr)
{
    const reducer = (accumulator, currentValue) => accumulator + currentValue.dataValues.num;
    f=arr.reduce(reducer, 0);
    if(f>0) {
        f = f / arr.length;
    }
    else
    {
        return 0;
    }
    return f
}
var Pusher = require('pusher');

var pusher = new Pusher({
    appId: '579029',
    key: '90263c93819cebfbdc47',
    secret: '8f123346f4005a3f0add',
    cluster: 'eu',
    encrypted: true
});

pusher.trigger('my-channel', 'my-event', {
    "message": "hello world"
});
app.get( '/trigger', function( req, res ) {
    var id = req.query.id;
    var user=req.query.user;
    if (user) {
        console.log(req.query);
        var User = models.user;

        User.findOne({where: {id: req.query.user}}).then(user => {
            data={text:req.query.text, userId:req.query.user, PostId:req.query.id};
            models.Comments
                .build(data)
                .save()
                .then(anotherTask => {
                    data={pic:user.pic, text:req.query.text, name:user.name, likes:0};
                    pusher.trigger('my-channel', 'my-event', data, req.query.socket);
                    res.send(data);// you can now access the currently saved task with the variable anotherTask... nice!
                });
        });
    }
    else {
        console.log('Nope');
        res.send({pic:"-1"});
    }
});
app.get('/edit', isLoggedIn, function(req, res, next) {
    models.Posts.findOne({where: {id:req.query.id}})
        .then(function(post) {

            if((post.userId==req.user.id)||(req.user.role='admin'))
            {post.getTags().then(function(tags)
            {
                tags.forEach(function (item, i, arr) {
                        arr[i]={'text':item.name};
                    }

                );
                console.log(tags);
                res.render('new', { title: post.title, body:post.body, topic: post.topic, pic:post.pic, tags:tags, id:post.id, locale:req.session.locale});
            }
            );

            }
            else
            {
                res.send('Hacking is bad!');
            }
        });

});


app.get( '/com', function( req, res ) {
    var post = req.query.id;
    var user=req.query.user;
    var User = models.user;
    data=[];
    console.log(req.query);
    var Comments= models.Comments;
    Comments.findAll({include: [{model: User},{model:models.Likes}], where: {PostId:post}})
        .then(function (comments) {
            data=[];
            comments.forEach(
                function (item, i, arr) {
                    pic = item.user.pic || gravatar.url(item.user.email, {s: '80', r: 'x', d: 'retro'}, true);
                    name = item.user.name;
                    text = item.dataValues.text;
                    data.push(
                    {pic:pic, text:text, name:name, likes:item.Likes.length, liked:!!item.Likes.find(item => item.userId==user), iden:item.id});
                }
            );
            console.log(data);
            res.send(data);
        });
});
app.get('/gettags', function( req, res )
{
    models.Posts.findOne({where: {id:req.query.id}})
        .then(function(post) {
                post.getTags().then(function(tags)
                {
                    tags.forEach(function (item, i, arr) {
                            arr[i]={'text':item.name};
                        }
                    );
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify(tags));} );

        });
});
app.get( '/like', function( req, res ) {
    if(req.user) {
        if (req.query.action=='true') {
            models.Likes
                .build({CommentId: req.query.id, PostId: req.query.post, userId: req.query.user})
                .save()
                .then(anotherTask => {
                    console.log('Created');
                });
        }
        else {
            models.Likes.destroy({
                where: {
                    CommentId: req.query.id, userId: req.query.user
                }
            }).then(function (item) {
                    console.log('Deleted successfully');
                }
                , function (err) {
                    console.log(err);
                });

        }
            res.send('y');
    }
    else {
        res.send('error');
    }
});
function checklocale(req)
{

        if(!req.user) {
            req.session.locale = "en-US";
        }
        else
        {
            req.session.locale=req.user.locale;
        }

}

app.get('/admin', function(req, res)
{
    checklocale(req);
    var User=models.user;
    User.findAll({})
        .then(function(users)
        {
            var data=[];
            users.forEach(
                function(item, i, arr) {
                    data.push({name:item.name, email:item.email, role:item.role, picture:item.pic||gravatar.url(item.email ,  {s: '80', r: 'x', d: 'retro'}, true), status:item.isActive, id:item.id})

                }
            );

            res.render('admin', {
                locale:req.session.locale,
                users:data
            });
        })
        .catch((err) => {
            console.log(err);
            res.redirect('/profile');
        });

});
app.get('/query', function(req, res)
{
    models.Tags.findAll({})
        .then(function(tags) {
            data = [];
            tags.forEach(
                function (item, i, arr) {
                    data.push({text:item.name});

                }
            );
            console.log("DATA"+data);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(data));} );

});


app.get('/search',function(req, res) {
    let promise1=promise2 = new Promise(function(resolve, reject) {
        setTimeout(resolve, 100, 'foo');
    });
    data=[];
    temp=[];
    models.Posts.findAll({
        where: sequelize.literal('MATCH (body, title) AGAINST (:q)'),
        replacements: {
            q: req.query.q
        }
    }).then(function (items) {
        results = [];
        items.forEach(function (item, i, arr) {
            results.push({'url': ('article?id=' + item.id), 'title': item.title, 'description': item.description});
            if (results.length == arr.length) {
                promise1=Promise.resolve(data);

            }
        });
        models.Comments.findAll({
            where: sequelize.literal('MATCH (text) AGAINST (:q)'),
            replacements: {
                q: req.query.q
            }
            , include: [{model: models.Posts}]
        }).then
        (function (comments) {
            temp = [];
            comments.forEach(function (item1, i1, arr1) {
                temp.push({
                    'url': ('article?id=' + item1.Post.id),
                    'title': item1.Post.title,
                    'description': item1.Post.description
                });
                if (temp.length == arr1.length) {
                    console.log(temp);
                    promise2=Promise.resolve(temp);
                }
            });
        });
    });
    Promise.all([promise1, promise2]).then(function(values) {
        results=results.concat(temp);
        unique=[];
        ids=[];
        results.forEach(
            function(item,i,arr)
            {
               if(ids.indexOf(item.url)==-1)
               {
                   unique.push(item);
                   ids.push(item.url);
               }
               if(i==arr.length-1)
               {
                   data = {'results': unique};
                   res.send(JSON.stringify(data));
               }
            }
        );

    });

});
app.post('/updateUser', function(req,res)
{
    console.log(req.body);
    models.user.findOne({where: {id:req.body.id}})
        .then(function(user) {
            user.updateAttributes({name:req.body.name, email:req.body.email});
        });
    res.status(200);
    res.send("");
});
app.get('/cl', function(req, res) {

    models.Tags.findAll({})
        .then(function (tags) {
            data = [];
            sum = 0;
            tags.forEach(
                function (item, i, arr) {
                    item.getPosts().then(function (posts) {
                        sum += posts.length;
                        data.push({'size': Math.min(posts.length, 10), 'word': item.name});
                        console.log(data);
                        if(data.length==tags.length)
                        {
                            res.setHeader('Content-Type', 'application/json');
                            res.send(JSON.stringify(data));
                        }
                    });

                }
            );


        });
});
app.get('/comments', function(req, res)
{
    checklocale(req);
    var targ;
    var Posts = models.Posts;
    var User=models.user;
    Posts.findAll({include:[{model:User},{model:models.Grades},{model:models.Tags}]})
        .then(function(posts)
    {
        posts.forEach(
            function(item, i, arr) {
                avg=count_avg(item.Grades);
                item.avg=avg;
                item.avatar=item.user.pic||gravatar.url(item.user.email ,  {s: '80', r: 'x', d: 'retro'}, true);
                console.log(item.Tags);

            }
        );

        res.render('comments', {

            title: 'Articles Page',
            comments: posts,
            locale:req.session.locale

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
app.get('/translate', function(req, res) {
  res.render('translate');
});
app.get('/ban', function(req, res)
{
    id=req.query.id;
    models.user.findOne({where: {id:id}})
        .then(function(user) {
                    user.updateAttributes({isActive:!user.isActive});
        });
    return res.redirect('/admin');
});
app.get('/set', function(req, res)
{
    id=req.query.id;
    models.user.findOne({where: {id:id}})
        .then(function(user) {
            user.updateAttributes({role:'admin'});
        });
    return res.redirect('/admin');
});
app.get('/testy', function(req, res)
{

    res.render('testy');
});
app.get('/del', function(req, res)
{
    id=req.query.id;
    models.user.destroy({
        where: {
           id:id
        }
    }).then(function (item) {
            console.log('Deleted successfully');
        }
        , function (err) {
            console.log(err);
        });
    return res.redirect('/admin');
});
app.get('/delet', function(req, res)
{
    id=req.query.id;
    models.Posts.destroy({
        where: {
            id:id
        }
    }).then(function (item) {
            console.log('Deleted successfully');
        }
        , function (err) {
            console.log(err);
        });
    if(req.query.back) {
        back=req.query.back;
        back[0]='?';
        res.redirect('/profile'+back);
    }
    else
    {
        res.redirect('/profile');
    }
});
app.get('/article', function(req, res) {
console.log('data');
checklocale(req);
var x=req.user;
if(x)
{
    x=x.id;
}
    res.render('article',{
        locale:req.session.locale,
        id:req.query.id,
        user:x
    });
});
app.get('/publish', function(req, res)
{
   tags=req.query.tags;
     if(req.isAuthenticated()) {
         var Posts = models.Posts;
         models.Posts.findOne({
             where: {
                 id: req.query.id
             }
         }).then(function (post) {
             if (post) {
                 post.updateAttributes({
                     body: req.query.text,
                     title: req.query.title,
                     description: req.query.description,
                     pic: req.query.picture,
                     topic: req.query.topic
                 }).then(function (post, created) {
                     post.setTags([]).then(function (none) {
                         newt = [];
                         if(tags) {
                             tags.forEach(
                                 function (item, i, arr) {
                                     models.Tags.findOrCreate({where: {name: item.text}})
                                         .spread((tag, created) => {
                                             post.addTags([tag]);
                                         });
                                 });
                         }
                     });
                 });
             } else {
                 var data_ =
                     {
                         title: req.query.title,
                         body: req.query.text,
                         userId: req.user.id,
                         description: req.query.description,
                         pic: req.query.picture,
                         topic: req.query.topic
                     };
                 Posts.create(data_).then(function (post, created) {
                     post.setTags([]).then(function (none) {
                         newt = [];
                         tags.forEach(
                             function (item, i, arr) {
                                 models.Tags.findOrCreate({where: {name: item.text}})
                                     .spread((tag, created) => {
                                         post.addTags([tag]);
                                     });

                             });


                     })
                 });

             }
             ;
             res.redirect('/profile');
         });
     }
    else
    {
        res.redirect('/login');
    }

});
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        console.log("AUTH"+req.isAuthenticated());
        return next();
    }
    res.redirect('/login');
};
app.get('/profile', isLoggedIn, function(req, res, next) {
    console.log(req.user);
    checklocale(req);

    if(req.user.role=='admin')
    {
        console.log('admin');
        id=req.query.id||req.user.id;

    }
    else
    {
       id=req.user.id;
    }
    var user;
    models.Posts.findAll({include:[{model:models.user},{model:models.Grades}], where:{userId:id}})
        .then(function(posts)
        {
            posts.forEach(
                function(item, i, arr) {
                    user=item.user;
                    avg=count_avg(item.Grades);
                    item.grade=avg;
                    }
            );
            if(user) {
                console.log(posts);
                res.render('profile', {
                    title: 'Profile Page',
                    user: user.dataValues,
                    avatar: user.pic || gravatar.url(req.user.email, {s: '100', r: 'x', d: 'retro'}),
                    posts: posts,
                    locale:req.session.locale
                })
            }
            else
            {
                models.user.findOne({where:{id:id}})
                    .then(function(user)
                {
                    res.render('profile', {
                        title: 'Profile Page',
                        user: user.dataValues,
                        avatar: user.pic || gravatar.url(req.user.email, {s: '100', r: 'x', d: 'retro'}),
                        posts: posts,
                        locale:req.session.locale
                    })

                })
            }
        });

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
app.get('/local',  function(req, res)
    {
        let newlocale;
        if(req.session.locale=="ru") {
           req.session.locale="en-US";
           newlocale=req.session.locale;
            console.log(newlocale);
        }
        else {
            newlocale=req.session.locale="ru";
            console.log(newlocale);
        }
        if (req.user) {
                models.user.findOne({where:{id:req.user.id}}).then(
                    function(u)
                    {
                        u.updateAttributes({locale:newlocale});
                        res.redirect('/profile');
                    }

                );

            }
        else
        {

            res.redirect('/profile');
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
            error: err, locale:req.session.locale
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}, locale:req.session.locale
    });
});


module.exports = app;

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + server.address().port);
});
