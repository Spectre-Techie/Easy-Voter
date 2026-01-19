import { PrismaClient } from "./generated/client"
import { hashPassword } from "../lib/password"
import "dotenv/config" // Load environment variables

// Prisma v7 with Prisma Postgres (managed database service)
// Use accelerateUrl to handle connection pooling and proxying
const prisma = new PrismaClient({
    accelerateUrl: process.env.PRISMA_DATABASE_URL,
})

async function main() {
    console.log("🌱 Starting database seeding...")

    const adminEmail = process.env.ADMIN_EMAIL || "admin@easyvoter.com"
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!"

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    })

    if (existingAdmin) {
        console.log(`✅ Admin account already exists: ${adminEmail}`)
        return
    }

    //Create admin account
    const hashedPassword = await hashPassword(adminPassword)

    const admin = await prisma.user.create({
        data: {
            email: adminEmail,
            passwordHash: hashedPassword,
            role: "ADMIN",
        },
    })

    console.log(`✅ Created admin account: ${admin.email}`)
    console.log(`📧 Email: ${adminEmail}`)
    console.log(`🔒 Password: ${adminPassword}`)
    console.log("\n⚠️  IMPORTANT: Change the admin password after first login!")
}

main()
    .catch((e) => {
        console.error("❌ Error seeding database:", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
