const fetch =  require('node-fetch');

const clientId = process.env.CLIENT_ID;
const redirectUri = process.env.REDIRECT_URI;
const username = process.env.USERNAME;
const email = process.env.USERNAME;
const password = process.env.PASSWORD;
const ursHost = process.env.URS_HOST;
const hitideProfileHost = process.env.HITIDE_PROFILE_HOST;

const EDL_AUTH_ENDPOINT = '/oauth/authorize'
const HITIDE_PROFILE_LOGIN_ENDPOINT = '/hitide/api/session/login'
const HITIDE_PROFILE_LOGOUT_ENDPOINT = '/hitide/api/session/logout'
const HITIDE_PROFILE_USER_ENDPOINT = '/hitide/api/session/user'
const HITIDE_PROFILE_JOB_SUBMIT_ENDPOINT = '/hitide/api/jobs/submit'
const HITIDE_PROFILE_JOB_STATUS_ENDPOINT = '/hitide/api/jobs/status'
const HITIDE_PROFILE_JOB_HISTORY_ENDPOINT = '/hitide/api/jobs/history'
const HITIDE_PROFILE_JOB_DISABLE_ENDPOINT = '/hitide/api/jobs/disable'

/**
 * Execute an asynchronous request and return a promise
 *
 * @param {String}          method GET, POST, etc
 * @param {String}          url The HTTP url
 * @param {String}          cookies string
 * @param {JSON}            body Body to send in the POST request (optional)
 * @param {JSON}            headers Headers to send with the request (optional)
 * @param {JSON}            qs Query string to send with the request (optional)
 * @returns {Promise}       Promise to be awaited
 */
function asyncRequest(method, url, cookies, body = null, headers = {}, qs = null) {

    headers['cookie'] = cookies;
    let json_body = body
    if(body){
        headers['Content-Type'] = 'application/json';
        json_body = JSON.stringify(body);
    }
    if(qs){
        url = url + "?" + new URLSearchParams(qs);
    }

    return fetch (url , {
        method: method,
        headers: headers,
        body: json_body
    }).then(response => {
        return [response, response.json()];
    }).catch(error =>{
        console.log(error);
    });
}

/**
 * Query EDL to retrieve auth code.
 *
 * @param   {String}            ursHost Base URS hostname
 * @param   {String}            clientId HiTIDE client ID
 * @param   {String}            redirectUri HiTIDE redirect URI
 * @param   {String}            username EDL username
 * @param   {String}            password EDL password
 * @returns {Promise<String>}   Promise containing EDL auth code
 */
function getEdlAuthCode(ursHost, clientId, redirectUri, username, password) {
    let authString = `${username}:${password}`;
    authString = Buffer.from(authString, 'binary').toString('base64');

    // Construct full url with query params
    let authReq = new URL(EDL_AUTH_ENDPOINT, ursHost).href;
    authReq = `${authReq}?redirect_uri=${redirectUri}&client_id=${clientId}&response_type=code`;

    return fetch (authReq , {
        method: "GET",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'Basic ' + authString
        },
        redirect: "manual"
    }).then(response => {
        let location = response.headers.get('location');
        let code = location.substr(location.indexOf('code')).split('=')[1];
        return code;
    }).catch(error =>{
        console.log(error);
    });
}

/**
 * Login to HiTIDE Profile.
 *
 * @param {String}      hitideProfileHost HiTIDE Profile base name
 * @param {String}      edlAuthCode EDL Auth code retrieved from EDL oauth step
 * @param {String}      redirectUri Redirect URI registered to HiTIDE application
 * @returns {Promise}   Promise containing response and body from HiTIDE Profile login endpoint
 */
function hitideProfileLogin(hitideProfileHost, edlAuthCode, redirectUri) {
    let hitideProfileLoginReq = new URL(HITIDE_PROFILE_LOGIN_ENDPOINT, hitideProfileHost).href;

    return fetch (hitideProfileLoginReq , {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            code: edlAuthCode,
            redirect_uri: redirectUri
        }),
    }).then(response => {
        return [response, response.json()];
    }).catch(error =>{
        console.log(error);
    });
}

