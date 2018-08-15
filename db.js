var mysql = require('mysql')
var util = require('util');
/*var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'gold420',
    database : 'test_demo',
    multipleStatements: true
});
module.exports=connection;*/

var pool = mysql.createPool({
    connectionLimit : 10,
    host     : '127.0.0.1',
    user     : 'root',
    password : 'gold420',
    database : 'test_demo',
    multipleStatements: true,
    debug    :  false
});

pool.getConnection((err,connection)=>{
    if(err) throw Error("Error at Connection");
    if(connection){
        console.log('Connection closed');
        connection.release();
    }
    return;
})

pool.query = util.promisify(pool.query);
module.exports = pool;