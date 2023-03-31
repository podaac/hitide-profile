const { extractConfig, copyString, copyNumber, copyBoolean, copyList } = require("../extracter");

describe("copyString(...)", () => {
    it("copies a string from one object to another", () => {
        const src = { a: "the string" };
        const dest = {};

        copyString(dest, src, "a");

        expect(dest.a).toBe("the string");
    });

    it("will copy with a different property name (if provided)", () => {
        const src = { a: "the string" };
        const dest = {};

        copyString(dest, src, "a", "new name");

        expect(dest["new name"]).toBe("the string");
        expect(dest).not.toHaveProperty("a");
    });

    it("will not copy a non-string", () => {
        const src = { a: 5, b: null, c: {}, d: true };
        const dest = {};

        copyString(dest, src, "a");
        copyString(dest, src, "b");
        copyString(dest, src, "c");
        copyString(dest, src, "d");

        expect(dest).not.toHaveProperty("a");
        expect(dest).not.toHaveProperty("b");
        expect(dest).not.toHaveProperty("c");
        expect(dest).not.toHaveProperty("d");
    });
});

describe("copyBoolean(...)", () => {
    it("copies a boolean from one object to another", () => {
        const src = { a: true, b: false };
        const dest = {};

        copyBoolean(dest, src, "a");
        copyBoolean(dest, src, "b");

        expect(dest.a).toBe(true);
        expect(dest.b).toBe(false);
    });

    it("will copy with a different property name (if provided)", () => {
        const src = { a: true };
        const dest = {};

        copyBoolean(dest, src, "a", "new name");

        expect(dest["new name"]).toBe(true);
        expect(dest).not.toHaveProperty("a");
    });

    it("will copy true/false strings as booleans", () => {
        const src = { a: "true", b: "false", c: " TrUe", d: "  falsE" };
        const dest = {};

        copyBoolean(dest, src, "a");
        copyBoolean(dest, src, "b");
        copyBoolean(dest, src, "c");
        copyBoolean(dest, src, "d");

        expect(dest.a).toBe(true);
        expect(dest.b).toBe(false);
        expect(dest.c).toBe(true);
        expect(dest.d).toBe(false);
    });

    it("will not copy values that are not booleans or boolean strings", () => {
        const src = { a: 5, b: "chocolate", c: {}, d: null, e: [] };
        const dest = {};

        copyBoolean(dest, src, "a");
        copyBoolean(dest, src, "b");
        copyBoolean(dest, src, "c");
        copyBoolean(dest, src, "d");
        copyBoolean(dest, src, "e");

        expect(dest).not.toHaveProperty("a");
        expect(dest).not.toHaveProperty("b");
        expect(dest).not.toHaveProperty("c");
        expect(dest).not.toHaveProperty("d");
        expect(dest).not.toHaveProperty("e");
    });
});

describe("copyNumber(...)", () => {
    it("copies a number from one object to another", () => {
        const src = { a: 5, b: -10.555 };
        const dest = {};

        copyNumber(dest, src, "a");
        copyNumber(dest, src, "b");

        expect(dest.a).toBe(5);
        expect(dest.b).toBe(-10.555);
    });

    it("will copy with a different property name (if provided)", () => {
        const src = { a: 5 };
        const dest = {};

        copyNumber(dest, src, "a", "new name");

        expect(dest["new name"]).toBe(5);
        expect(dest).not.toHaveProperty("a");
    });

    it("will copy number-strings as numbers", () => {
        const src = { a: "5", b: "-10.555", c: "  1.2  " };
        const dest = {};

        copyNumber(dest, src, "a");
        copyNumber(dest, src, "b");
        copyNumber(dest, src, "c");

        expect(dest.a).toBe(5);
        expect(dest.b).toBe(-10.555);
        expect(dest.c).toBe(1.2);
    });

    it("will not copy values that are not numbers or number-strings", () => {
        const src = { a: null, b: {}, c: "five", d: "1 aaa", e: "aaa 1" };
        const dest = {};

        copyNumber(dest, src, "a");
        copyNumber(dest, src, "b");
        copyNumber(dest, src, "c");
        copyNumber(dest, src, "d");
        copyNumber(dest, src, "e");

        expect(dest).not.toHaveProperty("a");
        expect(dest).not.toHaveProperty("b");
        expect(dest).not.toHaveProperty("c");
        expect(dest).not.toHaveProperty("d");
        expect(dest).not.toHaveProperty("e");
    });
});

describe("copyList(...)", () => {
    it("copies an array from one object to another", () => {
        const src = { a: ["hello", "bye"], b: [] };
        const dest = {};

        copyList(dest, src, "a");
        copyList(dest, src, "b");

        expect(dest.a).toEqual(["hello", "bye"]);
        expect(dest.b).toEqual([]);
    });

    it("will copy with a different property name (if provided)", () => {
        const src = { a: ["hello", "bye"] };
        const dest = {};

        copyList(dest, src, "a", "new name");

        expect(dest["new name"]).toEqual(["hello", "bye"]);
        expect(dest).not.toHaveProperty("a");
    });

    it("will copy strings of [possibly] comma separated values as lists of trimmed strings", () => {
        const src = { a: "hi", b: "hi there", c: "hi , there , buddy" };
        const dest = {};

        copyList(dest, src, "a");
        copyList(dest, src, "b");
        copyList(dest, src, "c");

        expect(dest.a).toEqual(["hi"]);
        expect(dest.b).toEqual(["hi there"]);
        expect(dest.c).toEqual(["hi", "there", "buddy"]);
    });

    it("will not copy values that are not arrays or strings", () => {
        const src = { a: null, b: {}, c: undefined, d: 22 };
        const dest = {};

        copyList(dest, src, "a");
        copyList(dest, src, "b");
        copyList(dest, src, "c");
        copyList(dest, src, "d");

        expect(dest).not.toHaveProperty("a");
        expect(dest).not.toHaveProperty("b");
        expect(dest).not.toHaveProperty("c");
        expect(dest).not.toHaveProperty("d");
    });
});

