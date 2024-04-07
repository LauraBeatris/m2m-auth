---
title: "Design - Node.js"
---

# M2M auth with Node.js

Design proposal on how to perform M2M auth for SaaS applications built with Node.js that expose API endpoints for external clients.

Clerk is used as the auth provider for this example. Although Clerk doesn't expose M2M auth at the time of writing this, the goal is to showcase how this would fit their product.

### API Endpoints

#### Creating keys

This example is only providing the key `name` as metadata, but other properties might be needed as well for further customization, such as:
- Roles, for access control
- Expiration time
- Limit the number of requests a key can make

For reference, [Unkey](https://unkey.com) is a service for key management which provides further customization, such as rate limiting per key.

```ts
app.post('/create-key', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { key } = await clerkClient.createKey({
      name: req.body.name,
      // Links a Clerk API key to a customer record
      // Clerk's API should also relate a key to the user's id who created the key and it's Clerk application
      externalClientId: req.body.teamId
    })

    res.json({ key })
  } catch (error) {
    res.json({ error: error.message })
  }
})
```

The key should already be associated with your application client ID, so you don't have to [programmatically create it like with Okta](https://developer.okta.com/blog/2018/06/06/node-api-oauth-client-credentials#register-clients-on-the-fly), however it's necessary to associate with your customer's record so you can access this information on the request.

The hashed key should be returned in the response for better security. When attempting to verify the API Key, then the `key` argument provided should be hashed and compared to the stored hashed key. If they match, then the API Key is valid.

#### Protecting API endpoints with keys

**First approach:** Calls SDK to verify key and handles the response.
```js
app.post('/protected-with-key', async (req, res) => {
  const authHeader = req.headers["authorization"]
  const key = authHeader?.toString().replace("Bearer ", "");

  if (!key) {
    return res.status(401).send("Unauthorized")
  }

  try {
    const { error } = await clerkClient.verifyKey(key)

    if (error) {
      return res.status(500).send("Internal Server Error")
    }

    res.json({ protected: true })
  } catch (error) {
    res.json({ error: error.message })
  }
})
```

**Second approach:** Integrate with a middleware that already reads the key from the request. It could reuse the existing [`ClerkExpressRequireAuth` Express middleware](https://clerk.com/docs/backend-requests/handling/nodejs)  or create a new middleware to protect with API keys only.

```js
app.post('/protected-with-key', ClerkExpressRequireKey(), async (req, res) => {
  res.json({ protected: true })
})
```

#### Identify external client within the request

The `req.auth` would contain the `externalClientId` that provides the link to your customer record.
