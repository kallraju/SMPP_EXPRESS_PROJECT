var express = require('express');
var router = express.Router();
var pool=require('./db.js');

router.get('/',(req,res)=>{
    res.end('Hello World!!!');
})
router.post('/login',function(request,response){
    console.log(request.body);
    let name=request.body.name;
    let password=request.body.psw;
    query_str = "CALL Check_User(?,?,@uid,@uname); select @uid UID,@uname UNAME";
    pool.query(query_str, [name,password], function(err,rows){
        if (err) {
            console.log("error ocurred",error);
            response.send({
                "code":400,
                "failed":"error ocurred"
            })
        }
        console.log(rows);
        let a=rows;
        let id=JSON.stringify(a[1][0].UID);
        let name=JSON.stringify(a[1][0].UNAME);
        if (id>0){
            response.send(JSON.stringify({status: 1,user_id:id}));
        }else{
            response.send(JSON.stringify({status: 0}));
        }
    });
 });

//export this router to use in our index.js
module.exports = router;