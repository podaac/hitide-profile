const fetch = require('node-fetch');

async function getDownloadBytes(url, accessToken) {
    const headers = {};
    if(accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`
    }

    return fetch (url, {
        method: "HEAD",
        headers: headers
    }).then(response => {
        const size = Number(response.headers.get("content-length"));
        if (Number.isInteger(size)) {
            return size;
        }
        return 0;
    }).catch(err => {
        console.log(err);
        console.log("\n\nBad Code for HEAD " + url);
        return 0;
    });
}

async function getTotalDownloadBytes(urls, accessToken) {
    let sum = 0;
    for (let i = 0; i < urls.length; i++) {
        sum += await getDownloadBytes(urls[i], accessToken);
    }
    return sum;
}

module.exports = {
    getDownloadBytes,
    getTotalDownloadBytes,
};
