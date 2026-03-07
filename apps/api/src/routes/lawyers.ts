import { Router } from "express";
import { requireAuth, requireVerifiedLawyer } from "../middleware/guards";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { Request, Response } from "express";

// Extend express Request to include user
interface AuthRequest extends Request {
    user?: { userId: string; role: string; email: string };
}

export const lawyerRouter = Router();

// 1. Get List of Verified Lawyers (Public Search)
lawyerRouter.get("/", async (req, res) => {
    try {
        const { city, specialization, search } = req.query;
        
        const filter: any = { status: "VERIFIED" };
        if (city) filter.city = { contains: city as string, mode: "insensitive" };
        if (specialization) filter.specializations = { has: specialization as string };
        if (search) {
            filter.OR = [
                { user: { name: { contains: search as string, mode: "insensitive" } } },
                { bio: { contains: search as string, mode: "insensitive" } },
            ];
        }

        const lawyers = await prisma.lawyerProfile.findMany({
            where: filter,
            take: 50,
            select: {
                id: true,
                specializations: true,
                experienceYears: true,
                city: true,
                state: true,
                languages: true,
                hourlyRate: true,
                avgRating: true,
                totalReviews: true,
                freeConsultation: true,
                user: { select: { name: true, avatar: true } }
            }
        });

        res.json({ lawyers });
    } catch (error) {
        console.error("Get lawyers error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// 2. Get Authenticated Lawyer Profile
lawyerRouter.get("/me", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const profile = await prisma.lawyerProfile.findUnique({
            where: { userId: req.user!.userId },
            include: { user: { select: { name: true, email: true, phone: true } }, availability: true }
        });

        if (!profile) return res.status(404).json({ error: "Profile not found" });
        res.json({ profile });
    } catch (error) {
        console.error("Get lawyer me error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// 3. Update Lawyer Profile (Bio, Rates, etc)
const updateSchema = z.object({
    bio: z.string().optional(),
    hourlyRate: z.number().optional(),
    freeConsultation: z.boolean().optional(),
    freeConsultMinutes: z.number().optional(),
    languages: z.array(z.string()).optional(),
    specializations: z.array(z.string()).optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    courtsOfPractice: z.array(z.string()).optional(),
    experienceYears: z.number().optional(),
    linkedinUrl: z.string().optional(),
    websiteUrl: z.string().optional(),
    degreeCollege: z.string().optional(),
    degreeYear: z.number().optional()
});

lawyerRouter.put("/me", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const r = updateSchema.safeParse(req.body);
        if (!r.success) return res.status(400).json({ errors: r.error.flatten().fieldErrors });

        const profile = await prisma.lawyerProfile.update({
            where: { userId: req.user!.userId },
            data: r.data
        });

        res.json({ message: "Profile updated successfully", profile });
    } catch (error) {
        console.error("Update lawyer profile error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// 4. Update Availability Schedule
const availabilitySchema = z.object({
    slots: z.array(z.object({
        dayOfWeek: z.number().min(0).max(6),
        startTime: z.string(),
        endTime: z.string(),
        isActive: z.boolean()
    }))
});

lawyerRouter.put("/me/availability", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const r = availabilitySchema.safeParse(req.body);
        if (!r.success) return res.status(400).json({ errors: r.error.flatten().fieldErrors });

        const profile = await prisma.lawyerProfile.findUnique({ where: { userId: req.user!.userId } });
        if (!profile) return res.status(404).json({ error: "Profile not found" });

        // Delete old availability and insert new ones
        await prisma.availability.deleteMany({ where: { lawyerProfileId: profile.id } });
        
        const created = await prisma.availability.createMany({
            data: r.data.slots.map(s => ({
                lawyerProfileId: profile.id,
                ...s
            }))
        });

        res.json({ message: "Availability updated successfully", count: created.count });
    } catch (error) {
        console.error("Update availability error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// 5. Get Public Lawyer Profile by ID 
lawyerRouter.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        
        const lawyer = await prisma.lawyerProfile.findUnique({
            where: { id },
            include: { 
                user: { select: { name: true, avatar: true, email: true } },
                availability: true,
                reviews: { include: { client: { select: { name: true } } } }
            }
        });

        if (!lawyer) return res.status(404).json({ error: "Lawyer not found" });

        res.json({ lawyer });
    } catch (error) {
        console.error("Get lawyer error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
