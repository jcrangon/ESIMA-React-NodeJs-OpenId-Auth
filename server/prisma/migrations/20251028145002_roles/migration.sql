-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ROLE_USER', 'ROLE_ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'ROLE_USER';