/**
 *
 * @param {String}      hitideProfileHost HiTIDE Profile base name
 * @param {String}      username User that is logging out
 * @param {String}      cookies string
 * @returns {Promise}   Promise containing response and body from HiTIDE Profile logout endpoint
 */
function hitideProfileLogout(hitideProfileHost, username, cookies) {
    let hitideProfileLogoutReq = new URL(HITIDE_PROFILE_LOGOUT_ENDPOINT, hitideProfileHost).href;

    return fetch (hitideProfileLogoutReq , {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'cookie': cookies
        },
    }).then(response => {
        return [response, response.json()];
    }).catch(error =>{
        console.log(error);
    });
}

/**
 *
 * @returns {Promise}   Promise containing login cookie
 */
async function get_cookies(){

    let loginResponse, loginBody, loginBodyPromise, cookies;
    let edlAuthCode = await getEdlAuthCode(ursHost, clientId, redirectUri, username, password);
    
    [loginResponse, loginBodyPromise] = await hitideProfileLogin(hitideProfileHost, edlAuthCode, redirectUri);

    let raw_cookie = loginResponse.headers.raw()['set-cookie'];
    if(Array.isArray(raw_cookie)){
        cookies = raw_cookie.join(';');
    }
    else{
        cookies = raw_cookie;
    }
    return cookies;

}

describe('HiTIDE Profile Login Integration Tests', () => {
    it('The login endpoint should populate session cookies', async () => {

        let loginResponse, loginBody, loginBodyPromise;
        let edlAuthCode = await getEdlAuthCode(ursHost, clientId, redirectUri, username, password);
        
        [loginResponse, loginBodyPromise] = await hitideProfileLogin(hitideProfileHost, edlAuthCode, redirectUri);
        loginBody = await loginBodyPromise;

        let raw_cookie = loginResponse.headers.raw()['set-cookie'];

        expect(loginResponse.errorCode).toBeUndefined();
        expect(loginResponse.status).toBe(200);
        expect(loginBody.loggedIn).toBeTruthy();
        expect(raw_cookie).toBeInstanceOf(Array);
    });
    
    it('The logout endpoint should log out the user and return an OK status code', async () => {

        let cookies = await get_cookies();

        let logoutResponse, logoutBodyPromise;
        [logoutResponse, logoutBodyPromise] = await hitideProfileLogout(hitideProfileHost, username, cookies);

        let logoutBody = await logoutBodyPromise;

        expect(logoutResponse.errorCode).toBeUndefined();
        expect(logoutResponse.status).toBe(200);
        expect(logoutBody.loggedIn).toBeFalsy();
        expect(logoutBody.username).toBe('');
    });

    it('The user endpoint should return currently logged in user information in the body', async () => {
        let userUrl = new URL(HITIDE_PROFILE_USER_ENDPOINT, hitideProfileHost).href;

        let cookies = await get_cookies();

        let userResponse, userBodyPromise, userBody;
        [userResponse, userBodyPromise] = await asyncRequest('GET', userUrl, cookies);

        userBody = await userBodyPromise;

        expect(userResponse.errorCode).toBeUndefined();
        expect(userResponse.status).toBe(200);
        expect(userBody.loggedIn).toBeTruthy();
        expect(userBody.username).toBe(username);
    });
});

