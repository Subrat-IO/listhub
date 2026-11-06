import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Load `backend/.env` before reading `process.env` (used by `env.ts` and Prisma CLI). */
dotenv.config({ path: path.join(__dirname, "../../.env") });
