
/**
 * Module dependencies.
 */

var express = require('express')
    , http = require('http')
    , path = require('path')
    , bodyParser = require('body-parser')
    , favicon = require('serve-favicon')
    , logger = require('morgan')
    , methodOverride = require('method-override');

var app = express();

// Controllers
const accountsController = require("./controllers/accountsController");
const benchmarksController = require("./controllers/benchmarksController");
const listsController = require("./controllers/listsController");
const configuratorController = require("./controllers/configuratorController");
const partsController = require("./controllers/partsController");

app.set('port', process.env.PORT || 3001);
app.use(favicon(__dirname + '/public/images/favicon.png'));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(express.json())

const db = require("./config/db");

var session = require('express-session');

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // set true if HTTPS is used (PRODUCTION)
}));


var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3001/auth/github/callback"
},
    function (accessToken, refreshToken, profile, done) {
        return done(null, profile);
    }
));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.setHeader('Connection', 'keep-alive');
    next();
});

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});


if (app.get('env') == 'development') {
    app.locals.pretty = true;
}

// middleware
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        console.log("403 Forbidden")
        // 403 Forbidden
        res.status(403).send('Forbidden - You do not have permission to access this resource.');
    }
}

// ensure list ownership
function ensureListOwner(req, res, next) {
    const listid = req.params.listid;
    const userid = req.user.id;
    const query = `
        SELECT * FROM partslist
        WHERE listid = $1 AND userid = $2
    `;
    const values = [listid, userid];
    db.query(query, values)
        .then((result) => {
            if (result.rows.length > 0) {
                return next();
            } else {
                console.log("403 Forbidden")
                // 403 Forbidden
                res.status(403).send('Forbidden - You do not have permission to access this resource.');
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Internal Server Error');
        });
}


// Routes

/**
 * @BENCHMARKS
 */
app.post('/api/benchmarks', function (req, res) {
    benchmarksController.benchmarkPricePerf(req, res, db);
});

app.get('/api/benchmarks/:chipsetid', function (req, res) {
    benchmarksController.getBenchmarks(req, res, db);
});

/**
 * @LISTS
 */
app.get('/api/lists', ensureAuthenticated, function (req, res) {
    listsController.getLists(req, res, db);
});

app.post('/api/newlist', ensureAuthenticated, function (req, res) {
    listsController.addList(req, res, db);
});

app.delete('/api/deletelist/:listid', ensureAuthenticated, ensureListOwner, function (req, res) {
    listsController.deleteList(req, res, db);
});

app.post('/api/editlist/:listid', ensureAuthenticated, ensureListOwner, function (req, res) {
    listsController.editList(req, res, db);
});

app.get('/api/listinfo/:listid', function (req, res) {
    listsController.getListInfo(req, res, db);
});

app.get('/api/listtdp/:listid', function (req, res) {
    listsController.getListTDP(req, res, db);
});

app.get('/api/listswithpart/:partid', function (req, res) {
    listsController.getListsWithPart(req, res, db);
});

/**
 * @CONFIGURATOR
 */
app.get('/api/configurator/:listid', function (req, res) {
    configuratorController.getParts(req, res, db);
});

app.post('/api/addpart/:listid', ensureAuthenticated, ensureListOwner, function (req, res) {
    configuratorController.addPart(req, res, db);
});

app.delete('/api/deletepart/:listid', ensureAuthenticated, ensureListOwner, function (req, res) {
    configuratorController.deletePart(req, res, db);
});

app.put('/api/updatequantity/:listid', ensureAuthenticated, ensureListOwner, function (req, res) {
    configuratorController.updateQuantity(req, res, db);
});

/**
 * @BROWSE
 */
app.post('/api/browse', function (req, res) {
    partsController.browse(req, res, db);
});

app.post('/api/browse/menu', function (req, res) {
    partsController.menuItems(req, res, db);
});

app.get('/api/details/:partid', function (req, res) {
    partsController.getPartDetails(req, res, db);
});


/**
 * @AUTH
 */
app.get('/auth/github',
    passport.authenticate('github'),
);

app.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/' }),
    function (req, res) {
        
        accountsController.loginUser(req, res, db);

        // Successful authentication:
        // res.redirect('/');
        // successful authentication in development:
        res.redirect('http://localhost:3000');
    }
);

app.get('/api/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ username: req.user.username });
    } else {
        res.json({ username: null });
    }
});

app.get('/logout', function (req, res) {
    req.logout(function(err) {
        if(err) {
            // Handle error
            console.error(err);
            return res.status(500).json({ message: 'Logout error' });
        }
        // Successful logout:
        // res.redirect('/');
        // successful logout in development:
        res.redirect('http://localhost:3000');
    });
});


/**
 * favicon
 */
app.get('/favicon.ico', (req, res) =>
    res.sendFile(path.join(__dirname, '/client/build/favicon.ico'))
);

// app.use(express.static(path.join(__dirname, 'client/build'))); // only in production

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
// app.get('*', (req, res) => {
// 	res.sendFile(path.join(__dirname + '/client/build/index.html'));
// });

var server = http.createServer(app);

server.keepAliveTimeout = 30000;
server.maxHeadersCount = 100;

server.listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});