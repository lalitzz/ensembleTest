const mongoose = require('mongoose');
const express = require('express');
const userRouter = express.Router();
const userModel = mongoose.model('User');
const responsegenerator = require('./../../library/responsegenerator');
const passportFacebook = require('./../../middleware/passport.validation');
const passport = require('passport');

module.exports.controllerFunction  = function(app) {
     userRouter.post('/signup', (req, res) => {
          if(!req.body.email || !req.body.name || !req.body.password){
             var myresponse = responsegenerator.generate(app, true, '', 404, null, null);
             res.send(myresponse);
             console.log(req.body.email);
          }else{
             var newuser = new userModel({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                role: 'user',
                gender: 'male'
             });

             newuser.save((err, data) => {
                 console.log(err);
                 console.log(data);
                 if(err){
                    var myresponse = responsegenerator.generate(app, true, err, 500, null, null);
                    res.send(myresponse);
                 }else{
                    newuser.generateAuthToken().then((token) => {
                        var myresponse = responsegenerator.generate(app, false, 'success', 200, null, token);
                        res.send(myresponse);
                    });
                    
                 }
             });
          }
     });


     userRouter.post('/login', (req, res) => {
         if(!req.body.email || !req.body.password){
            var myresponse = responsegenerator.generate(app, true, '', 404, null, null);
            res.send(myresponse);
         }else{
             userModel.findByCredential(req.body.email, req.body.password).then((result) => {
                 console.log(result);
                 return result.generateAuthToken().then((token) => {
                    console.log(token);
                        var myresponse = responsegenerator.generate(app, false, 'success', 200, null, token);
                        //res.send(myresponse);
                        res.set({
                            'Content-Type': 'application/json',
                            'Content-Length': '123',
                            'ETag': '12345',
                            'Access-Control-Allow-Origin': '*',
                            'X-Powered-By': '',
                            'x-auth': token
                        }).send(result);
                 });
             }).catch((err) => {
                 res.send(err);
                 console.log(err);
             });
             //res.send('hello');
         }
     });
     passportFacebook();

     userRouter.post('/login/facebook', passport.authenticate('facebook-token', {session: false})
           , function(req, res, next) {
            req.auth = {
                id: req.body.userID
              };
          
              next();
        console.log(req.body); 
        res.send('ok');
     });
     
     

     app.use('/user', userRouter);
}