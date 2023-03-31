/* global process __dirname */

const { extractConfig } = require("./extracter");

const path = require("path");
const configDirectory = path.resolve(__dirname + "/../../../config");

const defaultConfig = extractConfig(fileToObject("./default-config.js"));
const externalConfig = extractConfig(fileToObject(configDirectory + "/config.js"));
const externalPrivateConfig = extractConfig(fileToObject(configDirectory + "/private-config.js"));
const certificateConfig = extractSslConfig(
    configDirectory + "/server.key",
    configDirectory + "/server.crt"
);
const envConfig = extractConfig(process.env);

const config = {
    ...defaultConfig,
    ...externalConfig,
    ...externalPrivateConfig,
    ...certificateConfig,
    ...envConfig,
};

module.exports = config;

////////////////////////////////////////////////////////////////////////////////////////
//
//      Helper Functions
//
////////////////////////////////////////////////////////////////////////////////////////
function fileToObject(filename) {
    try {
        return require(filename);
    } catch (e) {
        console.log(`Config-Status: did not find config file: ${filename}`);
        return {};
    }
}

function extractSslConfig(keyLocation, certLocation) {
    console.log('locations: ', keyLocation, certLocation);
    const fs = require("fs");

    let config = {};

    try {
        const key = fs.readFileSync(keyLocation, "utf8");
        config['SSL_KEY'] = key;
    } catch (error) {
        /* Left blank on purpose */
    }

    try {
        const cert = fs.readFileSync(certLocation, "utf8");
        config['SSL_CERT'] = cert;
    } catch (error) {
        /* Left blank on purpose */
    }

    return config;
}
