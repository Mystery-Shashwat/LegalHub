import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/guards";
import { prisma } from "../lib/prisma";

interface AuthRequest extends Request {
    user?: { userId: string; role: string; email: string };
}

export const referralRouter = Router();

// Get Current User's Referral Status
referralRouter.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                referralCode: true,
                walletBalance: true,
                referrals: {
                    select: { id: true }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({
            referralCode: user.referralCode,
            walletBalance: user.walletBalance,
            totalReferrals: user.referrals.length
        });

    } catch (error) {
        console.error("Get referral info error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get Referral Reward History
referralRouter.get("/history", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId;
        const rewards = await prisma.referralReward.findMany({
            where: { referrerId: userId },
            orderBy: { createdAt: "desc" },
            include: {
                referrer: { select: { name: true } } // Though this is the user themselves, kept for consistency
            }
        });

        res.json({ rewards });
    } catch (error) {
        console.error("Get referral history error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
