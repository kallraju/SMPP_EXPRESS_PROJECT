var express = require('express');
var router = express.Router();
var pool=require('./db.js');

router.get('/',function(request,response){
   
    pool.query(("CALL Get_all_users_data()"), function(err,rows){
        if(err) throw err;
        //console.log(rows);
        response.send(JSON.stringify(rows[0]));

    });
     
});
//export this router to use in our index.js
module.exports = router;