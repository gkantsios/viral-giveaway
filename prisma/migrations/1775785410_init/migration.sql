-- CreateTable users
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT 0,
    "name" TEXT,
    "image" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable accounts
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE
);

-- CreateTable sessions
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE
);

-- CreateTable verification_tokens
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable giveaways
CREATE TABLE "giveaways" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "prize" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "rules" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "startDate" DATETIME,
    "endDate" DATETIME,
    "winnerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "giveaways_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE,
    CONSTRAINT "giveaways_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "entries" ("id")
);

-- CreateTable entries
CREATE TABLE "entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "giveawayId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "referralCode" TEXT NOT NULL,
    "referredById" TEXT,
    "bonusEntries" INTEGER NOT NULL DEFAULT 0,
    "totalEntries" INTEGER NOT NULL DEFAULT 1,
    "emailVerified" BOOLEAN NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "entries_giveawayId_fkey" FOREIGN KEY ("giveawayId") REFERENCES "giveaways" ("id") ON DELETE CASCADE,
    CONSTRAINT "entries_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "entries" ("id")
);

-- CreateTable esp_connections
CREATE TABLE "esp_connections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "listId" TEXT,
    "settings" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "esp_connections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "giveaways_slug_key" ON "giveaways"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "giveaways_winnerId_key" ON "giveaways"("winnerId");

-- CreateIndex
CREATE UNIQUE INDEX "entries_referralCode_key" ON "entries"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "entries_giveawayId_email_key" ON "entries"("giveawayId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "esp_connections_userId_provider_key" ON "esp_connections"("userId", "provider");
