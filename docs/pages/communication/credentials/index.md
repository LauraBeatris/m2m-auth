---
title: "Communication - Credentials"
---

# Credentials

There are many authentication methods that can be used to communicate between machines securely. In this section, we'll focus on providing further context for each mechanism and also outlining the security considerations for each.

### Table of contents

- [Client Credentials grant flow in OAuth 2.0](#client-credentials-grant-flow-in-oauth-20)
- [JSON Web Tokens](#json-web-tokens)
- [OpenID Connect](#openid-connect)

### Client Credentials grant flow in OAuth 2.0

Used by clients to obtain an access token outside of the context of a user, through non-user principals. Typically used by clients to access resources about themselves rather than to access a user's resources.

The client application authenticates with the authorization server using its own credentials. Upon successful authentication, the authorization server issues an access token. The client application can then use this token to make API requests to the resource server.

Instead of managing those credentials in-house, it's a good practice to use a third-party service to handle authorization and manage API keys for your clients.

[![Client Credentials](https://i.ibb.co/6Dzc12z/Clean-Shot-2024-04-07-at-13-22-03.png)](https://ibb.co/HG6Lx06)

### JSON Web Tokens

Regardless the authentication protocol chose for M2M communication, it'll involves [JSON Web Token](https://datatracker.ietf.org/doc/html/rfc7519) at some point, therefore let's do a quick recap on it.

#### JWT vs API Keys

| FEATURE             | JSON Web Tokens (JWTs)                            | API Keys                                  |
|---------------------|---------------------------------------------------|-------------------------------------------|
| Type of token       | Self-contained, verifiable JSON-based tokens with claims | Alphanumeric strings or values that must encrypted or signed for security |
| Security            | More secure than API keys because tokens are cryptographically signed and encrypted | Less secure than JWTs because security depends on implementation for encryption, hashing and storage |
| Access control      | Supports granular access control via claims and scopes | Requires additional metadata in API keys data to support basic access control |
| Validity            | Supports token expiration                         | Keys have to be revoked manually or rotated |
| Verification            | Local validation pattern to validate an JWT | Increase of latency since each API request sent to your server requires a request sent to the OAuth server |

#### Format

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

#### Base64-URL

The output of the signed JWT is built on top of Base64 encoding which is URL safe.

#### Private claims

Defined by consumers and producers of the JWT.

```json
{
  "profile.modify": true,
  "catalog.service": ["read", "write", "delete"]
}
```

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
