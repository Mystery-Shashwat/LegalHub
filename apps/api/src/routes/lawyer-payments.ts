import { Router } from "express";
import { requireVerifiedLawyer } from "../middleware/guards";
import { prisma } from "../lib/prisma";
import { Request, Response } from "express";

interface AuthRequest extends Request {
    user?: { userId: string; role: string; email: string };
}

export const lawyerPaymentRouter = Router();

// 1. Get Earnings History for a Lawyer
lawyerPaymentRouter.get("/lawyer", requireVerifiedLawyer, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId;
        
        const profile = await prisma.lawyerProfile.findUnique({
            where: { userId }
        });
        
        if (!profile) return res.status(404).json({ error: "Profile not found" });

        // Fetch all payments linked to this lawyer's bookings
        const payments = await prisma.payment.findMany({
            where: {
                booking: {
                    lawyerProfileId: profile.id
                }
            },
            include: {
                booking: {
                    select: {
                        scheduledAt: true,
                        client: { select: { name: true } }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        res.json({ payments });
    } catch (error) {
        console.error("Fetch earnings error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
