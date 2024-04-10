/**
 * This would be fetched from a external data source. Hardcoding for the purposes of this demo.
 *
 * The goal is to map to customer resources. Usually a SaaS would have the following flow:
 * 1. User signs up on auth provider
 * 2. Either creates a team, or allows the user to create multiple apps to identify their clients
 */
export const apps = [
  { name: "My Pokemon API", id: "123e4567-e89b-12d3-a456-426614174000" },
  { name: "Foo Bar", id: "123e4567-e89b-12d3-a456-426614174001" },
];

export function getAppById(id: string) {
  return apps.find((app) => app.id === id);
}

/**
 * Determines the deployment URL based on the environment: local development, preview, or production.
 */
export function getBaseUrl() {
  return process.env.VERCEL_ENV === "production"
    ? "https://m2m-auth.vercel.app"
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
}
