const mysql = require("mysql");
const config = require("../config/config-loader.js");


let pool = null;

function connect(){
    pool = mysql.createPool({
        connectionLimit : 10,
        host            : config.DATABASE_HOST,
        port            : config.DATABASE_PORT,
        user            : config.DATABASE_USERNAME,
        password        : config.DATABASE_PASSWORD,
        database        : config.DATABASE_NAME,
        dateStrings     : true
    });
}

async function query(...args){
    return new Promise(function(resolve, reject){
        pool.query(...args, function (error, results, fields){
            if(error){
                console.log(`\n\nError During database query:\n${error}\n\n`);
                reject(error);
            }
            else {
                resolve({ results, fields });
            }
        });
    });
}

async function testConnection() {
    const testName = "db connection test: ";

    let success = false;
    try {
        const testResult = await query("SELECT 1+1 AS solution");
        const results = testResult.results;
        const solution = results[0].solution;
        success = (solution == 2);
    }
    catch(e) {

    }

    if(success)
        console.log(`${testName} success`);
    else
        console.log(`${testName} failure`);
}

connect();
testConnection();


module.exports = {
    connect,
    query,
    testConnection
};

