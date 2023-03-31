/**
 * This module provides routes for logging in using the earthdata OAUTH2 login system.
 *
 * Important notes:
 *  - This module depends on sessions already being set up.
 *  - This module depends on correct config data already being set up.
 */

// TODO: Use proper http status codes for errors

const express = require("express");
const config = require("../config/config-loader.js");
const route = express.Router();
const util = require("../util/util.js");
const { EarthdataLoginClient } = require("../client/earthdata-login");
const {
    requireLogin,
    selfCheckUsername,
    refreshTokensIfExpiringSoon,
    expireSessionIfTokensExpired,
} = require("./middlewares");

const edlBaseUrl = config.EARTH_DATA_LOGIN_AUTH_CODE_REQUEST_URI.split("/oauth")[0];

const edl = new EarthdataLoginClient({
    baseUrl: edlBaseUrl,
    clientId: config.EARTH_DATA_LOGIN_CLIENT_ID,
    clientPassword: config.EARTH_DATA_LOGIN_PASSWORD,
});

route.get("/session/authorize", function (req, res) {
    const redirectUri = req.query["redirect_uri"];
    let url = edl.getAuthorizationUrl(redirectUri);
    res.redirect(url);
});

route.post("/session/authorize", async function (req, res) {
    const redirectUri = req.query["redirect_uri"];
    const { user_id, user_password } = req.body;
    let { auth_code: code } = await edl.getAuthCode(user_id, user_password, redirectUri);
    res.json({ code });
});

route.post("/session/login", async function (req, res, next) {
    try {
        const authCode = req.body.code;
        const redirectUri = req.body.redirect_uri;

        const tokenObj = await edl.getToken(authCode, redirectUri);
        const { access_token, endpoint } = tokenObj;

        const userObj = await edl.getUserInfo(access_token, endpoint);

        req.session.tokenObj = tokenObj;
        req.session.userObj = userObj;

        res.json({ loggedIn: true, username: userObj.uid, email: userObj.email_address });
    } catch (error) {
        next(error);
    }
});

route.get(
    "/session/user",
    expireSessionIfTokensExpired,
    refreshTokensIfExpiringSoon,
    function (req, res, next) {
        try {
            const username = util.get(req, "session", "userObj", "uid");
            const email = util.get(req, "session", "userObj", "email_address");

            if (username) res.json({ loggedIn: true, username: username, email: email });
            else res.json({ loggedIn: false, username: "", email: "" });
        } catch (error) {
            next(error);
        }
    }
);

route.post("/session/logout", requireLogin, selfCheckUsername, function (req, res, next) {
    try {
        req.session.destroy();
        res.json({ loggedIn: false, username: "", email: "" });
    } catch (error) {
        next(error);
    }
});

module.exports = route;
