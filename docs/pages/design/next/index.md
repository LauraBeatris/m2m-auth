---
title: "Design - Next.js"
---

# M2M auth with Next.js

Design proposal on how to perform M2M auth for SaaS applications built with Next.js that exposes route handlers for external clients.

Clerk is used as the auth provider for this example. Although Clerk doesn't expose M2M auth at the time of writing this, the goal is to showcase how this would fit their product.

### UI Component

Managing keys in the UI should be as easy as rendering a component. Eliminating the need for developers to directly interact with the auth provider to build the UI from scratch.

```tsx
import { KeysManager } from '@clerk/nextjs';

export default function Page() {
  return <KeysManager />;
}
```

Clerk could expose a similar (or even the same - dogfooding) UI component as in their Dashboard:

![Clerk's Secret Keys component](https://i.ibb.co/rt3gyk2/Clean-Shot-2024-04-08-at-12-14-43.png)

### UI utilities

Besides the UI component, some utilities could also be exposed to manage API keys from the client-side.

React Hooks, such as: `useApiKeys()`

```tsx
"use client";

import { useApiKeys } from "@clerk/clerk-react";

export default function Page() {
  const { apiKeys, createApiKeys } = useApiKeys();

  return (...);
}
```

### Protecting route handlers

```ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

export async function GET() {
  const { externalClientId } = auth();

  if (!externalClientId){
    return new Response("Unauthorized", { status: 401 });
  }

  const data = { message: 'Hello World' };

  return NextResponse.json({ data });
}
```

### With middleware

**First approach (recomended):** Introduce a new option into the existing `authMiddleware` to authenticate certain routes via API keys, rather than using the user's identity.

```ts
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  protectedWithExternalKeys: ["/my-sass-api-route"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

The current workaround for developers that integrate [Unkey](https://unkey.dev) with Clerk, requires setting protected routes with keys to `publicRoutes` in order to bypass the user's identity verification on the request headers, which is not intuitive.

**Second approach:** Introduce new middleware that authenticates via API keys only.

```ts
import { authMiddleware } from "@clerk/nextjs";

export default keysMiddleware();

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

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
