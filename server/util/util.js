const moment = require("moment");
const packagedotjson = require("../../package.json");


function btoa(str){
    return Buffer.from(str, "binary").toString("base64");
}

function get(obj, ...properties){

    if(!obj) return undefined;
    
    for(let i = 0; i < properties.length; i++){
        const key = properties[i];
        if(typeof key !== "string")
            return undefined;
        obj = obj[key];
        if(!obj)
            return undefined;
    }

    return obj;
}

function getHitideVersion() {
    const versionString = packagedotjson.version;
    const versionNumbers = versionString.split(".");

    const major = versionNumbers[0],
          minor = versionNumbers[1],
          patch = versionNumbers[2],
          string = versionString;

    return {
        major, minor, patch, string
    };
}

function utcTimestamp(date) {
    return moment.utc(date).toISOString();
}

function createReversedMap(map) {
    const reverseMap = {};
    
    for(let key in map) {
        if(!map.hasOwnProperty(key))
            continue;

        const value = map[key];
        reverseMap[value] = key;
    }

    return reverseMap;
}


module.exports = {
    get,
    btoa,
    utcTimestamp,
    getHitideVersion,
    createReversedMap
};