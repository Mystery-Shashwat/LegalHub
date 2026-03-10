-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'LAWYER', 'CLIENT');

-- CreateEnum
CREATE TYPE "LawyerStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'ON_HOLD', 'CLOSED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'REFUNDED', 'FAILED');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'RESOLVED');

-- CreateEnum
CREATE TYPE "LawyerPlan" AS ENUM ('FREE', 'BASIC', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "NotifType" AS ENUM ('BOOKING', 'PAYMENT', 'MESSAGE', 'CASE', 'REVIEW', 'REFERRAL', 'SYSTEM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CLIENT',
    "avatar" TEXT,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "referralCode" TEXT NOT NULL,
    "referredById" TEXT,
    "walletBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "about" TEXT,

    CONSTRAINT "ClientProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LawyerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "barCouncilNumber" TEXT NOT NULL,
    "barCouncilState" TEXT NOT NULL,
    "enrollmentYear" INTEGER NOT NULL,
    "degreeCollege" TEXT,
    "degreeYear" INTEGER,
    "specializations" TEXT[],
    "courtsOfPractice" TEXT[],
    "experienceYears" INTEGER NOT NULL DEFAULT 0,
    "bio" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "languages" TEXT[],
    "hourlyRate" DOUBLE PRECISION NOT NULL,
    "freeConsultation" BOOLEAN NOT NULL DEFAULT false,
    "freeConsultMinutes" INTEGER NOT NULL DEFAULT 0,
    "status" "LawyerStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "verifiedByAdminId" TEXT,
    "certificateOfPracticeUrl" TEXT,
    "degreeDocumentUrl" TEXT,
    "govtIdUrl" TEXT,
    "profilePhotoUrl" TEXT,
    "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "linkedinUrl" TEXT,
    "websiteUrl" TEXT,
    "plan" "LawyerPlan" NOT NULL DEFAULT 'FREE',
    "planExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LawyerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Availability" (
    "id" TEXT NOT NULL,
    "lawyerProfileId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "lawyerProfileId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 60,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "type" TEXT NOT NULL DEFAULT 'video',
    "amount" DOUBLE PRECISION NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paymentId" TEXT,
    "meetingUrl" TEXT,
    "clientNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "commissionAmount" DOUBLE PRECISION NOT NULL,
    "lawyerPayout" DOUBLE PRECISION NOT NULL,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "lawyerProfileId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "lawyerReply" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT,
    "clientId" TEXT NOT NULL,
    "lawyerProfileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "practiceArea" TEXT NOT NULL,
    "status" "CaseStatus" NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "signatureHash" TEXT,
    "signedAt" TIMESTAMP(3),
    "signerIp" TEXT,
    "signerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "fileUrl" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dispute" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookingId" TEXT,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumQuestion" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForumQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumAnswer" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "isAccepted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForumAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RTIApplication" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "authorityName" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "filedAt" TIMESTAMP(3),
    "documentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RTIApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentTemplate" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "previewUrl" TEXT,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplatePurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "amountPaid" DOUBLE PRECISION NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplatePurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralReward" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "referredUserId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReferralReward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotifType" NOT NULL DEFAULT 'SYSTEM',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Blog" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Legal Insights',
    "tags" TEXT[],
    "coverImage" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Blog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogComment" (
    "id" TEXT NOT NULL,
    "blogId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OTPCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OTPCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "ClientProfile_userId_key" ON "ClientProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LawyerProfile_userId_key" ON "LawyerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LawyerProfile_barCouncilNumber_key" ON "LawyerProfile"("barCouncilNumber");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_bookingId_key" ON "Payment"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_bookingId_key" ON "Review"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "Case_bookingId_key" ON "Case"("bookingId");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "Dispute_bookingId_key" ON "Dispute"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "ReferralReward_referredUserId_key" ON "ReferralReward"("referredUserId");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_token_key" ON "PasswordReset"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Blog_slug_key" ON "Blog"("slug");

-- CreateIndex
CREATE INDEX "Blog_slug_idx" ON "Blog"("slug");

-- CreateIndex
CREATE INDEX "Blog_isPublished_createdAt_idx" ON "Blog"("isPublished", "createdAt");

-- CreateIndex
CREATE INDEX "OTPCode_userId_purpose_idx" ON "OTPCode"("userId", "purpose");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientProfile" ADD CONSTRAINT "ClientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LawyerProfile" ADD CONSTRAINT "LawyerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_lawyerProfileId_fkey" FOREIGN KEY ("lawyerProfileId") REFERENCES "LawyerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_lawyerProfileId_fkey" FOREIGN KEY ("lawyerProfileId") REFERENCES "LawyerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_lawyerProfileId_fkey" FOREIGN KEY ("lawyerProfileId") REFERENCES "LawyerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_lawyerProfileId_fkey" FOREIGN KEY ("lawyerProfileId") REFERENCES "LawyerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumQuestion" ADD CONSTRAINT "ForumQuestion_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumAnswer" ADD CONSTRAINT "ForumAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ForumQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumAnswer" ADD CONSTRAINT "ForumAnswer_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RTIApplication" ADD CONSTRAINT "RTIApplication_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplatePurchase" ADD CONSTRAINT "TemplatePurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplatePurchase" ADD CONSTRAINT "TemplatePurchase_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralReward" ADD CONSTRAINT "ReferralReward_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogComment" ADD CONSTRAINT "BlogComment_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogComment" ADD CONSTRAINT "BlogComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTPCode" ADD CONSTRAINT "OTPCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
