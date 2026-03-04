import { Router } from "express";
import { requireAdmin } from "../middleware/guards";
import { prisma } from "../lib/prisma";
import { Request, Response } from "express";
import { z } from "zod";

export const adminRouter = Router();

// 1. Get Platform Stats
adminRouter.get("/stats", requireAdmin, async (req: Request, res: Response) => {
    try {
        const totalClients = await prisma.user.count({ where: { role: "CLIENT" } });
        const totalLawyers = await prisma.lawyerProfile.count({ where: { status: "VERIFIED" } });
        const pendingLawyers = await prisma.lawyerProfile.count({ where: { status: "PENDING" } });
        const totalBookings = await prisma.booking.count();
        
        // Sum all payment commission amounts
        const payments = await prisma.payment.aggregate({
            _sum: { commissionAmount: true },
            where: { status: "PAID" }
        });

        res.json({
            stats: {
                clients: totalClients,
                verifiedLawyers: totalLawyers,
                pendingApprovals: pendingLawyers,
                bookings: totalBookings,
                revenue: payments._sum.commissionAmount || 0
            }
        });
    } catch (error) {
        console.error("Get admin stats error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// 2. List all pending lawyers
adminRouter.get("/lawyers/pending", requireAdmin, async (req: Request, res: Response) => {
    try {
        const pending = await prisma.lawyerProfile.findMany({
            where: { status: "PENDING" },
            include: { user: { select: { name: true, email: true, phone: true } } },
            orderBy: { createdAt: "desc" }
        });

        res.json({ lawyers: pending });
    } catch (error) {
        console.error("Fetch pending lawyers error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// 3. Approve or Reject Lawyer
const decisionSchema = z.object({
    status: z.enum(["VERIFIED", "REJECTED"]),
    rejectionReason: z.string().optional()
});

adminRouter.put("/lawyers/:id/decision", requireAdmin, async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const r = decisionSchema.safeParse(req.body);
        
        if (!r.success) return res.status(400).json({ errors: r.error.flatten().fieldErrors });

        const lawyer = await prisma.lawyerProfile.update({
            where: { id },
            data: {
                status: r.data.status,
                rejectionReason: r.data.status === "REJECTED" ? r.data.rejectionReason : null,
                verifiedAt: r.data.status === "VERIFIED" ? new Date() : null,
                verifiedByAdminId: r.data.status === "VERIFIED" ? req.user.userId : null
            }
        });

        res.json({ message: `Lawyer ${r.data.status.toLowerCase()} successfully`, lawyer });
    } catch (error) {
        console.error("Admin lawyer decision error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// 4. List all clients
adminRouter.get("/clients", requireAdmin, async (req: Request, res: Response) => {
    try {
        const clients = await prisma.user.findMany({
            where: { role: "CLIENT" },
            include: { clientProfile: true },
            orderBy: { createdAt: "desc" }
        });

        res.json({ clients });
    } catch (error) {
        console.error("Fetch clients error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// 5. List all disputes
adminRouter.get("/disputes", requireAdmin, async (req: Request, res: Response) => {
    try {
        const disputes = await prisma.dispute.findMany({
            include: { user: { select: { name: true, email: true, role: true } } },
            orderBy: { createdAt: "desc" }
        });

        res.json({ disputes });
    } catch (error) {
        console.error("Fetch disputes error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// 6. Resolve dispute
adminRouter.put("/disputes/:id/resolve", requireAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const dispute = await prisma.dispute.update({
            where: { id },
            data: { status: "RESOLVED" }
        });

        res.json({ message: "Dispute resolved successfully", dispute });
    } catch (error) {
        console.error("Resolve dispute error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

