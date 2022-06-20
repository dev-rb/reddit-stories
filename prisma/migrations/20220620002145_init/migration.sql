-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPostSaved" (
    "liked" BOOLEAN NOT NULL,
    "favorited" BOOLEAN NOT NULL,
    "readLater" BOOLEAN NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL,
    "score" INTEGER NOT NULL,
    "author" TEXT NOT NULL,
    "permalink" TEXT NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserStorySaved" (
    "liked" BOOLEAN NOT NULL,
    "favorited" BOOLEAN NOT NULL,
    "readLated" BOOLEAN NOT NULL,
    "storyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "bodyHtml" TEXT NOT NULL,
    "permalink" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "author" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL,
    "postId" TEXT,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserPostSaved_userId_postId_key" ON "UserPostSaved"("userId", "postId");

-- CreateIndex
CREATE UNIQUE INDEX "UserStorySaved_userId_storyId_key" ON "UserStorySaved"("userId", "storyId");

-- AddForeignKey
ALTER TABLE "UserPostSaved" ADD CONSTRAINT "UserPostSaved_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPostSaved" ADD CONSTRAINT "UserPostSaved_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStorySaved" ADD CONSTRAINT "UserStorySaved_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStorySaved" ADD CONSTRAINT "UserStorySaved_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
