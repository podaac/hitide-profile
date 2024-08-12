const db = require("./db.js");
const util = require("./util.js");


///////////////////////////////////////////////////////////////////////
//
//          Exported Functions
//
//////////////////////////////////////////////////////////////////////
async function addJob(job){
    const dbJob = convertJsJobToDbJob(job);
    const addJobQuery = createAddJobQuery(dbJob);
    const queryResult = await db.query(addJobQuery.string, addJobQuery.values);
    const numInsertedRows = queryResult.results.affectedRows;
    return numInsertedRows;
}

async function getJobByToken(token){
    const queryString = `SELECT * FROM jobs WHERE token = ?`;
    const queryResult = await db.query(queryString, [token]);
    const jobFromDb = queryResult.results[0];
    const job = convertDbJobToJsJob(jobFromDb);
    return job;
}

async function getJobsByUsername(username){
    const queryString = `SELECT * FROM jobs WHERE username = ? AND disabled_by_user = 0`;
    const queryResult = await db.query(queryString, [username]);
    const jobsFromDb = queryResult.results;
    const jobs = jobsFromDb.map(convertDbJobToJsJob);
    return jobs;
}

async function updateJob(job){
    const dbJob = convertJsJobToDbJob(job);
    const updateJobQuery = createUpdateJobQuery(dbJob);
    const queryResult = await db.query(updateJobQuery.string, updateJobQuery.values);
    const numUpdatedRows = queryResult.results.affectedRows;
    return numUpdatedRows;
}

async function disableJob(username, token){
    const queryString = "UPDATE jobs SET disabled_by_user = 1 WHERE username = ? AND token = ?";
    const queryResult = await db.query(queryString, [username, token]);
    const numUpdatedRows = queryResult.results.affectedRows;
    return numUpdatedRows;
}

module.exports = {
    addJob,
    updateJob,
    getJobByToken,
    getJobsByUsername,
    disableJob
};


///////////////////////////////////////////////////////////////////////
//
//          Helper Functions
//
//////////////////////////////////////////////////////////////////////
function convertDbJobToJsJob(dbJob) {
    // Copy properties from 'dbJob' to 'jsJob'
    // Only copy properties listed in 'dbNamesToJsNamesMap'
    // Convert property names while copying (according to 'dbNamesToJsNamesMap)
    // If value is 'undefined' or 'null', don't copy
    // If value is a date (according to 'timestampProperties'), 
    //   convert from YYYY-MM-DD hh:mm:ss.SSS to YYYY-MM-DDThh:mm:ss.SSSZ
    //   before copying
    // If value is a stringified object/array, parse the object/array before copying

    const jsJob = {};

    for(let dbKey in dbJob) {
        const jsKey = dbNamesToJsNamesMap[dbKey];

        if(!dbJob.hasOwnProperty(dbKey) || !jsKey){
            continue;
        }

        let value = dbJob[dbKey];

        if(value === undefined || value === null) {
            continue;
        }

        if(timestampProperties[jsKey]) {
            value = `${value}Z`;
            value = value.replace(" ", "T");
        }

        if(jsonProperties[jsKey]) {
            // if string is not valid json, convert it to valid json.
            try {
                value = JSON.parse(value);
            } catch(error) {
                if(dbKey === 'download_urls') {
                    value = ['https://harmony.earthdata.nasa.gov/jobs/' + dbJob['token']]
                }
            }
            
        }

        jsJob[jsKey] = value;
    }

    return jsJob;
}

function convertJsJobToDbJob(jsJob) {
    // Copy properties from 'jsJob' to 'dbJob'
    // Only copy properties listed in 'jsNamesToDbNamesMap'
    // Convert property names while copying (according to 'jsNamesToDBNamesMap)
    // If value is 'undefined' or 'null', don't copy
    // If value is a date (according to 'timestampProperties'), 
    //   convert from YYYY-MM-DDThh:mm:ss.SSSZ to YYYY-MM-DDThh:mm:ss.SSS
    //   before copying
    // If value is an object/array, stringify the object/array before copying

    const dbJob = {};

    for(let jsKey in jsJob) {
        const dbKey = jsNamesToDbNamesMap[jsKey];

        if(!jsJob.hasOwnProperty(jsKey) || !dbKey)
            continue;

        
        let value = jsJob[jsKey];

        if(value === undefined || value === null) {
            continue;
        }

        if(timestampProperties[jsKey]) {
            value = value.replace("Z", "");
        }

        if(jsonProperties[jsKey]) {
            value = JSON.stringify(value);
        }

        dbJob[dbKey] = value;
    }

    return dbJob;
}

function createAddJobQuery(job) {
    let fieldNamesString = "";
    let valuesString = "";
    const valuesArray = [];

    Object.keys(job).forEach(function(key, index) {
        if(index === 0) {
            fieldNamesString += key;
            valuesString += "?";
        }
        else {
            fieldNamesString += `, ${key}`;
            valuesString += ", ?";
        }

        valuesArray.push(job[key]);
    });

    return {
        string: `INSERT INTO jobs (${fieldNamesString}) VALUES (${valuesString});`,
        values: valuesArray
    };
}

function createUpdateJobQuery(job) {
    let fieldNamesAndQuestionMarksString = "";
    const valuesArray = [];

    Object.keys(job).forEach(function(key, index) {
        if(index === 0) {
            fieldNamesAndQuestionMarksString += `${key}=?`;
        }
        else {
            fieldNamesAndQuestionMarksString += `, ${key}=?`;
        }

        valuesArray.push(job[key]);
    });

    valuesArray.push(job.token);

    return {
        string: `UPDATE jobs SET ${fieldNamesAndQuestionMarksString} WHERE token=?;`,
        values: valuesArray
    };
}

///////////////////////////////////////////////////////////////////////
//
//          Map Objects (used by helper functions)
//
//////////////////////////////////////////////////////////////////////
const jsNamesToDbNamesMap = {
    username: "username",
    email: "email",
    subjobs: "subjobs",
    downloadUrls: "download_urls",
    citations: "citations",
    requestTime: "request_time",
    completeTime: "complete_time",
    statusString: "status_string",
    statusCode: "status_code",
    token: "token",
    granulesRequested: "granules_requested",
    granulesCompleted: "granules_completed",
    granulesFailed: "granules_failed",
    totalDownloadBytes: "total_download_bytes",
    disabledByUser: "disabled_by_user"
};


const dbNamesToJsNamesMap = util.createReversedMap(jsNamesToDbNamesMap);

const timestampProperties = {
    requestTime: true,
    completeTime: true
}

const jsonProperties = {
    subjobs: true,
    downloadUrls: true,
    citations: true
}