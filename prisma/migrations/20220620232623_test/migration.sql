-- DropForeignKey
ALTER TABLE `Story` DROP FOREIGN KEY `Story_postId_fkey`;

-- DropForeignKey
ALTER TABLE `UserPostSaved` DROP FOREIGN KEY `UserPostSaved_postId_fkey`;

-- DropForeignKey
ALTER TABLE `UserPostSaved` DROP FOREIGN KEY `UserPostSaved_userId_fkey`;

-- DropForeignKey
ALTER TABLE `UserStorySaved` DROP FOREIGN KEY `UserStorySaved_storyId_fkey`;

-- DropForeignKey
ALTER TABLE `UserStorySaved` DROP FOREIGN KEY `UserStorySaved_userId_fkey`;
