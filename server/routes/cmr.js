const express = require('express');
const config = require("../config/config-loader");
const https = require('https');
const { logger } = require('../util/logger');
const util = require("../util/util.js");

const router = express.Router();
const {cmrBaseUrl, graphqlUrl} = getUrls(config);
const allowedHeadersToCmr = {"cmr-search-after": true, "content-type": true, "accept-encoding": true};
const allowedHeadersFromCmr = {"cmr-search-after": true, "content-type": true, "transfer-encoding": true, "content-encoding": true};

/**
 * Route that acts as a proxy to CMR
 * 
 * Purpose: The purpose of this route is to allow adding a user's EDL access_token to their CMR requests,
 *   so they can see all collections, granules, etc that their credentials allow.
 * 
 * Requests to /hitide/api/cmr/... are proxied to e.g. https://cmr[.env].earthdata.nasa.gov/...
 * Requests to /hitide/api/cmr/graphql are proxied to e.g. https://graphql[.env].earthdata.nasa.gov/api
 * 
 * Handling of http headers:
 * - If the user is logged in, this route adds their EDL access_token to the Authorization header of the CMR request.
 * - Headers sent to this endpoint are filtered before forwarding to CMR - to prevent sending
 *   sensitive info - like the hitide session cookie.
 * - Headers coming back from CMR are filtered before returning to client to prevent issues such as 
 *   CORS header conflicts
 */
router.all(/cmr/, async (req, res, next) => {
  let url = "";
  if(req.url.includes("graphql"))
    url = graphqlUrl;
  else {
    const urlEnding = req.url.split("cmr")[1];
    url = cmrBaseUrl + urlEnding;
  }

  const headers = filterHeaders(req.headers, allowedHeadersToCmr);
  const token = util.get(req, 'session', 'tokenObj', 'access_token');
  if(token) headers["Authorization"] = `Bearer ${token}`;

  logRequest(req.method, url, headers, req.body);

  const cmrRequest = https.request( url, {
      method: req.method,
      headers,
  });
  if(req.body) cmrRequest.write(JSON.stringify(req.body));

  cmrRequest.on('response', (response) => {
    logger.debug(response);
    res.status(response.statusCode);
    const returnHeaders = filterHeaders(response.headers, allowedHeadersFromCmr);
    res.set(returnHeaders);
    response.pipe(res);
  });

  cmrRequest.on("close", () => {
    console.log('request close');
  })
  cmrRequest.on("error", function (error) {
    console.log("got an error");
    next(error);
  });
  cmrRequest.end();
});

///////////////////////////////////////////////////////////////////////
//                                                                   //
//                        Helper Functions                           //
//                                                                   //
///////////////////////////////////////////////////////////////////////
function getUrls(config) {
  const harmonyUrl = config.HARMONY_BASE_URL;
  const environmentString = harmonyUrl.includes('sit') ? ".sit" :
                      harmonyUrl.includes('uat') ? ".uat" :
                      "";
  const cmrBaseUrl = `https://cmr${environmentString}.earthdata.nasa.gov`;
  const graphqlUrl = `https://graphql${environmentString}.earthdata.nasa.gov/api`;

  return {cmrBaseUrl, graphqlUrl};
}

function filterHeaders(inputHeaders, allowedHeaders) {
  const outputHeaders = {};
  Object.entries(inputHeaders).forEach(([key, value]) => {
    if(allowedHeaders[key.toLowerCase()])
      outputHeaders[key] = value;
  });
  return outputHeaders;
}

function logRequest(method, url, headers, body) {
  const printedHeaders = {...headers};
  if(printedHeaders.Authorization)
    printedHeaders.Authorization = "******"

  const message = {
    message: "outgoing cmr request",
    method,
    url,
    headers: printedHeaders,
    body
  };

  logger.debug(message);
}


module.exports = router;