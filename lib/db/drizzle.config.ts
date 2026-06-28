// import "dotenv/config";
// import { defineConfig } from "drizzle-kit";
// import path from "path";

// if (!process.env.DATABASE_URL) {
//   throw new Error("DATABASE_URL, ensure the database is provisioned");
// }

// export default defineConfig({
//   schema: path.join(__dirname, "./src/schema/index.ts"),
//   dialect: "postgresql",
//   dbCredentials: {
//     url: process.env.DATABASE_URL,
//   },
// });


import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";
import path from "path";

// Explicitly load .env from project root
dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}

export default defineConfig({
  //schema: path.join(__dirname, "./src/schema/index.ts"),
  schema: "./src/schema/*.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});