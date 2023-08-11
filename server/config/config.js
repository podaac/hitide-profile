module.exports = {
    // Database information
    DATABASE_HOST: "",
    DATABASE_PORT: "3306",
    DATABASE_NAME: "hitide_profile",

    DATABASE_USERNAME: "",
    DATABASE_PASSWORD: "",

    // Whether API should be served by unencrypted http and on which port
    SHOULD_SERVE_HTTP: true,
    HTTP_PORT: 8080,

    // Whether API should be served by encrypted https and on which port
    SHOULD_SERVE_HTTPS: false,
    HTTPS_PORT: 8443,

    // Cookie Related Settings
    COOKIE_PATH: "/hitide",
    COOKIE_SECURE: true,
    COOKIE_HTTP_ONLY: true,
    COOKIE_MAX_AGE: 2 * 7 * 24 * 60 * 60 * 1000,
    NUM_PROXY_SERVERS_FOR_API: 0,

    SESSION_COOKIE_SECRET: "random-string-lsfjosdfnodsnf",

    // The urls for Earth Data Login services
    EARTH_DATA_LOGIN_AUTH_CODE_REQUEST_URI: "https://urs.earthdata.nasa.gov/oauth/authorize",
    EARTH_DATA_LOGIN_TOKEN_REQUEST_URI: "https://urs.earthdata.nasa.gov/oauth/token",
    EARTH_DATA_LOGIN_TOKEN_REFRESH_URI: "https://urs.earthdata.nasa.gov/oauth/token",
    EARTH_DATA_LOGIN_USER_INFO_URI: "https://urs.earthdata.nasa.gov",

    EARTH_DATA_LOGIN_CLIENT_ID: "",
    EARTH_DATA_LOGIN_PASSWORD: "",

    HARMONY_BASE_URL: 'https://harmony.earthdata.nasa.gov',

    // The origin (protocol://host:port) for any apps that should be able to access this API by CORS
    LIST_OF_AUTHORIZED_CORS_REQUESTER_ORIGINS: [],
};
