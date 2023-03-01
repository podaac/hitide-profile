const fetch = require('node-fetch');
const config = require("../config/config-loader.js");

async function submitJob(job) {

    const query = {
        email: job.email,
        query: job.subjobs,
    };

    const params = new URLSearchParams({'query': JSON.stringify(query)});

    return fetch (config.L2SS_SUBSET_SUBMIT_REQUEST_URI, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    }).then(response => {
        if (response.status !== 200) {
            const e = new Error(`${response.status}  ${response.statusText}`);
            e.tag = "STATUS_CODE_ERROR";
            return e;
        }
        return response.text();
    }).then(data => {
        let obj = data;
        while (typeof obj === "string") {
            obj = JSON.parse(obj);
        }
        const token = obj.token;
        if (typeof token !== "string") {
            const e = new Error(
                "token not in response from subsetter service - response body: " +
                    JSON.stringify(data)
            );
            e.tag = "NO_TOKEN_ERROR";
            return e;
        }
        // handle success
        return token;
    }).catch(err => {
        const e = new Error(err);
        e.tag = "REQUEST_ERROR";
        return e;
    });
}

async function getJobStatus(token) {

    return fetch (config.L2SS_SUBSET_STATUS_REQUEST_URI + "?token=" + token,).then(response => {
        if (response.status !== 200) {
            const e = new Error(`${response.status}  ${response.statusText}`);
            e.tag = "STATUS_CODE_ERROR";
            return e;
        }
        return response.text();
    }).then(data => {
        // parse
        let update = {};
        try {
            update = JSON.parse(data);
        } catch (e) {
            const error = new Error(`getJobStatus(token) response parse Error`);
            error.tag = "PARSE_ERROR";
            return error;
        }
        if (typeof update.status !== "string") {
            const e = new Error("status not in response");
            e.tag = "NO_STATUS_ERROR";
            return e;
        }
        // handle success
        return update;
    }).catch(err => {
        const e = new Error(err);
        e.tag = "REQUEST_ERROR";
        return e;
    });
}

module.exports = { submitJob, getJobStatus };
