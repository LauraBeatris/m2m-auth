---
title: "Design - Node.js"
---

# M2M auth with Node.js

Design proposal on how to perform M2M auth for SaaS applications built with a Node.js API connected with an auth provider for user's identity and that also exposes API endpoints for external clients.

Clerk is used as the auth provider for this example. Although Clerk doesn't expose M2M auth at the time of writing this, the goal is to showcase how this would fit their product.

### Table of contents

- [Creating keys](#creating-keys)
- [Protecting API endpoints with keys](#protecting-api-endpoints-with-keys)
- [Keys revocation](#keys-revocation)
- [Identify external client within the request](#identify-external-client-within-the-request)
- [Security considerations](#security-considerations)
- [Performance](#performance)

### Creating keys

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
      // Links a key to a customer record
      consumerId: req.body.customerRecordId
    })

    res.json({ key })
  } catch (error) {
    res.json({ error: error.message })
  }
})
```

The key could also be associated with:
- User: The user's identity whom created the key.
- Organization: The organization associated with the user's identity whom created the key.
- Clerk's application ID

### Protecting API endpoints with keys

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

### Keys revocation

There are two types of revocation that should be handled: Automatic revocation & manual revocation.

- Automatic revocation: When the organization is deleted, when the user account is deleted, when the user who created the key leaves the org, or when the token expires.
- Manual revocation: When deleting API keys or enabling/disabling them via API.

The "organization" and "user" here are the ones tied to the creation of a key - refer to [Creating Keys](#creating-keys).

### Identify external client within the request

The `Auth` object should contain an identifier for the non-user principal making the request. An example would be an application belonging to a different domain that has been granted access to the SaaS application's API.

### Security considerations

#### Storage

Store the hash of a key and consider saving the last few digits of your key for reference. This helps customers identify which key they want to revoke, change scopes for, etc.

API-key storage implementations is divided into two groups: **Retrievable** and **Irretrievable**. Each have their security tradeoffs.

**Irretrievable:**

The keys are stored via a one-way encryption process so they can never be retrieved, or stolen from the database in a worse case scenario. Stripe and Amazon AWS use this approach.

It's recommended to store keys as sha256 hashes and set primary keys to minimize hash collisions, also having retry logic on creation and insertion.

[Unkey](https://unkey.dev/docs/security/overview) applies a similar concept, where the hashed keys get stored. When attempting to verify the API Key, then the `key` argument gets hashed and compared to the stored hashed key. If they match, then the API Key is valid.

**Retrievable**:

Keys are stored encrypted via reversible encryption. Users are less pressured to immediately secure the key, reducing loss risk.

Twilio, AirTable, RapidAPI use this approach.

Use encryption for database-stored values to be retrievable later, either via a secure vault or by managing encryption directly in a standard database.

#### Rolling transition period & key revocation

All API keys should be revocable, in case users accidentally expose it.

Customers should be allowed to set a rolling transition period for key updates to prevent system failures upon immediate revocation, except in critical situations. Here's an example from Stripe:

![Stripe - Roll API key](https://i.ibb.co/0y5rv9w/76c95f5b-d1b5-4623-8564-7adae623f9c1.png)

#### Checksum validation

It's a good practice to add a checksum to API keys to reduce latency, as key verification is crucial for every API call.

Here's an example:
```
example_b7d9c32y98e5432abc5f6def0yyyy_4241314
```

The checksum `_4241314` allows to quickly validate keys in the request pipeline, rejecting invalid ones to reduce load on the API key store.

That checksum can also be a signed hash. The signing authority can be confident whether it was generated by system, and rejecting invalid keys without doing a database check.

### Performance

Requests to manage keys should be as fast as possible. An in-memory cache can be used to store keys in order to perform a database roundtrip on every single read.

For security, it's recommended to perform caching only hashed key versions and perform pre-hash collision checks during key creation to avoid collisions.

Also, verify incoming API tokens early in an HTTP request's lifecycle.