describe("extractConfig(...)", () => {
    // sampleConfig represents all the sanctioned values that can show up
    // in a config
    const sampleConfig = {
        DATABASE_HOST: "db-host",
        DATABASE_PORT: 3306,
        DATABASE_NAME: "db-name",
        DATABASE_USERNAME: "db-username",
        DATABASE_PASSWORD: "db-password",
        SHOULD_SERVE_HTTP: true,
        HTTP_PORT: 8080,
        SHOULD_SERVE_HTTPS: false,
        HTTPS_PORT: 8443,
        SSL_KEY: "ssl-key",
        SSL_CERT: "ssl-cert",
        COOKIE_PATH: "cookie-path",
        COOKIE_SECURE: true,
        COOKIE_HTTP_ONLY: true,
        COOKIE_MAX_AGE: 100000,
        NUM_PROXY_SERVERS_FOR_API: 0,
        SESSION_COOKIE_SECRET: "session-secret",
        EARTH_DATA_LOGIN_AUTH_CODE_REQUEST_URI: "edl-auth-request",
        EARTH_DATA_LOGIN_TOKEN_REQUEST_URI: "edl-token-request",
        EARTH_DATA_LOGIN_TOKEN_REFRESH_URI: "edl-token-refresh",
        EARTH_DATA_LOGIN_USER_INFO_URI: "edl-user-info",
        EARTH_DATA_LOGIN_CLIENT_ID: "edl-client-id",
        EARTH_DATA_LOGIN_PASSWORD: "edl-password",
        L2SS_SUBSET_SUBMIT_REQUEST_URI: "l2ss-subset-url",
        L2SS_SUBSET_STATUS_REQUEST_URI: "l2ss-status-url",
        LIST_OF_AUTHORIZED_CORS_REQUESTER_ORIGINS: ["origin1", "origin2"],
    };

    it("copies all sanctioned values that have 'good' value from a source config", () => {
        const srcConfig = sampleConfig;
        const config = extractConfig(srcConfig);

        // check that new config has same number of keys as original
        expect(Object.keys(config)).toHaveLength(Object.keys(srcConfig).length);

        // spot check some of the individual values
        expect(config["DATABASE_HOST"]).toEqual(srcConfig["DATABASE_HOST"]);
        expect(config["DATABASE_PORT"]).toEqual(srcConfig["DATABASE_PORT"]);
        expect(config["SHOULD_SERVE_HTTP"]).toEqual(srcConfig["SHOULD_SERVE_HTTP"]);
        expect(config["DATABASE_HOST"]).toEqual(srcConfig["DATABASE_HOST"]);
        expect(config["LIST_OF_AUTHORIZED_CORS_REQUESTER_ORIGINS"]).toEqual(
            srcConfig["LIST_OF_AUTHORIZED_CORS_REQUESTER_ORIGINS"]
        );
    });

    it("doesn't copy non-sanctioned properties", () => {
        const srcConfig = { ...sampleConfig, NON_SANCTIONED_PROPERTY: 1 };
        const config = extractConfig(srcConfig);

        // check that new config has same number of keys as original (minus 1 because the non-sanctioned)
        // property should not be copied)
        expect(Object.keys(config)).toHaveLength(Object.keys(srcConfig).length - 1);

        // check that non-sanctioned value was not copied
        expect(config).not.toHaveProperty("NON_SANCTIONED_PROPERTY");
    });

    it("doesn't copy sanctioned properties that have an invalid value", () => {
        const srcConfig = { DATABASE_HOST: 5 };
        const config = extractConfig(srcConfig);
        expect(config).not.toHaveProperty("DATABASE_HOST");
    });

    it("will allow using legacy properties, converting them to sanctioned properties", () => {
        const srcConfig = {
            earthDataAppClientId: "edl-client-id",
            earthDataAppPassword: "edl-password",
            databaseUserid: "db-username",
            databasePassword: "db-password",
            sessionCookieSecret: "session-cookie-secret",
        };
        const config = extractConfig(srcConfig);

        expect(config["EARTH_DATA_LOGIN_CLIENT_ID"]).toBe(srcConfig["earthDataAppClientId"]);
        expect(config).not.toHaveProperty("earthDataAppClientId");

        expect(config["EARTH_DATA_LOGIN_PASSWORD"]).toBe(srcConfig["earthDataAppPassword"]);
        expect(config).not.toHaveProperty("earthDataAppPassword");

        expect(config["DATABASE_USERNAME"]).toBe(srcConfig["databaseUserid"]);
        expect(config).not.toHaveProperty("databaseUserid");

        expect(config["DATABASE_PASSWORD"]).toBe(srcConfig["databasePassword"]);
        expect(config).not.toHaveProperty("databasePassword");

        expect(config["SESSION_COOKIE_SECRET"]).toBe(srcConfig["sessionCookieSecret"]);
        expect(config).not.toHaveProperty("sessionCookieSecret");
    });
});
