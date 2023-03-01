const { Buffer } = require("buffer");
const fetch = require("node-fetch");

module.exports.EarthdataLoginClient = class EarthdataLoginClient {
    constructor({ baseUrl, clientId, clientPassword }) {
        this.baseUrl = baseUrl;
        this.clientId = clientId;
        this.clientPassword = clientPassword;
    }

    getAuthorizationUrl(redirectUri) {
        let url = `${this.baseUrl}/oauth/authorize?response_type=code`;
        url += `&client_id=${this.clientId}`;
        url += `&redirect_uri=${redirectUri}`;
        return url;
    }

    async getAuthCode(userId, userPassword, redirectUri) {
        const userCredentials = _base64Encode(`${userId}:${userPassword}`);
        let url = this.getAuthorizationUrl(redirectUri);

        const response = await fetch(url, {
            headers: {
                Authorization: `Basic ${userCredentials}`,
            },
            redirect: "manual",
        });

        const auth_code = _extractAuthCode(response.headers.get("location"));
        return { auth_code };
    }

    async getToken(authCode, redirectUri) {
        const appCredentials = _base64Encode(`${this.clientId}:${this.clientPassword}`);
        const url = `${this.baseUrl}/oauth/token`;
        const requestBody = `code=${authCode}&redirect_uri=${redirectUri}&grant_type=authorization_code`;

        const response = await fetch(url, {
            method: "post",
            headers: {
                Authorization: `Basic ${appCredentials}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: requestBody,
        }).then((res) => res.json());

        return response;
    }

    async getUserInfo(accessToken, endpoint) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }).then((res) => res.json());
        return response;
    }

    async refreshToken(refreshToken) {
        const appCredentials = _base64Encode(`${this.clientId}:${this.clientPassword}`);
        const requestBody = `refresh_token=${refreshToken}&grant_type=refresh_token`;
        const response = await fetch(`${this.baseUrl}/oauth/token`, {
            method: "post",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${appCredentials}`,
            },
            body: requestBody,
        }).then((res) => res.json());

        return response;
    }
};

function _base64Encode(input) {
    return Buffer.from(input, "utf-8").toString("base64");
}

function _extractAuthCode(url) {
    return url.split("?")[1].split("=")[1];
}
