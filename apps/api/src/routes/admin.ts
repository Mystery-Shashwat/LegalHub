import { Router } from "express";
import { requireAdmin, requireAuth } from "../middleware/guards";
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

// 5b. Submit a dispute (client or lawyer)
adminRouter.post("/disputes", requireAuth, async (req: any, res: Response) => {
    try {
        const { reason, description, bookingId } = req.body;
        if (!reason || !description || description.trim().length < 20) {
            return res.status(400).json({ error: "reason and description (min 20 chars) are required" });
        }

        const dispute = await prisma.dispute.create({
            data: {
                userId: req.user.userId,
                reason,
                description: description.trim()
            }
        });

        // Notify admin
        const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
        if (admins.length > 0) {
            await prisma.notification.create({
                data: {
                    userId: admins[0].id,
                    type: "SYSTEM",
                    title: "New Dispute Submitted",
                    body: `A user has raised a dispute: "${reason}"`,
                    link: "/admin/disputes"
                }
            });
        }

        res.status(201).json({ dispute, message: "Dispute submitted. Our team will review within 48 hours." });
    } catch (error) {
        console.error("Submit dispute error:", error);
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

// 7. Suspend / ban a user
adminRouter.put("/users/:id/ban", requireAdmin, async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const { banned, reason } = req.body;

        const user = await prisma.user.update({
            where: { id },
            data: { isActive: !banned }
        });

        // Notify the user
        await prisma.notification.create({
            data: {
                userId: id,
                type: "SYSTEM",
                title: banned ? "Account Suspended" : "Account Reinstated",
                body: banned
                    ? `Your account has been suspended. Reason: ${reason || "Policy violation"}. Contact support@legalhub.in to appeal.`
                    : "Your account has been reinstated. You can now access all features."
            }
        });

        res.json({ message: `User ${banned ? "suspended" : "reinstated"} successfully`, user });
    } catch (error) {
        console.error("Ban user error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// 8. List pending payouts (lawyers with completed paid bookings awaiting settlement)
adminRouter.get("/payouts/pending", requireAdmin, async (req: Request, res: Response) => {
    try {
        // Group completed paid bookings by lawyer that have pending payout
        const lawyers = await prisma.lawyerProfile.findMany({
            where: {
                bookings: {
                    some: { status: "COMPLETED", isPaid: true, payment: { status: "PAID" } }
                }
            },
            include: {
                user: { select: { name: true, email: true } },
                bookings: {
                    where: { status: "COMPLETED", isPaid: true, payment: { status: "PAID" } },
                    include: { payment: true }
                }
            }
        });

        const payouts = lawyers.map(l => ({
            lawyerProfileId: l.id,
            lawyerName: l.user.name,
            lawyerEmail: l.user.email,
            totalPending: l.bookings.reduce((sum, b) => sum + (b.payment?.lawyerPayout ?? 0), 0),
            sessionCount: l.bookings.length
        }));

        res.json({ payouts, total: payouts.length });
    } catch (error) {
        console.error("Pending payouts error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// 9. Process (mark processed) a payout
adminRouter.post("/payouts/:lawyerProfileId/process", requireAdmin, async (req: any, res: Response) => {
    try {
        const { lawyerProfileId } = req.params;
        const { amount, transactionId } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: "Valid amount required" });
        }

        // In production: trigger Razorpay fund transfer
        // For now: notify the lawyer
        const lawyer = await prisma.lawyerProfile.findUnique({
            where: { id: lawyerProfileId },
            select: { userId: true, user: { select: { name: true } } }
        });
        if (!lawyer) return res.status(404).json({ error: "Lawyer not found" });

        await prisma.notification.create({
            data: {
                userId: lawyer.userId,
                type: "PAYMENT",
                title: "Payout Processed",
                body: `₹${amount} has been transferred to your account. Ref: ${transactionId || "LEGALHUB-" + Date.now()}`,
                link: "/lawyer/earnings"
            }
        });

        res.json({ message: `Payout of ₹${amount} processed for ${lawyer.user.name}` });
    } catch (error) {
        console.error("Process payout error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
