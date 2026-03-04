import { Router } from "express";
import { requireAuth } from "../middleware/guards";
import { prisma } from "../lib/prisma";
import { Request, Response } from "express";
import { z } from "zod";

interface AuthRequest extends Request {
    user?: { userId: string; role: string; email: string };
}

export const caseRouter = Router();

// 1. Get Cases (Depends on Role)
caseRouter.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId;
        const role = req.user!.role;

        let cases;
        if (role === "CLIENT") {
            cases = await prisma.case.findMany({
                where: { clientId: userId },
                include: { lawyer: { include: { user: { select: { name: true } } } } },
                orderBy: { updatedAt: "desc" }
            });
        } else if (role === "LAWYER") {
            const profile = await prisma.lawyerProfile.findUnique({ where: { userId } });
            if (!profile) return res.status(404).json({ error: "Lawyer profile not found" });

            cases = await prisma.case.findMany({
                where: { lawyerProfileId: profile.id },
                include: { booking: { include: { client: { select: { name: true } } } } },
                orderBy: { updatedAt: "desc" }
            });
        } else {
            return res.status(403).json({ error: "Invalid role for cases" });
        }

        res.json({ cases });
    } catch (error) {
        console.error("Get cases error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// 2. Create a Case (Lawyers only - usually from a Confirmed Booking)
const createCaseSchema = z.object({
    bookingId: z.string(),
    title: z.string().min(3),
    description: z.string().optional(),
    practiceArea: z.string()
});

caseRouter.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        if (req.user!.role !== "LAWYER") return res.status(403).json({ error: "Only lawyers can create cases."});

        const r = createCaseSchema.safeParse(req.body);
        if (!r.success) return res.status(400).json({ errors: r.error.flatten().fieldErrors });

        const lawyerProfile = await prisma.lawyerProfile.findUnique({ where: { userId: req.user!.userId }});
        if (!lawyerProfile) return res.status(404).json({ error: "Profile not found" });

        const booking = await prisma.booking.findUnique({ where: { id: r.data.bookingId }});
        if (!booking || booking.lawyerProfileId !== lawyerProfile.id) {
            return res.status(403).json({ error: "Invalid booking ID for this lawyer." });
        }

        const newCase = await prisma.case.create({
            data: {
                bookingId: r.data.bookingId,
                clientId: booking.clientId,
                lawyerProfileId: lawyerProfile.id,
                title: r.data.title,
                description: r.data.description,
                practiceArea: r.data.practiceArea,
                status: "OPEN"
            }
        });

        res.status(201).json({ message: "Case created", case: newCase });
    } catch (error) {
        console.error("Create case error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// 3. Get Single Case Details
caseRouter.get("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const caseRecord = await prisma.case.findUnique({
            where: { id },
            include: { 
                documents: true,
                lawyer: { include: { user: { select: { name: true, email: true } } } },
                booking: { include: { client: { select: { name: true, email: true } } } }
            }
        });

        if (!caseRecord) return res.status(404).json({ error: "Case not found" });

        // Authorization Guard
        if (req.user!.role === "CLIENT" && caseRecord.clientId !== req.user!.userId) {
             return res.status(403).json({ error: "Not authorized to view this case."});
        }
        if (req.user!.role === "LAWYER") {
            const profile = await prisma.lawyerProfile.findUnique({ where: { userId: req.user!.userId } });
            if (caseRecord.lawyerProfileId !== profile?.id) {
                return res.status(403).json({ error: "Not authorized to view this case."});
            }
        }

        res.json({ case: caseRecord });
    } catch (error) {
        console.error("Fetch case error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
