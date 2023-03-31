const app = require("./app");
const config = require("./config/config-loader.js");

async function serve() {
    if (config.SHOULD_SERVE_HTTP) {
        const http = require("http");
        http.createServer(app).listen(config.HTTP_PORT, function () {
            console.log("Listening for http requests on port " + config.HTTP_PORT);
        });
    }

    if (config.SHOULD_SERVE_HTTPS) {
        const https = require("https");

        const key = config.SSL_KEY;
        const cert = config.SSL_CERT;

        https.createServer({ key, cert }, app).listen(config.HTTPS_PORT, function () {
            console.log("Listening for https requests on port " + config.HTTPS_PORT);
        });
    }
}

serve().catch((err) => console.log("\n\n=== Error===\n", err, "\n==============\n\n"));
