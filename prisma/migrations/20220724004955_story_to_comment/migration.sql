/*
  Warnings:

  - You are about to drop the `Reply` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Story` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserStorySaved` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `Reply`;

-- DropTable
DROP TABLE `Story`;

-- DropTable
DROP TABLE `UserStorySaved`;

-- CreateTable
CREATE TABLE `UserCommentSaved` (
    `liked` BOOLEAN NOT NULL,
    `favorited` BOOLEAN NOT NULL,
    `readLater` BOOLEAN NOT NULL,
    `commentId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `UserCommentSaved_userId_commentId_key`(`userId`, `commentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Comment` (
    `id` VARCHAR(191) NOT NULL,
    `body` LONGTEXT NOT NULL,
    `bodyHtml` LONGTEXT NOT NULL,
    `permalink` VARCHAR(191) NOT NULL,
    `score` INTEGER NOT NULL,
    `author` VARCHAR(191) NOT NULL,
    `created` DATETIME(3) NOT NULL,
    `updatedAt` DATETIME(3) NULL,
    `postId` VARCHAR(191) NULL,
    `commentId` VARCHAR(191) NULL,

    INDEX `Comment_postId_idx`(`postId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
