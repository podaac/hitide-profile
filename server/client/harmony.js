const fetch = require("node-fetch");
const config = require("../config/config-loader");
const { logger } = require('../util/logger');

const baseUrl = config.HARMONY_BASE_URL;

async function subset(job, accessToken) {
    const {
        datasetId,
        bbox,
        granuleIds = [],
        variables,
        merge
    } = job.subjobs[0];
    const [west, south, east, north] = bbox.split(",");

    let variablesString = variables || "all";
    if (Array.isArray(variables)) variablesString = variables.join(",");
    variablesString = encodeURIComponent(variablesString);
    
    let url = `${baseUrl}/${datasetId}/ogc-api-coverages/1.0.0/collections/${variablesString}/coverage/rangeset`;
    url += `?forceAsync=true&maxResults=1000000`;
    url += `&skipPreview=true`;
    url += `&subset=lat(${south}:${north})`;
    url += `&subset=lon(${west}:${east})`;

    logger.debug({message: 'harmony subset request url', url});

    // add granule names
    // const formData = new FormData();

    const formData = new URLSearchParams();

    granuleIds.forEach((granuleId) => {
        // formData.append("granuleId", granuleId);
        formData.append('granuleId', granuleId);
    });
    if(merge) url += `&concatenate=true`;

    console.log('harmony subset request: ', url);

    let response, text;
    try {
        response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: formData
        });
        // log harmony request
        const message = {
            message: "harmony subset request url",
            url,
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: formData
          };
        logger.debug(message);

        text = await response.text();
    } catch (error) {
        throw new Error("Harmony.subset() - Error fetching -> " + error.message);
    }

    let json;
    try {
        json = JSON.parse(text);
    } catch (error) {
        throw new Error("Harmony.subset() - Error parsing json from response -> " + text);
    }

    if (!json.jobID) {
        throw new Error(
            "Harmony.subset() - harmony did not return jobId. Harmony response -> " +
                JSON.stringify(json)
        );
    }

    return json;
}

async function status(jobID, accessToken) {
    const url = `${baseUrl}/jobs/${jobID}`;
    let response, text;
    try {
        response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        text = await response.text();
    } catch (error) {
        throw new Error("Harmony.status() - Error fetching -> " + error.message);
    }

    let json;
    try {
        json = JSON.parse(text);
    } catch (error) {
        throw new Error("Harmony.status() - Error parsing json from response -> " + text);
    }

    return json;
}

module.exports = {
    subset,
    status,
};

///////////////////////////////////        Helpers         ////////////////////////////////////////////
function startOfDay(dateString) {
    // dateString comes in as "year/month/day"
    const date = dateString
        .split("/")
        .map((str) => (str.length === 1 ? "0" + str : str))
        .join("-");
    return `${date}T00:00:00.000Z`;
}

function endOfDay(dateString) {
    // dateString comes in as "year/month/day"
    const date = dateString
        .split("/")
        .map((str) => (str.length === 1 ? "0" + str : str))
        .join("-");
    return `${date}T23:59:59.999Z`;
}
