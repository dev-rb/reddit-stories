/*
  Warnings:

  - You are about to drop the column `commentId` on the `Comment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Comment` DROP COLUMN `commentId`,
    ADD COLUMN `mainCommentId` VARCHAR(191) NULL,
    ADD COLUMN `replyId` VARCHAR(191) NULL;