describe('HiTIDE Profile Job Integration Tests', () => {
    it('Submit job and get status', async () => {
        let submitUrl = new URL(HITIDE_PROFILE_JOB_SUBMIT_ENDPOINT, hitideProfileHost).href;

        // For now, this is an on-prem request. Once the cloud requests are connected
        // with HiTIDE profile this should be switched over to a POCLOUD dataset.
        let jobSubmitBody = {
            "email": email,
            "subjobs": [
                {
                    "datasetId": "PODAAC-ASOP2-COB01",
                    "granuleIds": [
                        "ascat_20211001_190900_metopb_46899_eps_o_coa_3202_ovw.l2.nc",
                        "ascat_20211001_172700_metopb_46898_eps_o_coa_3202_ovw.l2.nc"
                    ],
                    "bbox": "-180,-90,180,90",
                    "searchStartDate": "2021/10/01",
                    "searchEndDate": "2021/10/01",
                    "variables": [
                        "wvc_index",
                        "model_speed",
                        "model_dir",
                        "ice_prob",
                        "ice_age",
                        "wvc_quality_flag",
                        "wind_speed",
                        "wind_dir",
                        "bs_distance",
                        "lat",
                        "lon",
                        "time"
                    ],
                    "compact": true,
                    "merge": true,
                    "datasetShortName": "ASCATB-L2-Coastal",
                    "numMatching": 2
                }
            ]
        }

        let submitResponse, submitBody, submitBodyPromise;

        let cookies = await get_cookies();

        [submitResponse, submitBodyPromise] = await asyncRequest('POST', submitUrl, cookies, jobSubmitBody);
        submitBody = await submitBodyPromise;
        
        let jobId = submitBody.token;

        expect(submitResponse.errorCode).toBeUndefined();
        expect(submitResponse.status).toBe(200);
        expect(submitBody.email).toBe(email);
        expect(submitBody.username).toBe(username);
        expect(submitBody.granulesRequested).toBe(jobSubmitBody.subjobs[0].granuleIds.length);
        expect(submitBody.subjobs.length).toBe(jobSubmitBody.subjobs.length);
        expect(submitBody.subjobs[0].datasetId).toBe(jobSubmitBody.subjobs[0].datasetId);
        expect(submitBody.subjobs[0].granuleIds.length).toBe(jobSubmitBody.subjobs[0].granuleIds.length);

        // Check the status of the job
        let statusUrl = new URL(HITIDE_PROFILE_JOB_STATUS_ENDPOINT, hitideProfileHost).href;
        let qs = {
            token: jobId
        };
        let statusResponse, statusBody, statusBodyPromise;
        [statusResponse, statusBodyPromise] = await asyncRequest('GET', statusUrl, cookies, null, {}, qs);

        statusBody = await statusBodyPromise;

        expect(statusResponse.errorCode).toBeUndefined();
        expect(statusResponse.status).toBe(200);
        expect(statusBody.email).toBe(email);
        expect(statusBody.username).toBe(username);
    });

    it('Get job history and disable job', async () => {
        let historyUrl = new URL(HITIDE_PROFILE_JOB_HISTORY_ENDPOINT, hitideProfileHost).href;

        let cookies = await get_cookies();

        let historyResponse, historyBody, historyBodyPromise;
        [historyResponse, historyBodyPromise] = await asyncRequest('GET', historyUrl, cookies);
        historyBody = await historyBodyPromise;
        expect(historyResponse.errorCode).toBeUndefined();
        expect(historyResponse.status).toBe(200);
        expect(historyBody).toBeInstanceOf(Array);

        let jobId = historyBody[0].token;

        // Disable a job
        let disableUrl = new URL(HITIDE_PROFILE_JOB_DISABLE_ENDPOINT, hitideProfileHost).href;
        let jobDisableBody = {
            token: jobId
        }
        let disableResponse, disableBody, disableBodyPromise;
        [disableResponse, disableBodyPromise] = await asyncRequest('POST', disableUrl, cookies, jobDisableBody);

        disableBody = await disableBodyPromise;

        expect(disableResponse.errorCode).toBeUndefined();
        expect(disableResponse.status).toBe(200);
        expect(disableBody.success).toBeTruthy();

        // Retrieve history again -- confirm the history does not contain the previously disabled job
        [historyResponse, historyBodyPromise] = await asyncRequest('GET', historyUrl, cookies);

        historyBody = await historyBodyPromise;
        expect(historyResponse.errorCode).toBeUndefined();
        expect(historyResponse.status).toBe(200);
        historyBody.forEach(historyElement => {
            expect(historyElement.token).not.toBe(jobId);
        });
    });
});
