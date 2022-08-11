-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserPostSaved` (
    `liked` BOOLEAN NOT NULL,
    `favorited` BOOLEAN NOT NULL,
    `readLater` BOOLEAN NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `UserPostSaved_userId_postId_key`(`userId`, `postId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Post` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `created` DATETIME(3) NOT NULL,
    `score` INTEGER NOT NULL,
    `author` VARCHAR(191) NOT NULL,
    `permalink` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserStorySaved` (
    `liked` BOOLEAN NOT NULL,
    `favorited` BOOLEAN NOT NULL,
    `readLater` BOOLEAN NOT NULL,
    `storyId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `UserStorySaved_userId_storyId_key`(`userId`, `storyId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Story` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` VARCHAR(191) NOT NULL,
    `bodyHtml` VARCHAR(191) NOT NULL,
    `permalink` VARCHAR(191) NOT NULL,
    `score` INTEGER NOT NULL,
    `author` VARCHAR(191) NOT NULL,
    `created` DATETIME(3) NOT NULL,
    `postId` VARCHAR(191) NULL,

    INDEX `Story_postId_idx`(`postId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserPostSaved` ADD CONSTRAINT `UserPostSaved_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPostSaved` ADD CONSTRAINT `UserPostSaved_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserStorySaved` ADD CONSTRAINT `UserStorySaved_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserStorySaved` ADD CONSTRAINT `UserStorySaved_storyId_fkey` FOREIGN KEY (`storyId`) REFERENCES `Story`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Story` ADD CONSTRAINT `Story_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
