/*
  Warnings:

  - A unique constraint covering the columns `[id,author]` on the table `Comment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Comment_id_author_key` ON `Comment`(`id`, `author`);
