const l2ss = require("../client/l2ss");
const {generateCitations} = require('../util/generate-citations');
const { getTotalDownloadBytes } = require("../util/get-download-bytes");
const util = require('../util/util');

async function submitJob(job, uid, timestamp) {
    const token = await l2ss.submitJob(job);
    const submittedJob = { ...job };
    submittedJob.token = token;
    submittedJob.username = uid;
    submittedJob.requestTime = timestamp;
    const jobWithUpdates = await getJobWithUpdates(submittedJob);
    return jobWithUpdates;
}

async function getJobWithUpdates(job) {
    const updatedJob = { ...job };
    const status = await l2ss.getJobStatus(updatedJob.token);
    updateL2ssJob(updatedJob, status);
    if (jobJustFinished(updatedJob)) {
        updatedJob.completeTime = util.utcTimestamp();
        updatedJob.citations = generateCitations(updatedJob);
        updatedJob.totalDownloadBytes = await getTotalDownloadBytes(updatedJob.downloadUrls);
    }
    return updatedJob;
}

module.exports = {
    submitJob,
    getJobWithUpdates,
};

//////////////////////////             Helpers             //////////////////////////////// 

function updateL2ssJob(job, status) {
    job.granulesRequested = status.totalNumGranule;
    job.granulesCompleted = status.granuleCompleted;
    job.granulesFailed = status.errorCount;
    job.downloadUrls = status.resultURLs;
    job.statusString = status.status;
    job.statusCode = statusStringToStatusCode(status.status);
}

function jobJustFinished(job) {
    return jobIsFinished(job) && !job.citations;
}

function statusStringToStatusCode(statusString) {
    switch (statusString) {
        // confirmed status strings from /subset/status endpoint:
        //      - done, partial error, error, processing, compressing, queued
        case "done":
            return -5;
        case "partial error":
            return -4;
        case "error":
            return -3;
        case "compressing":
            return -6;
        case "processing":
            return -2;
        case "submitted":
            return -1;
        default:
            return 0;
    }
}

function jobIsFinished(job) {
    switch (job.statusString) {
        case "done":
        case "error":
        case "partial error":
            return true;
        default:
            return false;
    }
}