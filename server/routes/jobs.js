const express = require("express");
const util = require("../util/util.js");
const history = require("../util/history-db.js");
const harmonyController = require("./harmony-job-service");
const {
    requireLogin,
    selfCheckUsername,
    refreshTokensIfExpiringSoon,
    expireSessionIfTokensExpired,
} = require("./middlewares");

const route = express.Router();

route.post(
    "/jobs/submit",
    expireSessionIfTokensExpired,
    refreshTokensIfExpiringSoon,
    requireLogin,
    selfCheckUsername,
    async function (req, res, next) {
        try {
            const uid = util.get(req, "session", "userObj", "uid");
            const accessToken = util.get(req, "session", "tokenObj", "access_token");
            const timestamp = util.utcTimestamp();
            const job = req.body;
            const submittedJob = await harmonyController.submitJob(job, uid, timestamp, accessToken);

            await history.addJob(submittedJob);
            res.json(submittedJob);
        } catch (error) {
            next(error);
        }
    }
);

route.get(
    "/jobs/status",
    expireSessionIfTokensExpired,
    refreshTokensIfExpiringSoon,
    requireLogin,
    selfCheckUsername,
    async function (req, res, next) {
        try {
            const token = req.query.token;
            if (!token) {
                res.status(400).json({ error: "INVALID_INPUT" });
                return;
            }

            const accessToken = util.get(req, "session", "tokenObj", "access_token");
            const job = await history.getJobByToken(token);

            const updatedJob = await harmonyController.getJobWithUpdates(job, accessToken);
            await history.updateJob(updatedJob);
            res.json(updatedJob);
        } catch (error) {
            next(error);
        }
    }
);

route.get(
    "/jobs/history",
    expireSessionIfTokensExpired,
    refreshTokensIfExpiringSoon,
    requireLogin,
    selfCheckUsername,
    async function (req, res, next) {
        try {
            const uid = util.get(req, "session", "userObj", "uid");

            const myHistory = await history.getJobsByUsername(uid);
            res.json(myHistory);
        } catch (error) {
            next(error);
        }
    }
);

route.post(
    "/jobs/disable",
    expireSessionIfTokensExpired,
    refreshTokensIfExpiringSoon,
    requireLogin,
    selfCheckUsername,
    async function (req, res, next) {
        try {
            const uid = util.get(req, "session", "userObj", "uid");

            const token = req.body.token;
            if (!token) {
                res.status(400).json({ error: "INVALID_INPUT" });
                return;
            }

            const numChanged = await history.disableJob(uid, token);

            if (numChanged !== 1) {
                res.status(400).json({ error: "COULD_NOT_DISABLE" });
                return;
            } else {
                res.json({ success: true });
            }
        } catch (error) {
            next(error);
        }
    }
);

module.exports = route;