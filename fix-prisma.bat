@echo off
echo ========================================
echo EasyVoter - Complete Prisma Fix
echo ========================================
echo.

echo Step 1: Cleaning all Prisma artifacts...
if exist node_modules\.prisma rmdir /s /q node_modules\.prisma
if exist node_modules\@prisma rmdir /s /q node_modules\@prisma
if exist "%USERPROFILE%\.cache\prisma" rmdir /s /q "%USERPROFILE%\.cache\prisma"
echo Done!
echo.

echo Step 2: Reinstalling Prisma packages...
call npm uninstall @prisma/client prisma
call npm install @prisma/client@latest prisma@latest
echo.

echo Step 3: Generating Prisma Client with binary engine...
call npx prisma generate
echo.

echo Step 4: Verifying database connection...
call npx prisma db push
echo.

echo ========================================
echo Prisma setup complete!
echo You can now run: npm run db:seed
echo ========================================
pause
