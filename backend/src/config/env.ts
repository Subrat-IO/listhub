import { z } from "zod";

function boolFromEnv(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v === "true" || v === "1";
  return Boolean(v);
}

const baseSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  WEBSITE_URL: z.string().url(),
  ADMIN_URL: z.string().url(),

  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters"),
  SESSION_COOKIE_NAME: z.string().min(1).default("listhub_session"),
  SESSION_COOKIE_SECURE: z.preprocess(boolFromEnv, z.boolean()),

  STORAGE_ENDPOINT: z.string().optional().or(z.literal("")),
  STORAGE_REGION: z.string().optional().or(z.literal("")),
  STORAGE_BUCKET: z.string().optional().or(z.literal("")),
  STORAGE_ACCESS_KEY_ID: z.string().optional().or(z.literal("")),
  STORAGE_SECRET_ACCESS_KEY: z.string().optional().or(z.literal("")),

  SMTP_HOST: z.string().optional().or(z.literal("")),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional().or(z.literal("")),
  SMTP_PASSWORD: z.string().optional().or(z.literal("")),
  SMTP_FROM: z.string().optional().or(z.literal("")),

  GOOGLE_CLIENT_ID: z.string().optional().or(z.literal("")),
  GOOGLE_CLIENT_SECRET: z.string().optional().or(z.literal("")),
});

export type Env = z.infer<typeof baseSchema> & {
  productionStorageOk: boolean;
  productionSmtpOk: boolean;
};

function parseEnv(): Env {
  const parsed = baseSchema.safeParse(process.env);
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
    throw new Error(`Invalid environment configuration: ${msg}`);
  }

  const data = parsed.data;
  const isProd = data.NODE_ENV === "production";

  const productionStorageOk =
    !isProd ||
    (Boolean(data.STORAGE_ENDPOINT) &&
      Boolean(data.STORAGE_REGION) &&
      Boolean(data.STORAGE_BUCKET) &&
      Boolean(data.STORAGE_ACCESS_KEY_ID) &&
      Boolean(data.STORAGE_SECRET_ACCESS_KEY));

  const productionSmtpOk =
    !isProd ||
    (Boolean(data.SMTP_HOST) &&
      Boolean(data.SMTP_PORT) &&
      Boolean(data.SMTP_USER) &&
      Boolean(data.SMTP_PASSWORD) &&
      Boolean(data.SMTP_FROM));

  if (isProd && data.SESSION_COOKIE_SECURE !== true) {
    throw new Error("Production requires SESSION_COOKIE_SECURE=true for secure session cookies");
  }

  if (!productionStorageOk) {
    throw new Error(
      "Production requires all STORAGE_* variables (endpoint, region, bucket, access key id, secret access key)"
    );
  }

  if (!productionSmtpOk) {
    throw new Error(
      "Production requires all SMTP_* variables (host, port, user, password, from)"
    );
  }

  return {
    ...data,
    productionStorageOk,
    productionSmtpOk,
  };
}

export const env = parseEnv();
