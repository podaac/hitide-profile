# HiTIDE - Profile

## Purpose
HiTIDE-profile is a server-side service created to provide [HiTIDE-ui](https://podaac-git.jpl.nasa.gov:8443/HiTIDE-UI-Components/hitide-ui) the following capabilities:
* Logging in and out using ESDIS Earthdata Login system
* Only allow the user to submit a subset-job when logged in
* Store subset-job submission history in a database (rather than in browser localStorage)

## What it does
HiTIDE-profile provides the following endpoints which are consumed by HiTIDE-ui:

Login related endpoints:
* POST /hitide/api/session/login - verifies user via the Earthdata Login system and establishes session
* POST /hitide/api/session/logout - for ending login session
* GET /hitide/api/session/user - for getting user information about the currently logged in user

Subset-Job related endpoints:
* POST /hitide/api/jobs/submit - for submitting a subset job
* GET /hitide/api/jobs/status - gets the status of a submitted subset job
* GET /hitide/api/jobs/history - get subset job submission history for the currently logged in user
* POST / hitide/api/jobs/disable - disable a particular job in the history; preventing it from being sent in subsequent history requests


## Tech used
* Language: Javascript
* Runtime: NodeJS
* Server Framework: ExpressJS
* Deployed using Docker

## Connections to other systems
* Earthdata Login system
* MySQL/MariaDB database
* PODAAC L2SS services

## Local development

### 1. Setting Up MySQL with Docker

#### Step 1: Pull the MySQL Docker Image

Make sure you have Docker installed on your system. Then, pull the MySQL version 5 Docker image:

```bash
docker pull --platform linux/x86_64 mysql
docker pull mysql:8
```

#### Step 2: Run the MySQL Docker Container

Run a MySQL container with the desired configuration:

```bash
docker run --name hitide-mysql --platform linux/amd64 -e MYSQL_ROOT_PASSWORD=my-secret-pw -d -p 3306:3306 mysql:8 
```

You can customize:

- `--name hitide-mysql`: The name of the Docker container.
- `-e MYSQL_ROOT_PASSWORD=my-secret-pw`: The root password for MySQL.
- `-p 3306:3306`: The port mapping, which maps port 3306 on your host to port 3306 in the container.

#### Step 3: Verify the MySQL Container is Running

Check the status of the running container:

```bash
docker ps
```

You should see your MySQL container listed.

### 2. Creating the Database

#### Step 1: Connect to the MySQL Instance

Use your preferred MySQL client or the MySQL command-line tool to connect to the running MySQL instance:

```bash
mysql -h 127.0.0.1 -P 3306 -u root -p
```

You'll be prompted for the root password (my-secret-pw in this case).

#### Step 2: Create the Database

Once connected, create the database:

```sql
CREATE DATABASE hitide_profile;
```

### 3. Setting Up the Application

#### Step 1: Configure Environment Variables

Before running the setup script, configure the necessary environment variables. You can set these variables in your shell session or use a `.env` file. Here’s an example of how to set them:

```bash
export DATABASE_HOST=127.0.0.1
export DATABASE_PORT=3306
export DATABASE_NAME=hitide_profile
export DATABASE_ADMIN=root
export DATABASE_ADMIN_PASSWORD=my-secret-pw
export DATABASE_USERNAME=hitide_user
export DATABASE_PASSWORD=hitide_password
```

#### Step 2: Run the Setup Script

Navigate to the hitide-profile root directory and run the setup script:

```bash
cd path/to/hitide-profile
node mysql/setup-db.js
```

This script will:
- Connect to the MySQL instance using the admin credentials.
- Create a new user (specified by `DATABASE_USERNAME` and `DATABASE_PASSWORD`).
- Set up the necessary tables in the `hitide_profile` database.

### 4. Verifying the Setup

#### Step 1: Check Database and Tables

Reconnect to the MySQL instance and check the database and tables:

```bash
mysql -h 127.0.0.1 -P 3306 -u root -p
```

Then run:

```sql
USE hitide_profile;
SHOW TABLES;
```

You should see the tables created by the setup script.

### Note:
In HiTIDE UI code in the **hitideConfig.js** file, make sure you set the **hitideProfileOrigin** variable to where your local hitide-profile instance is running so the frontend knows where to find hitide-profile. For example:
```
var hitideProfileOrigin = "http://localhost:8080/hitide/api";
```