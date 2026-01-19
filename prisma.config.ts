import "dotenv/config" // Ensures .env is loaded
import { defineConfig, env } from "@prisma/config"

export default defineConfig({
    schema: "prisma/schema.prisma",
    datasource: {
        // For CLI commands (migrations/introspection)
        url: env("DATABASE_URL"),
    },
})
