/**
 * Created by mushr on 20/06/2017.
 *
 * https://gist.github.com/Turox/49bcfc49a1ba70873da31a4f92debed8
 */
let express = require('express');
let mongoose = require('mongoose');
let app = express();
let cors = require('cors');
let graph = require('fbgraph');

app.use(require('body-parser').urlencoded({ extended: true }));


mongoose.connect('mongodb://localhost/crimeapp');

app.use(cors());
app.get('/crimes', function(req,res){
    console.log('/crimes');
    let CrimeSchema = require('./model/crime');
    let crime = mongoose.model('Crime', CrimeSchema);

    crime.find({}, function(err, crimes){
        res.send(crimes);
    });
});

app.use('/auth/', function(req,res,next){
    let access_token = req.header('access-token');
    let user_id = req.header('user-id');
    if(access_token && user_id) {
        console.log("Access_token: ", access_token, " User_id: ", user_id);
        //https://stackoverflow.com/questions/12065492/rest-api-for-website-which-uses-facebook-for-authentication?answertab=votes#tab-top
        graph.get("/me?access_token=" + access_token, function (err, profile) {
            if (profile.id === user_id) {
                let User = mongoose.model('User', require('./model/user'));
                //weorkweoprktrotgmo
                User.update({facebook_id: profile.id}, {name: profile.name, email: profile.email}, {
                    upsert: true,
                    setDefaultsOnInsert: true
                });
                req.user = {
                    facebook_id: profile.id,
                    name: profile.name
                };
                next();
            } else {
                res.status(401);
                res.send('Unauthorized');
            }
        });
    }else{
        res.status(401);
        res.send('Unauthorized');
    }
});

app.post('/auth/crime', function(req,res){
    let Crime = mongoose.model('Crime', require('./model/crime'));
    let crime = new Crime(
        {lat: req.body.lat,
            lng: req.body.lng,
            date: req.body.date,
            type: req.body.type,
            desc: req.body.desc,
            facebook_id: req.user.facebook_id,
            });
    crime.save(function(err){
        if(err){
            console.log(err);
            res.send('err');
        }else{
            res.send(JSON.stringify(crime));
        }
    });
});

app.delete('/auth/crime/:crime_id', function(req,res){
    let Crime = mongoose.model('Crime', require('./model/crime'));
    let crime = Crime.findOne({_id: req.params.crime_id}, function(err, crime){
        if(crime){
            if(crime.facebook_id === req.user.facebook_id){
                crime.remove(function(err){
                    if(err){
                        res.status(500);
                        res.send('Internal error');
                    }else{
                        res.send('deleted');
                    }
                })
            }else{
                res.status(401);
                res.send('This is not your crime');
            }
        }else{
            res.status(404);
            res.send('Crime not found');
        }
    });
});


app.put('/auth/crime/:crime_id', function(req,res){
    let Crime = mongoose.model('Crime', require('./model/crime'));
    let crime = Crime.findOne({_id: req.params.crime_id}, function(err, crime){
        if(crime){
            if(crime.facebook_id === req.user.facebook_id){
                crime.desc = req.body.desc;
                crime.type = req.body.type;

                crime.save(function(err){
                    if(err){
                        res.status(500);
                        res.send('Internal error');
                    }else{
                        res.send(JSON.stringify(crime));
                    }
                })
            }else{
                res.status(401);
                res.send('This is not your crime');
            }
        }else{
            res.status(404);
            res.send('Crime not found');
        }
    });
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
