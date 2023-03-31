const util = require("../util/util");
const jwt = require("jsonwebtoken");
const config = require("../config/config-loader.js");
const { EarthdataLoginClient } = require("../client/earthdata-login");

const edlBaseUrl = config.EARTH_DATA_LOGIN_AUTH_CODE_REQUEST_URI.split("/oauth")[0];

const edl = new EarthdataLoginClient({
    baseUrl: edlBaseUrl,
    clientId: config.EARTH_DATA_LOGIN_CLIENT_ID,
    clientPassword: config.EARTH_DATA_LOGIN_PASSWORD,
});

/**
 * Express middleware that automatically refreshes EarthdataLogin tokens
 * for this session if they will expire soon.
 *
 * Does nothing if the user is not logged in.
 *
 * "expire soon" currently means "will expire in 5 days".
 *
 * If an error occurs, the middleware will log the error and pass control
 * to the next middleware. It DOES NOT send an http error response.
 *
 * Explanation: If a user's EDL tokens are expired, they will get errors when
 * making some other requests (such as harmony requests). Therefore, this
 * middleware aims to prevent the tokens from expiring while the user is
 * logged in.
 */
async function refreshTokensIfExpiringSoon(req, res, next) {
    try {
        const refreshToken = util.get(req, "session", "tokenObj", "refresh_token");
        if (!refreshToken) return next();

        const { exp } = jwt.decode(refreshToken);
        const expirationDate = exp * 1000;
        const today = Date.now();
        const fiveDays = 5 * 24 * 60 * 60 * 1000;
        const tokenExpiresSoon = expirationDate - today < fiveDays;

        if (tokenExpiresSoon) {
            req.session.tokenObj = await edl.refreshToken(refreshToken);
        }
    } catch (error) {
        // Only log the error.
        // Even if an error occurs during token refresh, we don't want that to stop the
        // entire request.
        console.error(`refreshTokensIfExpiringSoon() ${req.method} ${req.path}\n`, error);
    }

    next();
}

/**
 * Express middleware that automatically destroys the session if the session's
 * EarthdataLogin tokens are expired.
 *
 * Does nothing if the user is not logged in.
 *
 * Explanation: If a user's EDL tokens are expired, they will get errors when making
 * harmony subset requests. This middleware aims to prevent an inconsistent
 * (and confusing) user experience, by not allowing a user to be logged in if
 * their EDL tokens are expired.
 */
async function expireSessionIfTokensExpired(req, res, next) {
    const refreshToken = util.get(req, "session", "tokenObj", "refresh_token");
    if (!refreshToken) return next();

    const { exp } = jwt.decode(refreshToken);
    const expirationDate = exp * 1000;
    const today = Date.now();
    const tokenIsExpired = expirationDate < today;

    if (tokenIsExpired) {
        console.log("destroying session");
        req.session.destroy(() => next());
    } else {
        next();
    }
}

/**
 * Express middleware that prevents a user from accessing an endpoint if
 * they are not logged in.
 *
 * If the user is logged in, this middleware passes control to the next
 * middleware.
 *
 * If the user is not logged in, this middlware sends a 400 response.
 */
function requireLogin(req, res, next) {
    const uid = util.get(req, "session", "userObj", "uid");
    if (!uid) {
        res.status(400).json({ error: "NOT_LOGGED_IN" });
        return;
    }
    next();
}

/**
 * Express middleware that allows a user to check if they are logged in as the
 * user they think they are logged in as when making normal requests.
 *
 * If the user supplies the "self-check-username" header with their request,
 * this middleware will check to see if their session "uid" matches.
 * - If it matches, it passes control to the next middleware
 * - If it doesn't match, it sends a 400 response.
 *
 * Does nothing if the "self-check-username" header is not provided. In other words
 * this is an optional check.
 *
 * Explanation: The purpose of this check is to help the client detect an inconsistent
 * state.
 *
 * For example, if a calling app is logged in, but the session expires behind the scenes
 * (because the EDL tokens expired), there will be an inconsistent state
 *
 * For example, if a calling app is open in multiple tabs and logs in as different
 * users in each tab, there might be an inconsistent state because both tabs will use
 * the same session cookie.
 */
function selfCheckUsername(req, res, next) {
    const uid = util.get(req, "session", "userObj", "uid");
    const selfCheckUsername = req.header("self-check-username");
    if (selfCheckUsername && uid !== selfCheckUsername) {
        res.status(400).json({ error: "NON_MATCHING_USERNAME" });
        return;
    }
    next();
}

module.exports = {
    requireLogin,
    selfCheckUsername,
    refreshTokensIfExpiringSoon,
    expireSessionIfTokensExpired,
};
