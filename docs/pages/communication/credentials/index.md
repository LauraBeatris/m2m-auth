---
title: "Communication - Credentials"
---

# Credentials

There are many authentication methods that can be used to communicate between machines securely. In this section, we'll focus on providing further context for each mechanism and also outlining the security considerations for each.

### Table of contents

- [API Keys](#api-keys)
- [JSON Web Tokens](#json-web-tokens)
- [OpenID Connect](#openid-connect)

### API Keys

API keys simplify initial setup by avoiding OAuth's complexity, optimizing time to first call and improving DX productivity.

Many great API-first companies out there (Stripe, Twilio, Airtable) use API keys for their services, with the main reasoning: Engineers don't have to think about the indirection of OAuth flows.

API Keys are unique, opaque strings per client, not containing data like JWTs. There is no standard protocol for API Key auth like OAuth, so each implementation can differ per provider.

```ts
// Pseudo-code to demostrate checking a key and getting metadata
export async function GET() {
  const apiKey = request.headers.get("API-Key");
  const { result } = await client.verifyKey(apiKey);

  if (!result.valid) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (result.metadata.companyId) {
    // ...
  }
}
```

#### API Keys vs JSON Web Tokens

JWTs facilitate user actions, while API keys suit machine/systems interactions where OAuth isn't ideal - [GitHub](../../research/github) is a great example of this.
With Client Credential grant flow, the client must store a `client_id` and `client_secret` that it uses to acquire and refresh tokens.

With an API key, the client stores the key. So you might ask yourself, what makes one more secure than another? This is pretty debatable, but the main difference comes down to direct access vs. delegated access.

#### Direct access

The client directly interacts with the resource server using a single set of credentials, such as an API key.

- The API key is sent with every request to authenticate the client
- The resource server must validate the API key and determine the permissions for each request
- Simpler but less secure, as the API key, if compromised, can give full access to the resources it's associated with. However, this is the reason why keys should be stored as hashed values, which won't get compromised even if leaked.

#### Delegated access

Facilitated by OAuth and the Client Credentials grant flow, introduces an authorization server as an intermediary.

- The client authenticates with the authorization server using its `client_id` and `client_secret` to obtain an access token.
- Clients might need to be created on the fly, using something like Auth0 Management API:

```ts
const okta = require('@okta/okta-sdk-nodejs')
const oktaClient = new okta.Client({
  orgUrl: process.env.ORG_URL,
  token: process.env.TOKEN,
})

app.get('/register/:label', async (req, res) => {
  try {
    const application = await oktaClient.createApplication({
      name: 'oidc_client',
      label: req.params.label,
      signOnMode: 'OPENID_CONNECT',
      credentials: {
        oauthClient: {},
      },
      settings: {
        oauthClient: {
          grant_types: ['client_credentials'],
          application_type: 'service',
        },
      },
    })

    const { client_id, client_secret } = application.credentials.oauthClient

    res.json({
      client_id,
      client_secret,
      request_token_url: `${process.env.ISSUER}/v1/token`,
    })
  } catch (error) {
    res.json({ error: error.message })
  }
})
```

### JSON Web Tokens

[JSON Web Token](https://datatracker.ietf.org/doc/html/rfc7519) authentication uses an OAuth 2.0 identity provider. The identity provider issues tokens after validating the clients are who they say they are.

JWT auth with OAuth uses the Client Credentials flow on the OAuth 2.0 identity server.

JWT-based API auth is a good choice when your ecosystem relies on many integrated microservices since managing numerous API keys can be painful.

#### Client Credentials grant flow in OAuth 2.0

Used by clients to obtain an access token outside of the context of a user, through non-user principals. Typically used by clients to access resources about themselves rather than to access a user's resources.

The client application authenticates with the authorization server using its own credentials. Upon successful authentication, the authorization server issues an access token. The client application can then use this token to make API requests to the resource server.

[![Client Credentials](https://i.ibb.co/6Dzc12z/Clean-Shot-2024-04-07-at-13-22-03.png)](https://ibb.co/HG6Lx06)

Request:
```bash
curl --request POST \
  --url 'https://YOUR_DOMAIN/oauth/token' \
  --header 'content-type: application/x-www-form-urlencoded' \
  --data grant_type=client_credentials \
  --data client_id=YOUR_CLIENT_ID \
  --data client_secret=YOUR_CLIENT_SECRET \
  --data audience=YOUR_API_IDENTIFIER
```

Response:
```json
{
  "access_token": "eyJz93a...k4laUWw",
  "token_type": "Bearer",
  "expires_in": 86400
}
```

#### JWT vs API Keys

| FEATURE             | JSON Web Tokens (JWTs)                            | API Keys                                  |
|---------------------|---------------------------------------------------|-------------------------------------------|
| Type of token       | Self-contained, verifiable JSON-based tokens with claims | Alphanumeric strings or values that must encrypted or signed for security |
| Security            | More secure than API keys because tokens are cryptographically signed and encrypted | Less secure than JWTs because security depends on implementation for encryption, hashing and storage |
| Access control      | Supports granular access control via claims and scopes | Permissions can be changed even after they are issued.
 |
| Validity            | Supports token expiration, cannot be revoked manually                         | Keys can be revoked manually or rotated |
| Verification            | Local validation pattern to validate an JWT | Increase of latency since each API request sent to your server requires a request sent to the OAuth server |

#### Format

The output of the signed JWT is built on top of Base64 encoding which is URL safe.

The JWT contains a `sub` parameter that identifies the client. The token also includes a aud parameter that specifies which API the token can call. Details on additional fields follow:

- Header (JSON) [required]:
  - `alg` - The signing algorithm used
  - `typ` - The type of token
- Payload (JSON) [required]:
  - `iss` - The issuer, which uniquely identifies the party that issued the JWT
  - `sub` - The subject, uniquely identifies the party to which the JWT relates
  - `aud` - The audience, defines whom the JWT is suitable for
  - `exp` - The expiration time
  - `iat` - The time the token was issued
  - `jti` - The unique identifier for the token
- Signature [required]

#### Best Practices

- Always perform algorithm verification
- Use appropriate algorithms
- Always perform all validations
- Always perform cryptographic inputs
- Pick strong keys
- Validate all possible claims

### OpenID Connect

In the context of M2M auth, OIDC can be used to replace static CI/CD credentials.

- Adds an identity layer to OAuth2.0
- An ID token is a JWT that includes user data. It will always include a unique identifier for the user in the `sub` field.

```json
{
	"access_token": "<ACCESS_TOKEN>",
	"id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5ODc2NTQzMjEwIiwiaXNzIjoiYW5vdGhlckV4YW1wbGUuY29tIn0.WsZV5mT5kT9-3Z_2ZGr7h9Fwdj5KfE8n9Lh6ZvQ9S0k"
}
```
