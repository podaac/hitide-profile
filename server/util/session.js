const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const config = require("../config/config-loader.js");
 
 
const sessionStore = new MySQLStore({
    host: config.DATABASE_HOST,
    port: config.DATABASE_PORT,
    user: config.DATABASE_USERNAME,
    password: config.DATABASE_PASSWORD,
    database: config.DATABASE_NAME
});
 
module.exports = function(){
    return session({
        name: "hitide_session_id",
        secret: config.SESSION_COOKIE_SECRET,
        cookie: {
            httpOnly: config.COOKIE_HTTP_ONLY,
            secure: config.COOKIE_SECURE,
            maxAge: config.COOKIE_MAX_AGE,
            path: config.COOKIE_PATH || "/"
        },
        store: sessionStore,
        resave: false,
        saveUninitialized: false
    });
}