---
title: "DX Research - Propelauth"
---

# Propelauth

- Provides a hosted UI for creating API keys.
- Due to the nature of the generated keys, it's closer to a service-to-service tokens mechanism than an OAuth flow with `client_id` and `client_secret`.
- Exposes different token types: `Personal` and `Organization`
- Doesn't support scopes for granular permissions

Reference: **[docs.propelauth.com/features/api-keys](https://docs.propelauth.com/features/api-keys)**

### Programmatically creating keys

API key can be associated with a user, an organization, or no one.

```curl
curl -X "POST" \
    -H "Authorization: Bearer <API_KEY>" \
    -H "Content-Type: application/json" \
    -d '{
        "org_id": "1189c444-8a2d-4c41-8b4b-ae43ce79a492",
        "user_id": "31c41c16-c281-44ae-9602-8a047e3bf33d",
        "expires_at_seconds": 1630425600,
        "metadata": {
            "customKey": "customValue",
        },
    }' \
    "<AUTH_URL>/api/backend/v1/end_user_api_keys"
```

### Validating requests from customers

Once a customer has generated an API Key for their requests, they can then send that key in the header of their requests.

Validation endpoints must be called to verify that the request is coming from a trusted machine.

```js
app.post('/api/whoami', async (req, res) => {
    const apiKey = await auth.validatePersonalApiKey(req.headers.authorization)
    console.log(apiKey)
})
```

```json
{
	user: {
		"userId":"98cef184-7c15-45c5-8918-8c2295aa7ffe",
		"email":"test@propelauth.com",
		"emailConfirmed":true,
		"hasPassword":true,
		"pictureUrl":"https://img.propelauth.com/2a27d237-db8c-4f82-84fb-5824dfaedc87.png",
		"locked":false,
		"enabled":true,
		"mfaEnabled":false,
		"canCreateOrgs":false,
		"createdAt":1685487933,
		"lastActiveAt":1685494460,
		"orgIdToOrgInfo":{
			...
		},
		"updatePasswordRequired":false
	},
	metadata: {
		"howDoISetThis": "you can set the metadata on API key creation or update"
	}
}
```

## Screenshots

![Hosted UI](https://i.ibb.co/k2g9T6v/Clean-Shot-2024-04-06-at-15-16-07.png)

![New API key modal](https://i.ibb.co/1KyHScv/Clean-Shot-2024-04-06-at-15-16-30.png)

![API key result](https://i.ibb.co/FJ0bpHr/Clean-Shot-2024-04-06-at-15-16-37.png)
