# HiTIDE Profile Tests

## HiTIDE Profile Integration Tests

In order to run HiTIDE Profile integration tests, the following environment variables should be set:

| Env var name        | Env var value                                                          |
| ------------------- | ---------------------------------------------------------------------- |
| CLIENT_ID           | HiTIDE Profile Client ID for either UAT or OPS                         |
| REDIRECT_URI        | HiTIDE Profile Redirect URI. `http://localhost:8901/`                  |
| USERNAME            | EDL username                                                           |
| PASSWORD            | EDL password                                                           |
| URS_HOST            | `https://uat.urs.earthdata.nasa.gov`, `https://urs.earthdata.nasa.gov` |
| HITIDE_PROFILE_HOST | HITIDE Profile URL                                                     |

The integration config must be provided to jest for the integration tests to run. 
This is to ensure the integration tests and regular unit tests run separately.

You can run the integration tests using the `integration-test` npm script:

```
npm run integration-test
```

Alternatively you can run jest directly. Run all tests:

```sh
npx jest -c jest.integration.config.js
```

Run specific test:

```sh
npx jest -c jest.integration.config.js --testNamePattern=HiTIDE Profile Login Integration Tests the login endpoint should populate session cookies
```