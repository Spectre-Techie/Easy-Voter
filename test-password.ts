import { db } from "./lib/db"
import { verifyPassword } from "./lib/password"
import "dotenv/config"

async function checkUser() {
    try {
        const email = "itspectre1@gmail.com"
        const passwordToTest = "@Nomore@2gh"

        console.log("Checking user in database...")
        console.log("Email:", email)
        console.log("Password to test:", passwordToTest)

        const user = await db.user.findUnique({
            where: { email }
        })

        if (!user) {
            console.log("\n❌ User not found in database!")
            console.log("Run: npm run db:seed")
            return
        }

        console.log("\n✅ User found:")
        console.log("- ID:", user.id)
        console.log("- Email:", user.email)
        console.log("- Role:", user.role)
        console.log("- Password hash:", user.passwordHash.substring(0, 20) + "...")

        console.log("\nTesting password verification...")
        const isValid = await verifyPassword(passwordToTest, user.passwordHash)
        console.log("Password valid:", isValid ? "✅ YES" : "❌ NO")

        if (!isValid) {
            console.log("\n⚠️  Password verification failed!")
            console.log("Make sure you're using the correct password from .env")
            console.log("ADMIN_PASSWORD in .env:", process.env.ADMIN_PASSWORD)
        }

    } catch (error) {
        console.error("Error:", error)
    } finally {
        await db.$disconnect()
    }
}

checkUser()
