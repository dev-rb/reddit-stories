/*
  Warnings:

  - You are about to drop the column `readLated` on the `UserStorySaved` table. All the data in the column will be lost.
  - Added the required column `readLater` to the `UserStorySaved` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserStorySaved" DROP COLUMN "readLated",
ADD COLUMN     "readLater" BOOLEAN NOT NULL;
