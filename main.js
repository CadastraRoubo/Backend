/**
 * Created by mushr on 20/06/2017.
 */
let express = require('express');
let mongoose = require('mongoose');
let bodyParser = require('body-parser');
let passport = require('passport');
let app = express();
let FacebookStrategy = require('passport-facebook').Strategy;

app.use(bodyParser.urlencoded({extended: true}));

function authenticationMiddleware () {
    return function (req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        res.redirect('/');
    }
}

passport.use(new FacebookStrategy({
        clientID: 113508735925978,
        clientSecret: 'b1f1a162e23b803d5a17e08f364bd8bc',
        callbackURL: "http://192.168.0.100:3000/auth/facebook/callback",
        profileFields: ['id', 'displayName', 'email']
    },
    function(accessToken, refreshToken, profile, cb) {
        /*User.findOrCreate({ facebookId: profile.id }, function (err, user) {
            return cb(err, user);
        });*/
        let User = mongoose.model('User', require('./model/user'));
        User.update({facebook_id: profile.id}, {name: profile.displayName, email: profile.email}, {upsert: true, setDefaultsOnInsert: true});
        console.log('abc')
    }
));

app.get('/auth/facebook',
    passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    });



mongoose.connect('mongodb://localhost/crimeapp');

//app.use('/auth', authenticationMiddleware());

app.get('/crimes', function(req,res){
    console.log('/crimes');
    let CrimeSchema = require('./model/crime');
    let crime = mongoose.model('Crime', CrimeSchema);

    crime.find({}, function(err, crimes){
        res.send(crimes);
    });
});

app.use('/auth/', function(req,res,next){
    console.log('Testa auth');
    next();
});

app.get('/auth/teste', function (req,res) {
   res.send('Essa pagina e protegida');
});

app.post('/auth/crime', function(req,res){
    let Crime = mongoose.model('Crime', require('./model/crime'));
    let crime = new Crime({lat: req.body.lat,lng: req.body.lng,date: req.body.date,type: req.body.type});
    crime.save(function(err){
        if(err){
            console.log(err);
            res.send('err');
        }else{
            res.send('ok');
        }
    });
});


app.get('/', function (req, res) {
   res.send('CrimeApp');
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});