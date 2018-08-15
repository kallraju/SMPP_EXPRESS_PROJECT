var express=require("express");
var bodyPaser=require("body-parser");
var app=express();
const fileupload = require('express-fileupload');


var login=require('./login.js');
var getsids=require('./getsenderids.js');
var getsavedmsg=require('./getsavedmsg.js');
var gettemplates=require('./gettemplates.js');
var compose=require('./compose.js');
var smsreports=require('./smsreports.js');
var user_registation=require('./user_registation.js');
var user_data=require('./get_user_data.js');
var user_bal=require('./user_balance.js');

app.use(fileupload({limits: 50 * 1024 * 1024}));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader('Content-Type', 'application/json');
    next();
  });  
  app.use(bodyPaser.json());
  app.use(bodyPaser.urlencoded({
        extended:false
 }));
app.use('/',login);
app.use('/sms', getsids);
app.use('/sms', getsavedmsg);
app.use('/sms', gettemplates);
app.use('/sms', compose);
app.use('/reports', smsreports);
app.use('/registration',user_registation);
app.use('/getuserdata',user_data);
app.use('/userbal',user_bal);
//app.listen(3000,"localhost");
app.listen(3000,"0.0.0.0");
//app.listen(3000,"192.168.0.1");



