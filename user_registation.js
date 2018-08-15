var express = require('express');
var router = express.Router();
var pool=require('./db.js');


router.post('/',function(request,response){
    //console.log("kk");
    console.log(request.body);
    let uname=request.body.uname;
    let pwd=request.body.pwd;
    let fname=request.body.fname;
    let lname=request.body.lname;
    let mno=request.body.mno;
    let email=request.body.email;
    console.log(uname,pwd,fname,lname,mno,email,0,1);
    query_str = "CALL Userreg_Singup(?,?,?,?,?,?,?,?,@RetVal); select @RetVal RetVal";
    //console.log(query_str);
    pool.query(query_str, [uname,pwd,fname,lname,mno,email,0,1], function(err,rows){
        if (err) {
            console.log("error ocurred",error);
            response.send({
                "code":400,
                "failed":"error ocurred"
            })
        }

        let a=rows;
        console.log(rows);
        //let id=JSON.stringify(a[1][0].RetVal);
        let name=JSON.stringify(a[1][0].RetVal);
        console.log(name);
        if (name>0){
            response.send(JSON.stringify({status: 1}));
        }else{
            response.send(JSON.stringify({status: 0}));
        }
    });
 });

//export this router to use in our index.js
module.exports = router;