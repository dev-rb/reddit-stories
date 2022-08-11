-- CreateTable
CREATE TABLE `Reply` (
    `id` VARCHAR(191) NOT NULL,
    `body` LONGTEXT NOT NULL,
    `bodyHtml` LONGTEXT NOT NULL,
    `author` VARCHAR(191) NOT NULL,
    `score` INTEGER NOT NULL,
    `created` DATETIME(3) NOT NULL,
    `storyId` VARCHAR(191) NULL,
    `replyId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
