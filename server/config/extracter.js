function extractConfig(source) {
    const config = {};

    copyString(config, source, "DATABASE_HOST");
    copyNumber(config, source, "DATABASE_PORT");
    copyString(config, source, "DATABASE_NAME");
    copyString(config, source, "DATABASE_USERNAME");
    copyString(config, source, "DATABASE_PASSWORD");

    copyBoolean(config, source, "SHOULD_SERVE_HTTP");
    copyNumber(config, source, "HTTP_PORT");

    copyBoolean(config, source, "SHOULD_SERVE_HTTPS");
    copyNumber(config, source, "HTTPS_PORT");
    copyString(config, source, "SSL_KEY");
    copyString(config, source, "SSL_CERT");

    copyString(config, source, "COOKIE_PATH");
    copyBoolean(config, source, "COOKIE_SECURE");
    copyBoolean(config, source, "COOKIE_HTTP_ONLY");
    copyNumber(config, source, "COOKIE_MAX_AGE");
    copyNumber(config, source, "NUM_PROXY_SERVERS_FOR_API");
    copyString(config, source, "SESSION_COOKIE_SECRET");

    copyString(config, source, "EARTH_DATA_LOGIN_AUTH_CODE_REQUEST_URI");
    copyString(config, source, "EARTH_DATA_LOGIN_TOKEN_REQUEST_URI");
    copyString(config, source, "EARTH_DATA_LOGIN_TOKEN_REFRESH_URI");
    copyString(config, source, "EARTH_DATA_LOGIN_USER_INFO_URI");
    copyString(config, source, "EARTH_DATA_LOGIN_CLIENT_ID");
    copyString(config, source, "EARTH_DATA_LOGIN_PASSWORD");

    copyString(config, source, "HARMONY_BASE_URL");

    copyList(config, source, "LIST_OF_AUTHORIZED_CORS_REQUESTER_ORIGINS");

    // Take care of legacy property names
    copyString(config, source, "databaseUserid", "DATABASE_USERNAME");
    copyString(config, source, "databasePassword", "DATABASE_PASSWORD");
    copyString(config, source, "earthDataAppClientId", "EARTH_DATA_LOGIN_CLIENT_ID");
    copyString(config, source, "earthDataAppPassword", "EARTH_DATA_LOGIN_PASSWORD");
    copyString(config, source, "sessionCookieSecret", "SESSION_COOKIE_SECRET");

    return config;
}

function copyString(destObj, sourceObj, sourceProp, destProp) {
    const finalProp = destProp || sourceProp;
    if (typeof sourceObj[sourceProp] === "string") {
        destObj[finalProp] = sourceObj[sourceProp];
    }
}

function copyNumber(destObj, sourceObj, sourceProp, destProp) {
    const finalProp = destProp || sourceProp;
    let value;

    if (typeof sourceObj[sourceProp] === "number") {
        value = sourceObj[sourceProp];
    } else if (typeof sourceObj[sourceProp] === "string") {
        value = Number.parseFloat(sourceObj[sourceProp]);
        if (`${value}` !== sourceObj[sourceProp].trim()) {
            value = undefined;
        }
    }

    if (typeof value === "number") {
        destObj[finalProp] = value;
    }
}

function copyBoolean(destObj, sourceObj, sourceProp, destProp) {
    const finalProp = destProp || sourceProp;
    let value;

    if (typeof sourceObj[sourceProp] === "boolean") {
        value = sourceObj[sourceProp];
    } else if (typeof sourceObj[sourceProp] === "string") {
        const str = sourceObj[sourceProp].trim().toLowerCase();
        if (str === "true") {
            value = true;
        } else if (str === "false") {
            value = false;
        }
    }

    if (typeof value === "boolean") {
        destObj[finalProp] = value;
    }
}

function copyList(destObj, sourceObj, sourceProp, destProp) {
    const finalProp = destProp || sourceProp;

    if (Array.isArray(sourceObj[sourceProp])) {
        destObj[finalProp] = sourceObj[sourceProp];
    } else if (typeof sourceObj[sourceProp] === "string") {
        destObj[finalProp] = sourceObj[sourceProp].split(",").map((str) => str.trim());
    }
}

module.exports = {
    extractConfig,
    copyString,
    copyNumber,
    copyBoolean,
    copyList,
};
