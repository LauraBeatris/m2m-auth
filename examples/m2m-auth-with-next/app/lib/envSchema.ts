import z from "zod";

const envVariableSchema = z.string().trim().min(1);
const envServerSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: envVariableSchema,
  CLERK_SECRET_KEY: envVariableSchema,
  UNKEY_ROOT_KEY: envVariableSchema,
  UNKEY_API_ID: envVariableSchema,
});

type EnvServerSchema = z.infer<typeof envServerSchema>;

const envServerParsed = envServerSchema.safeParse({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  UNKEY_ROOT_KEY: process.env.UNKEY_ROOT_KEY,
  UNKEY_API_ID: process.env.UNKEY_API_ID,
} satisfies EnvServerSchema);

if (!envServerParsed.success) {
  const errorMessage = "Error when parsing environment variables";

  throw new Error(errorMessage);
}

export const envServerData = envServerParsed.data;

type EnvServerSchemaType = z.infer<typeof envServerSchema>;

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvServerSchemaType {}
  }
}
