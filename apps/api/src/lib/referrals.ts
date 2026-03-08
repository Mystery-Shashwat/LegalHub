import { prisma } from "./prisma";

export async function processReferralReward(userId: string, amount: number, reason: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { referredById: true }
        });

        if (!user || !user.referredById) return;

        // Check if a reward has already been issued for this referred user
        const existingReward = await prisma.referralReward.findUnique({
            where: { referredUserId: userId }
        });

        if (existingReward) return; // Only one reward per referred user

        // Issue reward
        await prisma.$transaction([
            prisma.referralReward.create({
                data: {
                    referrerId: user.referredById,
                    referredUserId: userId,
                    amount,
                    reason
                }
            }),
            prisma.user.update({
                where: { id: user.referredById },
                data: { walletBalance: { increment: amount } }
            })
        ]);

        console.log(`✅ Issued referral reward of ₹${amount} to user ${user.referredById} for referring ${userId}`);
    } catch (error) {
        console.error("Error processing referral reward:", error);
    }
}
