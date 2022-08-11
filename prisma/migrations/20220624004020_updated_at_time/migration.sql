/*
  Warnings:

  - Added the required column `updatedAt` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Reply` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Story` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Post` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `Reply` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `Story` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;
