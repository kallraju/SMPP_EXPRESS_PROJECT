var express = require('express');
var fs =require("fs"); 
var router = express.Router();
var pool=require('./db.js');
var XLSX = require('xlsx');


var parseXLSX = (strFileName)=>{
    try{
        var workbook = XLSX.readFile('./uploads/'+strFileName);
        var sheet_name_list = workbook.SheetNames;
        var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]],{header: 1});
        var totMNOs='';
        xlData.forEach(element => {
            if(totMNOs===''){
                totMNOs = element[0];
            }
            else
                totMNOs = totMNOs + '\n' + element[0];
        });
        return totMNOs;
    }
    catch(ex){
        return "";
    }
}

var parseTXTCSV = (strFileName)=>{
    try{
        var contents= fs.readFileSync('./uploads/'+strFileName);
        return contents.toString();
    }
    catch(ex){
        return "";
    }
}

//var low_user=require('./send_sms.js');
router.post('/compose',async (request,response)=>{
    //console.log(request.body);
    try{
        let mnos='';
        if(request.body.sendtype==2){
            let sampleFile = request.files.UF;
            fileExtension = sampleFile.name.replace(/^.*\./, '');
            if(fileExtension=='xlsx') {
                await sampleFile.mv('./uploads/' + sampleFile.name);
                /*var workbook = XLSX.readFile('./uploads/'+sampleFile.name);
                var sheet_name_list = workbook.SheetNames;
                var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]],{header: 1});
                var totMNOs='';
                xlData.forEach(element => {
                    if(totMNOs===''){
                        totMNOs = element[0];
                    }
                    else
                        totMNOs = totMNOs + '\n' + element[0];
                });
                mnos=totMNOs;*/
                mnos=parseXLSX(sampleFile.name);
            }
            else if(fileExtension=='txt' || fileExtension=='csv') {
                await sampleFile.mv('./uploads/' + sampleFile.name);
                /*var contents= fs.readFileSync('./uploads/'+sampleFile.name);
                mnos=contents.toString();*/
                mnos=parseTXTCSV(sampleFile.name);
            }
            else{
                res.end({Success: "Please Select Vaild File"});
            }
    }
    else
        mnos = request.body.mno;

        let campname = request.body.cap;
        if(campname==='')
            campname='No campaign Name given';

        
        mnos=mnos.replace(new RegExp('\r', 'g'),'');
        mnos=mnos.replace(new RegExp('\n', 'g'),',');
        let mnosArray = mnos.split(',');
        //let mnosCnt = mnos.length-mnos.replace(new RegExp(',', 'g'),'').length+1;
        let mnosCnt = mnosArray.length;
        let sname = request.body.senderid;
        let rtype= request.body.Rtype;
        let msg= request.body.msg;
        let msg1 = msg.replace(/'/g, "\\'");
        
        if(rtype=="TPT"){
            //TEMPLATE OPEN CHECKING            
            //console.log(request.body.uid);
            var query_str = "CALL Get_User(?);";
            var result = await pool.query(query_str,[request.body.uid]);
            //console.log("OK: " + result[0][0].isopentemp);
            if(result[0][0].isopentemp==0){
                var query_str = "SELECT fn_IsValidTemplate(?,?) temp";
                var results1 = await pool.query(query_str,[request.body.uid,msg]);
                
                let strTemplate=results1[0].temp;
                if(strTemplate=='INVALID TEMPLATE'){
                    response.end(JSON.stringify({failed:strTemplate}));
                    return false;
                }
            }
        }
        //balanc checking
        var query_str = "CALL credit_balance(?,@bal,@exp,@promo,@promoexp); select @bal bal,@exp exp,@promo promo,@promoexp promoexp";
        var bal_result = await pool.query(query_str,[request.body.uid]);
        //console.log(bal_result[1][0].bal);
        if(rtype=='TPT'){
            var bal=bal_result[1][0].bal;
        }
        else
        {
            var bal=bal_result[1][0].promo;
        }
        //file prossing count
        
        var query_str = "CALL File_Proces_Count(?);";
        var result = await pool.query(query_str,[request.body.uid]);
        //console.log(result[0]);
        var phone_cnt=0;
        if(result[0].length>0)
            phone_cnt = result[0][0].phone_cnt;
        //console.log(mnosCnt+phone_cnt);
        if(mnosCnt+phone_cnt>bal){
            response.end(JSON.stringify({failed:'Insufficient Balance'}));
            return false;
        }
        if(mnosCnt>5){
            var rtypeStr = 0;
            if(rtype=='TPT')
                rtypeStr=1;
            else if(rtype=='TPPS')
                rtypeStr=2;
            var query_str = "CALL Get_SMSTransactionid(?,?,?,?,?,?,?,?,@ret); select @ret ret";
            var results1 = await pool.query(query_str,[request.body.uid,mnosCnt,'C',rtypeStr,0,sname,msg1,campname]);
            let tid=results1[1][0].ret;
            
            sname=rtype + '~' + sname + '~' + tid;
            
            var results=await pool.query("CALL Get_Lowuserdetails("+request.body.uid+")");            
            let lWeightage=100;
            
            if(JSON.stringify(results[0].length)>0){
                lWeightage = JSON.stringify(results[0][0].weightage);
            }            
            var pushmno=Math.floor((lWeightage/100)*mnosCnt);
            results=await pool.query("SET NAMES 'utf8';SET CHARACTER SET utf8;");
            query_str = "CALL Mnos_Data_Insert(?,?,?,?,?,?,?);";
            results1 = await pool.query(query_str,[request.body.uid,sname,msg1,mnos,mnosCnt,pushmno,1]);
            //console.log(JSON.stringify(results1[0]));
            response.end(JSON.stringify(results1[0]));
            return false;
        }
        else{
            sname=rtype + '~' + sname;            
            var query_str = "CALL Save_COMPOSE_SMS(?,?,?,?,?,@ret); SELECT @ret ret";
            var strError='';
            var results=await pool.query("SET NAMES 'utf8';SET CHARACTER SET utf8;");
            for(var i=0;i<mnosArray.length;i++){
                mnosArray[i]="191" + mnosArray[i].substr(mnosArray[i].length-10);                
                var results=await pool.query(query_str,[request.body.uid,mnosArray[i],msg1,sname,1]);
                if(results[1][0].ret.indexOf('Error:')>-1){
                    strError=results[1][0].ret;
                    break;
                }                
                console.log(results[1][0].ret);
            }
            response.send({"Success": i+" Message sent \n" + strError});
        }
    }
    catch(error){
        response.send(JSON.stringify({failed:"Something went wrong in compose"}));
        throw Error("Error at compose route"+error);
    }
 });

//export this router to use in our index.js
module.exports = router;