const util = require('../util/util');
const harmony = require("../client/harmony");
const {generateCitations} = require('../util/generate-citations');
const { getTotalDownloadBytes } = require("../util/get-download-bytes");

async function submitJob(job, uid, timestamp, accessToken) {
    const submittedJob = {...job};
    const jobStatus = await harmony.subset(submittedJob, accessToken);
    submittedJob.token = jobStatus.jobID;
    submittedJob.username = uid;
    submittedJob.requestTime = timestamp;
    updateHarmonyJob(submittedJob, jobStatus);
    if (jobJustFinished(submittedJob)) {
        submittedJob.completeTime = util.utcTimestamp();
        submittedJob.citations = generateCitations(submittedJob);
        submittedJob.totalDownloadBytes = await getTotalDownloadBytes(submittedJob.downloadUrls, accessToken);
    }
    return submittedJob;
}

async function getJobWithUpdates(job, accessToken) {
    const updatedJob = { ...job };
    const status = await harmony.status(updatedJob.token, accessToken);
    updateHarmonyJob(updatedJob, status);
    if (jobJustFinished(updatedJob)) {
        updatedJob.completeTime = util.utcTimestamp();
        updatedJob.citations = generateCitations(updatedJob);
        updatedJob.totalDownloadBytes = await getTotalDownloadBytes(updatedJob.downloadUrls, accessToken);
    }
    return updatedJob;
}

module.exports = {
    submitJob,
    getJobWithUpdates,
};

//////////////////////////             Helpers             //////////////////////////////// 

function updateHarmonyJob(job, updates) {
    job.statusString = updates.status;
    job.statusCode = 0;
    const granulesRequested = updates.numInputGranules || 0;
    job.granulesRequested = granulesRequested;
    const progress = updates.progress || 0;
    job.granulesCompleted = Math.floor((progress / 100.0) * granulesRequested);
    job.granulesFailed = 0;
    if (updates.status === "successful") {
        if (!job.downloadUrls) {
            job.downloadUrls = [];
            updates.links.forEach((link) => {
                if (link.rel === "data") job.downloadUrls.push(link.href);
            });
        }
    }
}

function jobJustFinished(job) {
    return jobIsFinished(job) && !job.citations;
}

function jobIsFinished(job) {
    switch (job.statusString) {
        case "successful":
        case "failure":
            return true;
        default:
            return false;
    }
}
