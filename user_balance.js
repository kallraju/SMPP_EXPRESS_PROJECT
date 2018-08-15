var express = require('express');
var router = express.Router();
var pool=require('./db.js');

router.post('/',function(request,response){
   console.log("kkk");
        let uid=request.body.id;
        //console.log(uid);
        query_str = "CALL credit_balance(?,@trans,@transexpire,@promo,@promoexpire); select @trans TRANS,@transexpire TRANSEXP,@promo PROMO,@promoexpire PROMOexpire";
        pool.query(query_str, [uid], function(err,rows){
            if(err) throw err;
            //console.log(rows);
            response.send(JSON.stringify(rows[0]));

        });
     
});
//export this router to use in our index.js
module.exports = router;