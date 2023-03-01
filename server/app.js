const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const textBodyParser = bodyParser.text();
const jsonBodyParser = bodyParser.json();
const urlEncodedBodyParser = require("body-parser").urlencoded({ extended: true });
const helmet = require("helmet");
const session = require("./util/session.js");

const loginRoute = require("./routes/login.js");
const jobsRoute = require("./routes/jobs.js");
const cmrRoute = require("./routes/cmr");

const config = require("./config/config-loader.js");
const util = require("./util/util.js");
const {middleware: loggerMiddleware} = require('./util/logger');

// eslint-disable-next-line no-unused-vars
function errorHandlerMiddleware(error, req, res, next) {
    const username = util.get(req, "session", "userObj", "uid");

    let errorContext = `${util.utcTimestamp()} - ERROR - ${req.method} ${req.originalUrl} - username:${username}`;

    console.error('\n', errorContext, '\n', error, '\n');
    res.status(500).json({ error: "SERVER_ERROR" });
}

function myCorsMiddleware(req, res, next) {
    const requestOrigin = req.get("Origin");
    if (config.LIST_OF_AUTHORIZED_CORS_REQUESTER_ORIGINS.includes(requestOrigin)) {
        res.set("Access-Control-Allow-Origin", requestOrigin);
        res.set("Access-Control-Allow-Credentials", true);
        const accessControlRequestHeaders = req.get("Access-Control-Request-Headers");
        if (accessControlRequestHeaders) {
            res.set("Access-Control-Allow-Headers", accessControlRequestHeaders);
        }
    }
    next();
}

app.use(loggerMiddleware);
app.use(helmet());
if (config.NUM_PROXY_SERVERS_FOR_API) {
    app.set("trust proxy", true);
}
app.use(session());
app.use(textBodyParser);
app.use(jsonBodyParser);
app.use(urlEncodedBodyParser);
app.use(myCorsMiddleware);

app.use("/hitide/api", loginRoute);
app.use("/hitide/api", jobsRoute);
app.use("/hitide/api", cmrRoute);

app.use(errorHandlerMiddleware);

module.exports = app;
