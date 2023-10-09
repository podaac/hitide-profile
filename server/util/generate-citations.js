const util = require("../util/util.js");

function generateCitations(job) {
    const citations = [];
    for (let i = 0; i < job.subjobs.length; i++) {
        citations.push(generateCitation(job, i));
    }
    return citations;
}

module.exports = {
    generateCitations
};

//////////////////////////             Helpers             //////////////////////////////// 

const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

function generateCitation(job, subjobIndex) {
    const subjob = job.subjobs[subjobIndex];
    const jobDate = new Date(job.requestTime);
    let bbox = subjob.bbox.split(",");

    let year = jobDate.getUTCFullYear(),
        monthName = monthNames[jobDate.getUTCMonth()],
        date = jobDate.getUTCDate(),
        datasetId = subjob.datasetId,
        westLon = bbox[0],
        southLat = bbox[1],
        eastLon = bbox[2],
        northLat = bbox[3],
        searchStartDate = subjob.searchStartDate,
        searchEndDate = subjob.searchEndDate;

    let str = `PO.DAAC 2019. High-Level Tool for Interactive Data Extraction (HiTIDE V ${
        util.getHitideVersion().string
    }). `;
    str += `PO.DAAC, Jet Propulsion Laboratory, Pasadena, California, USA. https://hitide.podaac.earthdatacloud.nasa.gov/. `;
    str += `Accessed ${monthName} ${date}, ${year}. Subset obtained for ${datasetId} product `;
    str += `for region: ${westLon}, ${southLat}, ${eastLon}, ${northLat} time period: ${searchStartDate} to ${searchEndDate}.`;

    return str;
}
