---
title: "Design - Next.js"
---

# M2M auth with Next.js

Design proposal on how to perform M2M auth for SaaS applications built with Next.js that exposes route handlers for external clients.

Clerk is used as the auth provider for this example. Although Clerk doesn't expose M2M auth at the time of writing this, the goal is to showcase how this would fit their product.

A live example can be found at **[m2m-auth.vercel.app](https://m2m-auth.vercel.app/)** - [Source code](https://github.com/LauraBeatris/m2m-auth/tree/main/examples/m2m-auth-with-next)

### Table of contents

- [UI Component](#ui-component)
- [UI utilities](#ui-utilities)
- [Protecting route handlers](#protecting-route-handlers)
- [With middleware](#with-middleware)
- [Identify external client within the request](#identify-external-client-within-the-request)

### UI component

Managing keys in the UI should be as easy as rendering a component. Eliminating the need for developers to directly interact with the auth provider to build the UI from scratch.

```tsxs
import { ApiKeyManager } from '@clerk/react';

export default function Page() {
  return <ApiKeyManager />;
}
```

Clerk could expose a similar (or even the same - dogfooding) UI component as in their Dashboard:

![Clerk's Secret Keys component](https://i.ibb.co/rt3gyk2/Clean-Shot-2024-04-08-at-12-14-43.png)

#### Best practices

- Displaying the key creation date helps developers link it to incidents and distinguish between multiple keys.
- Only display API keys on request, preferably using a copy button to avoid showing them.
- Depending on the key format (and this is related with the API implementation as well) then keys might be easier to select - it is easier to select the API key in snake case:
  - `4a8b93d2-7f82-46f8-a8b1-88f2a5d67254`
  - `b7e23eeb44b34185bcf657e5c88df016_24d4b6`

### UI utilities

Besides the UI component, some utilities could also be exposed to manage API keys from the client-side.

React Hooks, such as: `useApiKeyManager()`

```tsx
"use client";

import { useApiKeyManager } from "@clerk/clerk-react";

export default function Page() {
  const { apiKeys, createApiKeys } = useApiKeyManager();

  return (...);
}
```

### Protecting route handlers

```ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

export async function GET() {
  const { consumerId } = auth();

  if (!consumerId){
    return new Response("Unauthorized", { status: 401 });
  }

  const data = { message: 'Hello World' };

  return NextResponse.json({ data });
}
```

### With middleware

Introduce a new option into the existing `authMiddleware` to authenticate certain routes via API keys, rather than using the user's identity.

```ts
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  protectedWithKeys: ["/my-sass-api-route"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

The current workaround for developers that integrate [Unkey](https://unkey.dev) with Clerk, requires setting protected routes with keys to `publicRoutes` in order to bypass the user's identity verification on the request headers, which is not intuitive.

#### Identify external client within the request

The `Auth` object should contain an identifier for the non-user principal making the request. An example would be an application belonging to a different domain that has been granted access to the SaaS application's API.

This should be accessible via the `auth` helper (requiring the `authMiddleware` to be enabled).

```ts
import { auth } from "@clerk/nextjs";

export default function Page() {
  const { consumerId } = auth();

  return (...);
}
```

Using `consumerId` here, with the thought of identifying the machine "consuming" your API. Other options are:
- `thirdPartyClientId`
- `externalClientId`
