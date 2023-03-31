const mysql = require("mysql");

const { DATABASE_HOST, DATABASE_PORT, DATABASE_NAME, DATABASE_ADMIN, DATABASE_ADMIN_PASSWORD, DATABASE_USERNAME, DATABASE_PASSWORD } =
    process.env;

const makeJobsTableQuery = `
CREATE TABLE IF NOT EXISTS jobs (
    id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subjobs TEXT NOT NULL,
    download_urls TEXT,
    citations TEXT,
    request_time DATETIME NOT NULL,
    complete_time DATETIME,
    status_string VARCHAR(20) NOT NULL,
    status_code INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    granules_requested INT NOT NULL,
    granules_completed INT NOT NULL,
    granules_failed INT NOT NULL,
    total_download_bytes BIGINT,
    disabled_by_user TINYINT(1) NOT NULL DEFAULT 0,

    PRIMARY KEY(id)
);
`;

const makeSessionsTableQuery = `
CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(128) NOT NULL,
    expires INT(11) UNSIGNED NOT NULL,
    data TEXT DEFAULT NULL
);
`;

const makeUserQuery = `
CREATE USER IF NOT EXISTS ${DATABASE_USERNAME} IDENTIFIED BY '${DATABASE_PASSWORD}';
`;

const grantUserQuery = `
GRANT DELETE,INSERT,SELECT,UPDATE ON ${DATABASE_NAME}.* TO '${DATABASE_USERNAME}';
`;

const connection = mysql.createConnection({
    host: DATABASE_HOST,
    port: DATABASE_PORT,
    database: DATABASE_NAME,
    user: DATABASE_ADMIN,
    password: DATABASE_ADMIN_PASSWORD,
});


connection.query(makeJobsTableQuery, (error) => {
    console.log("\nCreating jobs table (if not exist)...");
    if (error) console.error(error.message);
    else console.log("success");

    connection.query(makeSessionsTableQuery, (error) => {
        console.log("\nCreating sessions table (if not exist)...");
        if (error) console.error(error.message);
        else console.log("success");

        connection.query(makeUserQuery, (error) => {
            console.log("\nCreating user (if not exist)...");
            if (error) console.error(error.message);
            else console.log("success");

            connection.query(grantUserQuery, (error) => {
                console.log("\nGranting privileges to user...");
                if (error) console.error(error.message);
                else console.log("success");

                console.log();
                connection.destroy();
            });
        });
    });
});
