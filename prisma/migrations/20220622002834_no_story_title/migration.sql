/*
  Warnings:

  - You are about to drop the column `title` on the `Story` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `UserPostSaved_postId_fkey` ON `UserPostSaved`;

-- DropIndex
DROP INDEX `UserStorySaved_storyId_fkey` ON `UserStorySaved`;

-- AlterTable
ALTER TABLE `Story` DROP COLUMN `title`;
