import { defineConfig, env } from "@prisma/config";
import { config } from "dotenv";

// Manually load .env variables
config();

export default defineConfig({
    schema: "prisma/schema.prisma",
    datasource: {
        url: env("DATABASE_URL"),
    },
});