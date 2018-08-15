var express = require('express');
var router = express.Router();
var pool=require('./db.js');

router.post('/getsids',function(request,response){
    //console.log(request.body);
        let uid=request.body.id;
        
    pool.query(("CALL Get_User_bySenderId('"+uid+"')"), function(err,rows){
            if(err) throw err;
            response.send(JSON.stringify(rows[0]));
    });

});    
    
//export this router to use in our index.js
module.exports = router;