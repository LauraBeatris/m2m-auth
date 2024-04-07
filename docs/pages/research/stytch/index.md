---
title: "DX Research - Stytch"
---

# Stytch

- Uses OAuth 2.0 [Client Credentials grant flow](https://datatracker.ietf.org/doc/html/rfc6749).
- In terms of API design, machines are represented as an `m2m_client` identity.
- Security considerations: Exposes API endpoints to perform secret rotation.
- SaaS applications need to create their own wrapper on top of Stytch's token endpoint in order to be exposed for their customers (unless Stytch provides custom auth domains)

Reference: **[stytch.com/docs/guides/m2m/authenticate-client](https://stytch.com/docs/guides/m2m/authenticate-client)**

### Creating an M2M Client

```bash
curl --request POST \
	--url https://test.stytch.com/v1/m2m/clients/ \
	-u '{PROJECT_ID}:{SECRET}' \
	-H 'Content-Type: application/json' \
	-d '{
		"client_name": "Foo Service",
		"client_description": "M2M Guide",
		"scopes": ["read:settings", "write:settings"],
		"trusted_metadata": {
			"api_version": "v2"
		}
	}'
```

The API call returns `client_id` and `client_secret` credentials to be exchanged by the client to get an access token.

Permissions can be enforced by specifying `scopes` in which is going to be contained in the returned `access_token`.

### Calling Stytch's `/oauth2/token` endpoint to retrieve access token

```bash
curl --request POST \
	--url https://test.stytch.com/v1/public/{PROJECT_ID}/oauth2/token \
	-H 'Content-Type: application/json' \
	-d '{
		"client_id": "m2m-client-test-a50053..",
		"client_secret": "FXvejQZKicBl7Lq...QqNU",
		"grant_type": "client_credentials"
	}'
```

Notice `grant_type` as `client_credentials` being set above. The response will contain a `access_token` as JWT:

```
{
    "status_code": 200,
    "request_id": "request-id-test-b05c992f-ebdc-489d-a754-c7e70ba13141",
    "access_token": "eyJ...",
    "token_type": "bearer",
    "expires_in": 3600
}
```

### Authenticating services with access token

Services will need to authenticate the `access_token` locally with one of Stytch's backend SDKs.

```js
const stytch = require('stytch');

const client = new stytch.Client({
  project_id: '{PROJECT_ID}',
  secret: '{SECRET}',
});

const params = {
  access_token: 'eyJ...',
  required_scopes: ['write:settings'],
};

client.m2m
  .authenticateToken(params)
  .then((resp) => {
    console.log(resp);
  })
  .catch((err) => {
    console.log(err);
  });
```
