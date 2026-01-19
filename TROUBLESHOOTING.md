# Fix for Prisma WASM Engine Error on Windows

## Quick Fix Commands

Run these commands in order:

```bash
# 1. Clear Prisma cache
rmdir /s /q node_modules\.prisma
rmdir /s /q node_modules\@prisma

# 2. Clear Prisma global binaries
rmdir /s /q %USERPROFILE%\.cache\prisma

# 3. Reinstall Prisma
npm install @prisma/client prisma --force

# 4. Generate Prisma Client (this should work now)
npx prisma generate

# 5. Run database migration
npx prisma migrate dev --name init
```

## Alternative: If the above doesn't work

If you still get errors, we'll switch to the Node-API engine which is more stable on Windows.

Update your `prisma/schema.prisma` to add this at the top:

```prisma
generator client {
  provider = "prisma-client-js"
  engineType = "binary"
}
```

Then run:
```bash
npx prisma generate
```

---

## For Vercel Blob Token

Since the new Vercel UI doesn't show tokens directly in the Blob store settings, here's how to get it:

### Method 1: Link Blob to Vercel Project

1. Go to your Vercel dashboard
2. Create or select your EasyVoter project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Select your Blob store from the dropdown
6. Vercel will auto-create the `BLOB_READ_WRITE_TOKEN` variable
7. Copy the value and update your `.env`

### Method 2: For Development (Temporary Solution)

For now, we can work without Blob storage initially and add it later when we implement file uploads. Comment out the Blob token line in your `.env`:

```
# BLOB_READ_WRITE_TOKEN="vercel_blob_rw_PLACEHOLDER_GET_FROM_PROJECT_SETTINGS"
```

We'll set this up properly when we build the file upload feature in Phase 3.

---

Let me know once you've run the Prisma fix commands!
