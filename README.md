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