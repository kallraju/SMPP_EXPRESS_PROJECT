var express = require('express');
var router = express.Router();
var pool=require('./db.js');

router.post('/',function(request,response){
    console.log(request.body);

        var userid=request.body.uid;
        var rtype=request.body.reporttype;
        var fromdate=request.body.fdate+' 00:00:00';
        var todate=request.body.tdate+' 23:59:59';

     query_str = "CALL SMSReports(?,?,?,?)";
     pool.query(query_str, [userid,fromdate,todate,rtype], function(err,rows){
        if(err) throw err;
        console.log(rows[0]);
        response.send(JSON.stringify(rows[0]));

    });  
     
});
//export this router to use in our index.js
module.exports = router;