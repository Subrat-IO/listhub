export const publicEnv = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "ListHub Admin",
  adminUrl: process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3001",
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1",
};

export const apiOrigin = publicEnv.apiUrl.replace(/\/api\/v1\/?$/, "");

export const serverEnv = {
  apiInternalUrl:
    process.env.API_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:5000/api/v1",
};
