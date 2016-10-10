'use strict';

const express = require(`express`);
const session = require(`express-session`);
const exphbs = require(`express-handlebars`);
const path = require(`path`);
const logger = require(`morgan`);
const cookieParser = require(`cookie-parser`);
const bodyParser = require(`body-parser`);
const passport = require(`passport`);
const LocalStrategy = require(`passport-local`).Strategy;
const LinkedInStrategy = require(`passport-linkedin-oauth2`).Strategy;

const routes = require(`./routes/index`);
const users = require(`./routes/users`);
const contacts = require(`./routes/contacts`);
const individual = require(`./routes/individual`);
const knex = require(`/db/knex`);



const app = express();

// passport config--localStrategy
passport.use(new LocalStrategy({
  usernameField: `email`,
  passwordField: `password`
},
  (email, password, done) => {
    knex(`users`).where(`email`, email).then((err, user) => {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: `Incorrect username.` });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: `Incorrect password.` });
      }
      return done(null, user);
    });
  }
));

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  db.users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});


// // passport config--LinkedinStrategy
// passport.use(new LinkedInStrategy({
//   clientID: `	78l9gagfa8y1e4`,
//   clientSecret: `tebeZ6mNZqOrZOxd`,
//   callbackURL: "http://127.0.0.1:3000/auth/linkedin/callback",
//   scope: [`r_emailaddress`, `r_basicprofile`],
// }, function(accessToken, refreshToken, profile, done) {
//   // asynchronous verification, for effect...
//   process.nextTick(function () {
//     // To keep the example simple, the user's LinkedIn profile is returned to
//     // represent the logged-in user. In a typical application, you would want
//     // to associate the LinkedIn account with a user record in your database,
//     // and return that user instead.
//     return done(null, profile);
//   });
// }));
//
// app.get(`/auth/linkedin`,
//   passport.authenticate(`linkedin`, { state: `SOME STATE`  }),
//   function(req, res){
//     // The request will be redirected to LinkedIn for authentication, so this
//     // function will not be called.
//   });

// view engine setup
app.set(`views`, path.join(__dirname, `views`));
app.set(`view engine`, `jade`);

app.engine(`handlebars`, exphbs({ defaultLayout: `main` }));
app.set(`view engine`, `handlebars`);

app.use(logger(`dev`));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, `public`)));
app.use(session({ secret: `crunchy taco` }));
app.use(passport.initialize());
app.use(passport.session());

app.use(`/`, routes);
app.use(`/users`, users);
app.use(`/contacts`, contacts);
app.use(`/individual`, individual);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error(`Not Found`);

  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get(`env`) === `development`) {
  app.use((err, req, res) => {
    res.status(err.status || 500);
    res.render(`error`, {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res) => {
  res.status(err.status || 500);
  res.render(`error`, {
    message: err.message,
    error: {}
  });
});

module.exports = app;
