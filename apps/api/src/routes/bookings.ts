import { Router } from "express";
import { requireAuth, requireClient } from "../middleware/guards";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { Request, Response } from "express";

// Extend express Request to include user
interface AuthRequest extends Request {
    user?: { userId: string; role: string; email: string };
}

export const bookingRouter = Router();

// 1. Get List of Bookings (Depends on Role)
bookingRouter.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId;
        const role = req.user!.role;

        let bookings;
        if (role === "CLIENT") {
            bookings = await prisma.booking.findMany({
                where: { clientId: userId },
                include: { lawyer: { include: { user: { select: { id: true, name: true, email: true } } } } },
                orderBy: { scheduledAt: "desc" }
            });
        } else if (role === "LAWYER") {
            const profile = await prisma.lawyerProfile.findUnique({ where: { userId } });
            if (!profile) return res.status(404).json({ error: "Lawyer profile not found" });

            bookings = await prisma.booking.findMany({
                where: { lawyerProfileId: profile.id },
                include: { client: { select: { id: true, name: true, email: true } } },
                orderBy: { scheduledAt: "desc" }
            });
        } else {
            return res.status(403).json({ error: "Invalid role for bookings" });
        }

        res.json({ bookings });
    } catch (error) {
        console.error("Get bookings error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// 2. Create Booking (Clients Only)
const createBookingSchema = z.object({
    lawyerProfileId: z.string(),
    scheduledAt: z.string().datetime(), // ISO string
    durationMinutes: z.number().default(60),
    type: z.enum(["video", "chat", "in-person"]).default("video"),
    clientNotes: z.string().optional()
});

bookingRouter.post("/", requireClient, async (req: AuthRequest, res: Response) => {
    try {
        const r = createBookingSchema.safeParse(req.body);
        if (!r.success) return res.status(400).json({ errors: r.error.flatten().fieldErrors });

        const lawyer = await prisma.lawyerProfile.findUnique({ where: { id: r.data.lawyerProfileId } });
        if (!lawyer) return res.status(404).json({ error: "Lawyer not found" });

        const amount = r.data.durationMinutes * (lawyer.hourlyRate / 60);

        const booking = await prisma.booking.create({
            data: {
                clientId: req.user!.userId,
                lawyerProfileId: r.data.lawyerProfileId,
                scheduledAt: new Date(r.data.scheduledAt),
                durationMinutes: r.data.durationMinutes,
                type: r.data.type,
                amount: amount,
                clientNotes: r.data.clientNotes,
                status: "PENDING"
            }
        });

        res.status(201).json({ message: "Booking created", booking });
    } catch (error) {
        console.error("Create booking error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// 3. Update Booking Status (Lawyers and Admins)
const updateStatusSchema = z.object({
    status: z.enum(["CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW", "PENDING"])
});

bookingRouter.put("/:id/status", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const r = updateStatusSchema.safeParse(req.body);
        if (!r.success) return res.status(400).json({ errors: r.error.flatten().fieldErrors });

        const booking = await prisma.booking.findUnique({ where: { id }, include: { lawyer: true } });
        if (!booking) return res.status(404).json({ error: "Booking not found" });

        // Authorization checks
        if (req.user!.role === "LAWYER" && booking.lawyer.userId !== req.user!.userId) {
            return res.status(403).json({ error: "Cannot modify a booking that belongs to another lawyer." });
        } else if (req.user!.role === "CLIENT" && r.data.status !== "CANCELLED") {
             // Clients can only cancel
             if (booking.clientId !== req.user!.userId) {
                 return res.status(403).json({ error: "Cannot cancel a booking that is not yours."});
             }
        }

        const updated = await prisma.booking.update({
            where: { id },
            data: { status: r.data.status }
        });

        res.json({ message: "Booking updated", booking: updated });
    } catch (error) {
        console.error("Update booking status error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
