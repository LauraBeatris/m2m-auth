---
title: "DX Research - Auth0"
---

# Auth0

- Uses OAuth 2.0 [Client Credentials grant flow](https://datatracker.ietf.org/doc/html/rfc6749).
- Requires some Auth0 entities: Resource Server and Application (clients).
- Clients need to be programmatically created via [Auth0 Management API](https://auth0.com/docs/api/management/v2/clients/post-clients), eg: when mapping to SASS customers.

Reference: **[auth0.com/blog/using-m2m-authorization/](https://auth0.com/blog/using-m2m-authorization/)**

## Registering server

![Registered Server](https://raw.githubusercontent.com/auth0-samples/auth0-api-auth-samples/master/docs/media/worldmappers-rs.png)

Also available via [API endpoint](https://auth0.com/docs/api/management/v2/resource-servers/post-resource-servers).

The server needs some logic that inspects the contents of the token and validates that the client has the right scope to call a given endpoint:
```js
app.get('/api/location/geocode', requireScope('geocode:location'), function(req, res, next) {
  res.json({
    lat: 47.6178819,
    lng: -122.194041
  });
});
```


### Registering the client

![Registered Client](https://raw.githubusercontent.com/auth0-samples/auth0-api-auth-samples/master/docs/media/giftdeliveries-client.png)

Also available via [API endpoint](https://auth0.com/docs/api/management/v2/clients/post-clients).

By default, a client is not authorized to access any of the Resource Servers. The next step is to authorize the client for the Resource Server and define which scopes are enabled for this client.

![Authorizing client](https://raw.githubusercontent.com/auth0-samples/auth0-api-auth-samples/master/docs/media/giftdeliveries-grants.png)

### Retrieving access token and calling the API

The client can call the `https://API_DOMAIN/oauth/token` endpoint to get an access token which can then be used to call the registered server.

```js
var options = {
  method: 'POST',
  url: 'https://' + env('AUTH0_DOMAIN') + '/oauth/token',
  headers: {
    'content-type': 'application/json'
  },
  body: {
    audience: env('RESOURCE_SERVER'),
    grant_type: 'client_credentials',
    client_id: env('AUTH0_CLIENT_ID'),
    client_secret: env('AUTH0_CLIENT_SECRET')
  },
  json: true
};

request(options, function(err, res, body) {
  if (err || res.statusCode < 200 || res.statusCode >= 300) {
    return callback(res && res.body || err);
  }

  callback(null, body.access_token);
});
```
