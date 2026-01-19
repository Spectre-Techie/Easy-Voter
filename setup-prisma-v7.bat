@echo off
echo ========================================
echo EasyVoter - Prisma v7 Migration
echo ========================================
echo.

echo Step 1: Installing required packages...
call npm install dotenv --save
echo.

echo Step 2: Generating Prisma Client...
call npx prisma generate
echo.

echo Step 3: Pushing schema to database...
call npx prisma db push
echo.

echo Step 4: Seeding admin account...
call npm run db:seed
echo.

echo ========================================
echo Prisma v7 setup complete!
echo You can now run: npm run dev
echo ========================================
pause
